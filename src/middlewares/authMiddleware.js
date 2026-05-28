const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {

    // El token viene en el header Authorization: Bearer TOKEN
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado, token requerido' });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Verifica que el usuario tenga uno de los roles permitidos
const verificarRoles = (rolesPermitidos) => (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({
            error: `Acción no permitida. Se requiere rol: ${rolesPermitidos.join(' o ')}`
        });
    }
    next();
};

module.exports = { verificarToken, verificarRoles };
