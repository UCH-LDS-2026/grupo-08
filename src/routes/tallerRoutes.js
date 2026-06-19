const express = require('express');
const router = express.Router();
const tallerController = require('../controllers/tallerController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// POST /api/talleres — crea un taller independiente (admin)
router.post('/',    verificarToken, verificarRoles(['admin']), tallerController.crear);

// GET /api/talleres — lista todos los talleres (admin)
router.get('/',     verificarToken, verificarRoles(['admin']), tallerController.listar);

// GET /api/talleres/:id — obtiene un taller específico (admin)
router.get('/:id',  verificarToken, verificarRoles(['admin']), tallerController.obtenerPorId);

module.exports = router;
