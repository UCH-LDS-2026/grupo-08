/* ==========================================================
   ARCHIVO: src/routes/authRoutes.js
   ROL: Define las rutas de autenticación y gestión de cuenta.
   BASE URL: /api/auth
   RUTAS:
     POST /api/auth/registro          → registro y login públicos
     POST /api/auth/login
     PUT  /api/auth/cambiar-password  → requiere token (todos los roles)
   CONTROLLER: src/controllers/authController.js
   ========================================================== */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Registro de nuevo usuario (público)
router.post('/registro', authController.registro);

// Login: devuelve token JWT (público)
router.post('/login', authController.login);

// Cambiar contraseña: requiere token, disponible para todos los roles
router.put('/cambiar-password', verificarToken, authController.cambiarPassword);

module.exports = router;
