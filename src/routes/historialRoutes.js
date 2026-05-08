const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/', verificarToken, historialController.agregar);
router.get('/vehiculo/:vehiculo_id', historialController.obtenerPorVehiculo);

module.exports = router;
