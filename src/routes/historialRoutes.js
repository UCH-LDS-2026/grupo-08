const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Solo taller o admin puede cargar historial
router.post('/', verificarToken, verificarRoles(['taller', 'admin']), historialController.agregar);

// Consultar historial por ID de vehículo
router.get('/vehiculo/:vehiculo_id', historialController.obtenerPorVehiculo);

// Consultar historial por patente del vehículo
router.get('/patente/:patente', historialController.obtenerPorPatente);

module.exports = router;
