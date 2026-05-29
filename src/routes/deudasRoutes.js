/* ==========================================================
   ARCHIVO: src/routes/deudasRoutes.js
   ROL: Define las rutas para gestión de deudas de vehículos.
   BASE URL: /api/deudas
   RUTAS:
     POST  /api/deudas                       → registrar deuda (taller/admin)
     GET   /api/deudas/vehiculo/:vehiculo_id → consultar deudas (autenticado)
     PATCH /api/deudas/:id/pagar            → marcar como pagada (solo admin)
   CONTROLLER: src/controllers/deudasController.js
   ========================================================== */

const express = require('express');
const router = express.Router();
const deudasController = require('../controllers/deudasController');
const { verificarToken, verificarRoles } = require('../middlewares/authMiddleware');

// Registrar una deuda: taller o admin
router.post('/', verificarToken, verificarRoles(['taller', 'admin']), deudasController.crear);

// Consultar deudas de un vehículo: cualquier usuario autenticado
router.get('/vehiculo/:vehiculo_id', verificarToken, deudasController.porVehiculo);

// Marcar como pagada: solo admin
router.patch('/:id/pagar', verificarToken, verificarRoles(['admin']), deudasController.pagar);

module.exports = router;
