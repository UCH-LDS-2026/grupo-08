const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// POST /api/auth/registro
router.post('/registro', authController.registro);

// POST /api/auth/login
router.post('/login', authController.login);

// PUT /api/auth/cambiar-password (requiere token, disponible para todos los roles)
router.put('/cambiar-password', verificarToken, authController.cambiarPassword);

module.exports = router;
