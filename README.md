# Company Management System

Şirketlerin departman, personel, proje, toplantı ve işe alım süreçlerini tek bir yerden yönetmesini sağlayan, rol ve yetki tabanlı bir web uygulaması. Arayüz React ile, API ise Node.js/Express ile yazılmıştır. Veriler PostgreSQL (Supabase) üzerinde tutulur.

## Özellikler

- **Kimlik doğrulama:** JWT ile giriş, bcrypt ile şifre saklama, her istekte son aktivite zamanının güncellenmesi
- **Rol ve yetki yönetimi:** Rollere yetki atanabilir. Yetkiler menü, menü grubu ve işlem düzeyindedir (ör. `admin:users`, `users:create`, `project:view`). Arayüzde yetki ağacı olarak yönetilir
- **Kullanıcı yönetimi:** Kullanıcı oluşturma, düzenleme, silme; rol, departman ve pozisyon atama
- **Departman ve pozisyon yönetimi:** Departmanlar ve altındaki pozisyonlar
- **Proje ve görev yönetimi:** Proje oluşturma, ekip atama, görev ekleme/güncelleme. Çalışanlar kendi projelerini ve görevlerini görür
- **Toplantı yönetimi:** Toplantı oluşturma, düzenleme, durum güncelleme, departmana göre listeleme
- **Oda yönetimi:** Şirket odalarının tanımlanması ve yönetimi
- **İş ilanları:** İş ilanı oluşturma ve listeleme
- **CV analizi:** PDF ve DOCX formatındaki CV'ler yüklenir (tek seferde en fazla 10 dosya), OpenAI (`gpt-4o-mini`) ile ilana göre analiz edilir
- **Otomatik yedekleme:** GitHub Actions her gün Supabase veritabanının yedeğini alır

## Teknolojiler

| Katman | Teknolojiler |
| --- | --- |
| Frontend | React 19, Vite (rolldown-vite), React Router 7, Axios, Lucide / React Icons |
| Backend | Node.js, Express 5, JWT, bcrypt, Multer, pdf-parse, mammoth |
| Veritabanı | PostgreSQL (Supabase), `pg` |
| Yapay zeka | OpenAI API |
| CI | GitHub Actions |

## Proje Yapısı

```
.
├── backend/
│   ├── config/         # Veritabanı bağlantısı
│   ├── controllers/    # İstek işleyicileri
│   ├── middlewares/    # Kimlik doğrulama, yetki ve aktivite takibi
│   ├── routes/         # API uç noktaları
│   ├── services/       # İş mantığı ve veritabanı sorguları
│   ├── utils/          # JWT yardımcıları
│   └── index.js        # Sunucu giriş noktası
├── frontend/
│   └── src/
│       ├── api/        # Axios ayarları
│       └── Components/ # Sayfalar ve bileşenler
├── backup.sql          # Veritabanı yedeği (otomatik oluşturulur)
└── .github/workflows/backup.yml
```

## Kurulum

### Gereksinimler

- Node.js 18 veya üzeri
- PostgreSQL veritabanı (Supabase veya yerel)
- CV analizi için bir OpenAI API anahtarı (isteğe bağlı)

### 1. Depoyu klonla

```bash
git clone https://github.com/egemenkhorais/CompanyManagementSystem.git
cd CompanyManagementSystem
```

### 2. Veritabanını hazırla

Boş bir PostgreSQL veritabanı oluştur ve şemayı `backup.sql` ile yükle:

```bash
psql "postgresql://KULLANICI:SIFRE@HOST:PORT/VERITABANI" -f backup.sql
```

### 3. Backend

```bash
cd backend
npm install
```

`backend/.env` dosyasını oluştur:

```env
PORT=5001

DB_HOST=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
JWT_EXPIRES_IN=1d

# CV analizi için gerekli, yoksa bu özellik çalışmaz
OPENAI_API_KEY=
```

Sunucuyu başlat:

```bash
node index.js
```

API varsayılan olarak `http://localhost:5001` adresinde çalışır. Sağlık kontrolü için `GET /api/test` kullanılabilir.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır. Frontend, API adresini `frontend/src/api/axiosInstance.js` dosyasındaki `API_URL` sabitinden alır (varsayılan `http://127.0.0.1:5001/api`). Backend'i farklı bir adreste çalıştırırsan bu değeri güncelle.

Üretim derlemesi için `npm run build` komutunu kullan.

## API Özeti

Giriş ve kayıt dışındaki tüm uç noktalar `Authorization: Bearer <token>` başlığı gerektirir.

| Yol | Açıklama |
| --- | --- |
| `POST /api/auth/login`, `POST /api/auth/register` | Giriş ve kayıt |
| `GET /api/auth/my-permissions` | Oturum açan kullanıcının yetkileri |
| `/api/departments` | Departman ve pozisyonlar |
| `/api/management` | Kullanıcı yönetimi |
| `/api/role-management` | Roller, yetkiler ve rol-yetki atamaları |
| `/api/projects` | Projeler, ekipler ve görevler |
| `/api/tasks` | Kullanıcının kendi proje ve görevleri |
| `/api/meetings` | Toplantılar |
| `/api/rooms` | Odalar |
| `/api/jobposts` | İş ilanları |
| `/api/cv` | CV yükleme, görüntüleme ve analiz |

## Yedekleme

`.github/workflows/backup.yml` her gün 00:00 UTC'de çalışır ve `pg_dump` ile `public` şemasını `backup.sql` dosyasına yazar. Workflow için `DATABASE_URL` adında bir repository secret tanımlanmalıdır. Elle çalıştırmak için Actions sekmesinden "Run workflow" kullanılabilir.

## Lisans

MIT
