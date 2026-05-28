const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Solo dueno o admin puede registrar vehículos
router.post('/', verificarToken, verificarRoles(['dueno', 'admin']), vehiculoController.crear);
router.get('/mis-vehiculos', verificarToken, vehiculoController.misvehiculos);
router.get('/patente/:patente', vehiculoController.buscarPorPatente);

module.exports = router;
