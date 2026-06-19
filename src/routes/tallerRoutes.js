const express = require('express');
const router = express.Router();
const tallerController = require('../controllers/tallerController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Taller crea su propio perfil (pendiente de certificación)
router.post('/perfil', verificarToken, verificarRoles(['taller']), tallerController.crearPerfil);

// Admin lista y gestiona perfiles de talleres
router.get('/',           verificarToken, verificarRoles(['admin']), tallerController.listar);
router.get('/pendientes', verificarToken, verificarRoles(['admin']), tallerController.listarPendientes);
router.put('/:usuario_id/aprobar', verificarToken, verificarRoles(['admin']), tallerController.aprobar);

module.exports = router;
