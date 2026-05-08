const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const verificarToken = require('../middlewares/authMiddleware');

// Todas estas rutas requieren token
router.post('/', verificarToken, vehiculoController.crear);
router.get('/mis-vehiculos', verificarToken, vehiculoController.misvehiculos);
router.get('/patente/:patente', vehiculoController.buscarPorPatente);

module.exports = router;
