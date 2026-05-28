const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Solo taller o admin puede cargar historial
router.post('/', verificarToken, verificarRoles(['taller', 'admin']), historialController.agregar);
router.get('/vehiculo/:vehiculo_id', historialController.obtenerPorVehiculo);

module.exports = router;
