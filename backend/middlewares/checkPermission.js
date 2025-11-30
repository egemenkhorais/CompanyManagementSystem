const { checkUserPermission, checkUserAnyPermission } = require('../services/permissionService');

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const userRoleId = req.user?.roleid;

            if (!userRoleId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const hasPermission = await checkUserPermission(userRoleId, requiredPermission);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Bu işlem için yetkiniz yok! (${requiredPermission})`
                });
            }

            next();

        } catch (error) {
            console.error('Permission Middleware Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Yetki kontrolünde hata oluştu!'
            });
        }
    };
};

const checkAnyPermission = (permissionList) => {
    return async (req, res, next) => {
        try {
            const userRoleId = req.user?.roleid;

            if (!userRoleId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı bilgisi bulunamadı!'
                });
            }

            const hasPermission = await checkUserAnyPermission(userRoleId, permissionList);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'Bu işlem için yetkiniz yok!'
                });
            }

            next();

        } catch (error) {
            console.error('Permission Middleware Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Yetki kontrolünde hata oluştu!'
            });
        }
    };
};

module.exports = {
    checkPermission,
    checkAnyPermission
};