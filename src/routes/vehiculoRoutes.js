/* ==========================================================
   ARCHIVO: src/routes/vehiculoRoutes.js
   ROL: Define las rutas para gestión de vehículos.
   BASE URL: /api/vehiculos
   RUTAS:
     POST /api/vehiculos                  → registrar vehículo (dueno/admin)
     GET  /api/vehiculos/mis-vehiculos    → listar mis vehículos (autenticado)
     GET  /api/vehiculos/patente/:patente → buscar por patente (autenticado)
     PUT  /api/vehiculos/:id/kilometraje  → actualizar km (dueño o admin)
   CONTROLLER: src/controllers/vehiculoController.js
   MIDDLEWARE: verificarToken, verificarRoles
   ========================================================== */

const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Solo dueño o admin puede registrar vehículos
router.post('/', verificarToken, verificarRoles(['dueno', 'admin']), vehiculoController.crear);

// Cualquier usuario autenticado puede ver sus vehículos
router.get('/mis-vehiculos', verificarToken, vehiculoController.misvehiculos);

// Buscar vehículo por patente (requiere token para ver datos del dueño)
router.get('/patente/:patente', verificarToken, vehiculoController.buscarPorPatente);

// Actualizar kilometraje: el controller valida que sea el dueño o admin
router.put('/:id/kilometraje', verificarToken, vehiculoController.actualizarKilometraje);

module.exports = router;
