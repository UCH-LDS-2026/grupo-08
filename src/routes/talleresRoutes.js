/* ==========================================================
   ARCHIVO: src/routes/talleresRoutes.js
   ROL: Define las rutas para gestión de perfiles de talleres.
   BASE URL: /api/talleres
   RUTAS:
     POST /api/talleres           → crear perfil (solo rol 'taller' o 'admin')
     GET  /api/talleres           → listar todos (público)
     GET  /api/talleres/mi-perfil → ver mi perfil (autenticado)
   CONTROLLER: src/controllers/talleresController.js
   ========================================================== */

const express = require('express');
const router = express.Router();
const talleresController = require('../controllers/talleresController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Crear perfil de taller: solo usuarios con rol 'taller' o 'admin'
router.post('/', verificarToken, verificarRoles(['taller', 'admin']), talleresController.crear);

// Listar todos los talleres: público (para que dueños puedan encontrar talleres)
router.get('/', talleresController.listar);

// Mi perfil de taller: cualquier usuario autenticado (el controller filtra por su ID)
router.get('/mi-perfil', verificarToken, talleresController.miPerfil);

module.exports = router;
