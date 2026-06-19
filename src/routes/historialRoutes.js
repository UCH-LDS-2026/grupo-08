const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Solo mecanico o admin puede cargar historial
router.post('/', verificarToken, verificarRoles(['mecanico', 'admin']), historialController.agregar);

// Consultar historial — requiere token; dueño solo ve sus vehículos
router.get('/vehiculo/:vehiculo_id', verificarToken, historialController.obtenerPorVehiculo);
router.get('/patente/:patente',      verificarToken, historialController.obtenerPorPatente);

module.exports = router;
