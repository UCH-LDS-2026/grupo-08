const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Solo mecanico o admin puede cargar historial
router.post('/', verificarToken, verificarRoles(['mecanico', 'admin']), historialController.agregar);

// Consultar historial por ID de vehículo (público)
router.get('/vehiculo/:vehiculo_id', historialController.obtenerPorVehiculo);

// Consultar historial por patente (público)
router.get('/patente/:patente', historialController.obtenerPorPatente);

module.exports = router;
