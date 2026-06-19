const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Solo dueno o admin puede registrar vehículos
router.post('/', verificarToken, verificarRoles(['dueno', 'admin']), vehiculoController.crear);
router.get('/mis-vehiculos', verificarToken, vehiculoController.misvehiculos);
// Buscar por patente: autenticado — dueño solo ve sus propios vehículos
router.get('/patente/:patente', verificarToken, vehiculoController.buscarPorPatente);

module.exports = router;
