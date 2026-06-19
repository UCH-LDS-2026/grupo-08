const express = require('express');
const router = express.Router();
const tallerController = require('../controllers/tallerController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Taller crea su propio perfil (siempre inicia sin certificar)
router.post('/perfil', verificarToken, verificarRoles(['taller']), tallerController.crearPerfil);

// Admin crea el perfil de un usuario taller (puede certificar en el acto)
router.post('/admin/perfil', verificarToken, verificarRoles(['admin']), tallerController.crearPerfilDesdeAdmin);

// Admin lista y gestiona perfiles de talleres
router.get('/',           verificarToken, verificarRoles(['admin']), tallerController.listar);
router.get('/pendientes', verificarToken, verificarRoles(['admin']), tallerController.listarPendientes);
// :usuario_id = ID del usuario con rol 'taller' cuyo perfil se quiere certificar
router.put('/:usuario_id/aprobar', verificarToken, verificarRoles(['admin']), tallerController.aprobar);

module.exports = router;
