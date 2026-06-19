const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// POST /api/auth/registro — registro público, solo rol dueno
router.post('/registro', authController.registro);

// POST /api/auth/login
router.post('/login', authController.login);

// PUT /api/auth/cambiar-password — requiere token, todos los roles
router.put('/cambiar-password', verificarToken, authController.cambiarPassword);

// POST /api/auth/admin/usuarios — creación interna de usuarios por admin
router.post('/admin/usuarios', verificarToken, verificarRoles(['admin']), authController.crearUsuarioPorAdmin);

module.exports = router;
