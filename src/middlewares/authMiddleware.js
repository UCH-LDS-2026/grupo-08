/* ==========================================================
   ARCHIVO: src/middlewares/authMiddleware.js
   ROL: Middlewares de autenticación y autorización por rol.
   EXPORTS:
     - verificarToken    → valida el JWT del header Authorization
     - verificarRoles()  → fábrica de middleware para restringir
                           acceso por rol (dueno / taller / admin)
   USADO EN: todas las rutas protegidas de src/routes/
   ========================================================== */

const jwt = require('jsonwebtoken');

// ----------------------------------------------------------
// verificarToken
// Extrae y valida el token del header: "Authorization: Bearer <token>"
// Si es válido adjunta el payload del JWT a req.usuario
// ----------------------------------------------------------
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado, token requerido' });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado; // { id, rol, iat, exp }
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// ----------------------------------------------------------
// verificarRoles(rolesPermitidos)
// Devuelve un middleware que verifica que req.usuario.rol
// esté dentro del array de roles permitidos.
// Ejemplo de uso en rutas:
//   router.post('/', verificarToken, verificarRoles(['taller', 'admin']), handler)
// ----------------------------------------------------------
const verificarRoles = (rolesPermitidos) => (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({
            error: `Acción no permitida. Se requiere rol: ${rolesPermitidos.join(' o ')}`
        });
    }
    next();
};

module.exports = { verificarToken, verificarRoles };
