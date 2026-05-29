/* ==========================================================
   ARCHIVO: src/routes/historialRoutes.js
   ROL: Define las rutas para el historial de servicios.
   BASE URL: /api/historial
   RUTAS:
     POST /api/historial                      → agregar servicio (taller/admin)
     GET  /api/historial/vehiculo/:vehiculo_id → ver historial por ID
     GET  /api/historial/patente/:patente      → ver historial por patente
   CONTROLLER: src/controllers/historialController.js
   NOTA: Las rutas GET son públicas para que cualquier persona
         pueda consultar el historial de un vehículo.
   ========================================================== */

const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Solo taller o admin puede cargar registros de servicio
router.post('/', verificarToken, verificarRoles(['taller', 'admin']), historialController.agregar);

// Consultar historial por ID de vehículo (público)
router.get('/vehiculo/:vehiculo_id', historialController.obtenerPorVehiculo);

// Consultar historial por patente (más conveniente que buscar el ID primero)
router.get('/patente/:patente', historialController.obtenerPorPatente);

module.exports = router;
