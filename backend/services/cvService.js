const { pool } = require('../config/database');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class CVService {
    /**
     * Çoklu CV dosyası yükleme
     */
    async uploadCVs(files, jobPostId, senderInfo) {
        try {
            if (!files || files.length === 0) {
                return {
                    success: false,
                    message: 'CV dosyası seçilmedi.'
                };
            }

            if (!jobPostId) {
                return {
                    success: false,
                    message: 'İş ilanı seçilmedi.'
                };
            }

            console.log(`${files.length} adet CV dosyası yükleniyor...`);
            const uploadedCVs = [];

            // Her dosyayı sırayla veritabanına ekle
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`CV ${i + 1}/${files.length} yükleniyor: ${file.originalname || 'Bilinmeyen dosya'}`);
                const cvBuffer = file.buffer;
                const cvDate = new Date();
                
                // Dosya adından başvuran bilgisini çıkar (.pdf, .doc, .docx uzantılarını kaldır)
                let applicantInfo = senderInfo;
                if (!applicantInfo && file.originalname) {
                    // Dosya adından uzantıyı kaldır
                    applicantInfo = file.originalname
                        .replace(/\.(pdf|doc|docx)$/i, '')
                        .trim();
                }
                
                // Eğer hala boşsa varsayılan değer kullan
                if (!applicantInfo || applicantInfo === '') {
                    applicantInfo = 'Bilinmiyor';
                }

                const result = await pool.query(`
                    INSERT INTO cv (cvsenderinfo, cvdate, cvitself, jobpostid, checked, cvscore, aicontext)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING cvid, cvsenderinfo, cvdate, jobpostid, checked
                `, [
                    applicantInfo,
                    cvDate,
                    cvBuffer,
                    jobPostId,
                    false, // checked = false (henüz analiz edilmedi)
                    null,  // cvscore = null (henüz puanlanmadı)
                    null   // aicontext = null (henüz yorum yok)
                ]);

                uploadedCVs.push(result.rows[0]);
            }

            return {
                success: true,
                message: `${uploadedCVs.length} adet CV başarıyla yüklendi.`,
                cvs: uploadedCVs
            };

        } catch (error) {
            console.error('CVService Upload Error:', error);
            throw new Error('CV yüklenirken hata oluştu: ' + error.message);
        }
    }

    /**
     * JobPost'a göre CV listesi getir
     */
    async getCVsByJobPost(jobPostId) {
        try {
            if (!jobPostId) {
                return {
                    success: false,
                    message: 'İş ilanı ID\'si gerekli.'
                };
            }

            const result = await pool.query(`
                SELECT 
                    cvid,
                    cvsenderinfo,
                    cvdate,
                    cvscore,
                    checked,
                    aicontext,
                    jobpostid
                FROM cv
                WHERE jobpostid = $1
                ORDER BY cvdate DESC
            `, [jobPostId]);

            return {
                success: true,
                cvs: result.rows
            };

        } catch (error) {
            console.error('CVService GetCVsByJobPost Error:', error);
            throw new Error('CV listesi getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * JobPost'a göre analiz edilmemiş CV'leri getir
     */
    async getUncheckedCVsByJobPost(jobPostId) {
        try {
            if (!jobPostId) {
                return {
                    success: false,
                    message: 'İş ilanı ID\'si gerekli.'
                };
            }

            const result = await pool.query(`
                SELECT 
                    cvid,
                    cvsenderinfo,
                    cvdate,
                    cvitself,
                    jobpostid
                FROM cv
                WHERE jobpostid = $1 AND checked = false
                ORDER BY cvdate ASC
            `, [jobPostId]);

            return {
                success: true,
                cvs: result.rows
            };

        } catch (error) {
            console.error('CVService GetUncheckedCVsByJobPost Error:', error);
            throw new Error('Analiz edilmemiş CV listesi getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * CV buffer'ından text içeriğini çıkar (PDF veya DOCX)
     */
    async extractCVText(cvBuffer, fileName = '') {
        try {
            const fileNameLower = fileName.toLowerCase();
            
            // Dosya tipini tespit et (öncelikle dosya adına bak)
            const isPDF = fileNameLower.endsWith('.pdf') || 
                         (fileName === '' && cvBuffer.slice(0, 4).toString() === '%PDF');
            const isDOCX = fileNameLower.endsWith('.docx') || 
                          (fileName === '' && cvBuffer.slice(0, 2).toString() === 'PK');
            const isDOC = fileNameLower.endsWith('.doc');

            let cvText = '';

            if (isPDF) {
                // PDF dosyasını parse et
                try {
                    const pdfData = await pdfParse(cvBuffer);
                    cvText = pdfData.text;
                    console.log(`PDF içeriği çıkarıldı: ${cvText.length} karakter`);
                } catch (pdfError) {
                    console.error('PDF parse hatası:', pdfError);
                    throw new Error('PDF dosyası okunamadı: ' + pdfError.message);
                }
            } else if (isDOCX) {
                // DOCX dosyasını parse et
                try {
                    const result = await mammoth.extractRawText({ buffer: cvBuffer });
                    cvText = result.value;
                    console.log(`DOCX içeriği çıkarıldı: ${cvText.length} karakter`);
                    
                    // Eğer mammoth uyarıları varsa logla
                    if (result.messages && result.messages.length > 0) {
                        console.warn('DOCX parse uyarıları:', result.messages);
                    }
                } catch (docxError) {
                    console.error('DOCX parse hatası:', docxError);
                    throw new Error('DOCX dosyası okunamadı: ' + docxError.message);
                }
            } else if (isDOC) {
                // Eski DOC formatı için (mammoth DOCX'i destekler ama eski DOC'u desteklemez)
                throw new Error('Eski DOC formatı (.doc) desteklenmiyor. Lütfen DOCX formatında yükleyin.');
            } else {
                // Dosya tipi tespit edilemedi, PDF olarak deneyelim
                console.warn('Dosya tipi tespit edilemedi, PDF olarak deneniyor...');
                try {
                    const pdfData = await pdfParse(cvBuffer);
                    cvText = pdfData.text;
                    console.log(`PDF içeriği çıkarıldı: ${cvText.length} karakter`);
                } catch (pdfError) {
                    throw new Error('Desteklenmeyen dosya formatı veya dosya bozuk. Sadece PDF ve DOCX dosyaları desteklenir.');
                }
            }

            // CV içeriği boşsa hata ver
            if (!cvText || cvText.trim().length === 0) {
                throw new Error('CV dosyası boş veya içerik çıkarılamadı. Dosya formatını kontrol edin.');
            }

            // CV içeriğini temizle ve kısalt (çok uzunsa)
            cvText = cvText.trim();
            
            // Gereksiz boşlukları temizle
            cvText = cvText.replace(/\s+/g, ' ');
            
            if (cvText.length > 10000) {
                cvText = cvText.substring(0, 10000) + '... (içerik kısaltıldı)';
            }

            return cvText;

        } catch (error) {
            console.error('CV text extraction error:', error);
            throw error;
        }
    }

    /**
     * CV'yi OpenAI ile analiz et ve güncelle
     */
    async analyzeCVWithAI(cvId, cvBuffer, jobPostExpectations, fileName = '') {
        try {
            if (!process.env.OPENAI_API_KEY) {
                return {
                    success: false,
                    message: 'OpenAI API anahtarı bulunamadı.'
                };
            }

            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });

            // CV içeriğini çıkar
            let cvText;
            try {
                cvText = await this.extractCVText(cvBuffer, fileName);
            } catch (extractError) {
                // CV içeriği çıkarılamazsa hata döndür
                console.error(`CV ${cvId} içerik çıkarma hatası:`, extractError);
                
                // Veritabanında hata durumunu kaydet
                await pool.query(`
                    UPDATE cv
                    SET checked = $1,
                        aicontext = $2,
                        cvscore = $3
                    WHERE cvid = $4
                `, [
                    true,
                    `Hata: ${extractError.message}`,
                    0,
                    cvId
                ]);

                return {
                    success: false,
                    message: extractError.message || 'CV içeriği çıkarılamadı.'
                };
            }

            // Prompt oluştur
            const prompt = `Sen bir CV analiz uzmanısın. Aşağıdaki CV dosyasını analiz et ve JSON formatında cevap ver.

İş ilanı beklentileri:
${jobPostExpectations || 'Belirtilmemiş'}

CV analizi için şu kriterleri göz önünde bulundur:
1. İş ilanı beklentilerine uygunluk
2. Deneyim ve beceriler
3. Eğitim geçmişi
4. Genel uygunluk

Cevabın MUTLAKA şu JSON formatında olmalı:
{
    "score": 0-100 arası bir puan (integer),
    "comment": "CV hakkında detaylı yorum (string)"
}

Sadece JSON formatında cevap ver, başka bir şey ekleme.`;

            // OpenAI API'ye istek gönder
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Sen bir CV analiz uzmanısın. CV'leri analiz edip JSON formatında puan ve yorum döndürüyorsun."
                    },
                    {
                        role: "user",
                        content: prompt + "\n\nCV İçeriği:\n" + cvText
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 1000
            });

            const responseText = completion.choices[0].message.content;
            let analysisResult;

            try {
                analysisResult = JSON.parse(responseText);
                
                // Score ve comment kontrolü
                if (typeof analysisResult.score !== 'number' || analysisResult.score < 0 || analysisResult.score > 100) {
                    console.warn(`CV ${cvId}: Geçersiz score değeri, varsayılan 50 kullanılıyor`);
                    analysisResult.score = 50;
                }
                
                if (!analysisResult.comment || typeof analysisResult.comment !== 'string') {
                    console.warn(`CV ${cvId}: Comment eksik veya geçersiz`);
                    analysisResult.comment = 'CV analiz edildi ancak yorum oluşturulamadı.';
                }

            } catch (parseError) {
                console.error(`CV ${cvId} JSON parse hatası:`, parseError);
                console.error('Response text:', responseText);
                
                // Eğer JSON parse edilemezse, response'dan score ve comment'i çıkarmaya çalış
                const scoreMatch = responseText.match(/"score"\s*:\s*(\d+)/);
                const commentMatch = responseText.match(/"comment"\s*:\s*"([^"]+)"/);
                
                analysisResult = {
                    score: scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 50,
                    comment: commentMatch ? commentMatch[1] : (responseText || 'CV analiz edildi ancak yorum oluşturulamadı.')
                };
            }

            // CV'yi veritabanında güncelle
            const updateResult = await pool.query(`
                UPDATE cv
                SET cvscore = $1,
                    aicontext = $2,
                    checked = $3
                WHERE cvid = $4
                RETURNING *
            `, [
                analysisResult.score || 0,
                analysisResult.comment || 'Analiz tamamlandı.',
                true,
                cvId
            ]);

            return {
                success: true,
                message: 'CV analizi tamamlandı.',
                cv: updateResult.rows[0],
                analysis: {
                    score: analysisResult.score,
                    comment: analysisResult.comment
                }
            };

        } catch (error) {
            console.error('CVService AnalyzeCVWithAI Error:', error);
            
            // Hata durumunda CV'yi checked olarak işaretle ve hata mesajını kaydet
            try {
                await pool.query(`
                    UPDATE cv
                    SET checked = $1,
                        aicontext = $2,
                        cvscore = $3
                    WHERE cvid = $4
                `, [
                    true,
                    `Hata: ${error.message}`,
                    0,
                    cvId
                ]);
            } catch (dbError) {
                console.error('CV güncelleme hatası:', dbError);
            }
            
            throw new Error('CV analizi yapılırken hata oluştu: ' + error.message);
        }
    }

    /**
     * Tek bir CV'yi analiz et (ID'ye göre)
     */
    async analyzeSingleCV(cvId) {
        try {
            // CV'yi getir
            const cvResult = await pool.query(`
                SELECT 
                    cvid,
                    cvsenderinfo,
                    cvdate,
                    cvitself,
                    jobpostid,
                    checked
                FROM cv
                WHERE cvid = $1
            `, [cvId]);

            if (cvResult.rows.length === 0) {
                return {
                    success: false,
                    message: 'CV bulunamadı.'
                };
            }

            const cv = cvResult.rows[0];

            // Zaten analiz edilmişse
            if (cv.checked) {
                return {
                    success: false,
                    message: 'Bu CV daha önce analiz edilmiş.'
                };
            }

            // JobPost'u getir (expectations için)
            const jobPostResult = await pool.query(`
                SELECT jobpostid, expectations
                FROM jobposts
                WHERE jobpostid = $1
            `, [cv.jobpostid]);

            if (jobPostResult.rows.length === 0) {
                return {
                    success: false,
                    message: 'İş ilanı bulunamadı.'
                };
            }

            const jobPost = jobPostResult.rows[0];

            // Dosya adını oluştur (cvsenderinfo'dan veya varsayılan)
            // Eğer cvsenderinfo dosya adı formatındaysa (örn: "Ahmet_Yilmaz_CV"), uzantı ekle
            let fileName = cv.cvsenderinfo || 'cv';
            // Eğer uzantı yoksa, buffer'dan tip tespit et ve ekle
            if (!fileName.match(/\.(pdf|doc|docx)$/i)) {
                const bufferStart = cv.cvitself.slice(0, 4).toString();
                if (bufferStart === '%PDF') {
                    fileName += '.pdf';
                } else if (bufferStart === 'PK\x03\x04') {
                    fileName += '.docx';
                } else {
                    fileName += '.pdf'; // Varsayılan PDF
                }
            }

            // CV'yi analiz et
            const analysisResult = await this.analyzeCVWithAI(
                cv.cvid,
                cv.cvitself,
                jobPost.expectations,
                fileName
            );

            return {
                success: true,
                message: 'CV analizi tamamlandı.',
                cv: analysisResult.cv,
                analysis: analysisResult.analysis
            };

        } catch (error) {
            console.error('CVService AnalyzeSingleCV Error:', error);
            throw new Error('CV analizi yapılırken hata oluştu: ' + error.message);
        }
    }

    /**
     * JobPost'a göre tüm analiz edilmemiş CV'leri ID'ye göre sırayla analiz et
     */
    async analyzeAllUncheckedCVs(jobPostId) {
        try {
            // Önce jobpost'u getir (expectations için)
            const jobPostResult = await pool.query(`
                SELECT jobpostid, expectations
                FROM jobposts
                WHERE jobpostid = $1
            `, [jobPostId]);

            if (jobPostResult.rows.length === 0) {
                return {
                    success: false,
                    message: 'İş ilanı bulunamadı.'
                };
            }

            // Analiz edilmemiş CV'leri ID'ye göre sıralı getir
            const uncheckedCVsResult = await pool.query(`
                SELECT 
                    cvid,
                    cvsenderinfo,
                    cvdate,
                    cvitself,
                    jobpostid
                FROM cv
                WHERE jobpostid = $1 AND checked = false
                ORDER BY cvid ASC
            `, [jobPostId]);

            if (uncheckedCVsResult.rows.length === 0) {
                return {
                    success: true,
                    message: 'Analiz edilecek CV bulunamadı.',
                    analyzedCount: 0,
                    failedCount: 0,
                    totalCount: 0,
                    cvIds: []
                };
            }

            const cvIds = uncheckedCVsResult.rows.map(cv => cv.cvid);

            return {
                success: true,
                message: `${cvIds.length} adet analiz edilmemiş CV bulundu.`,
                totalCount: cvIds.length,
                cvIds: cvIds
            };

        } catch (error) {
            console.error('CVService AnalyzeAllUncheckedCVs Error:', error);
            throw new Error('CV listesi getirilirken hata oluştu: ' + error.message);
        }
    }

    /**
     * CV dosyasını veritabanından al (görüntüleme için)
     */
    async getCVFile(cvId) {
        try {
            if (!cvId) {
                return {
                    success: false,
                    message: 'CV ID gerekli.'
                };
            }

            const result = await pool.query(`
                SELECT 
                    cvid,
                    cvsenderinfo,
                    cvitself
                FROM cv
                WHERE cvid = $1
            `, [cvId]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    message: 'CV bulunamadı.'
                };
            }

            const cv = result.rows[0];
            const buffer = cv.cvitself;

            if (!buffer) {
                return {
                    success: false,
                    message: 'CV dosyası bulunamadı.'
                };
            }

            // Dosya tipini buffer'dan tespit et
            const bufferStart = buffer.slice(0, 4).toString();
            let mimeType = 'application/pdf'; // Varsayılan PDF
            let extension = 'pdf';

            if (bufferStart === '%PDF') {
                mimeType = 'application/pdf';
                extension = 'pdf';
            } else if (bufferStart === 'PK\x03\x04') {
                // DOCX dosyası
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                extension = 'docx';
            } else {
                // Varsayılan olarak PDF kabul et
                mimeType = 'application/pdf';
                extension = 'pdf';
            }

            // Dosya adını oluştur
            let fileName = cv.cvsenderinfo || 'cv';
            // Eğer uzantı yoksa ekle
            if (!fileName.match(/\.(pdf|docx|doc)$/i)) {
                fileName = `${fileName}.${extension}`;
            }

            return {
                success: true,
                fileBuffer: buffer,
                fileName: fileName,
                mimeType: mimeType
            };

        } catch (error) {
            console.error('CVService GetCVFile Error:', error);
            throw new Error('CV dosyası getirilirken hata oluştu: ' + error.message);
        }
    }
}

module.exports = new CVService();

