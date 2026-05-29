/* ==========================================================
   ARCHIVO: src/controllers/deudasController.js
   ROL: Maneja el registro y consulta de deudas de vehículos
         (multas, patentes impagas, otros cargos).
   ENDPOINTS:
     POST  /api/deudas                       → crear
     GET   /api/deudas/vehiculo/:vehiculo_id → porVehiculo
     PATCH /api/deudas/:id/pagar            → pagar
   ACCESO:
     - crear: solo rol 'admin' o 'taller' (verificarRoles en la ruta)
     - porVehiculo: requiere token (para saber si está autorizado)
     - pagar: solo rol 'admin'
   DEPENDENCIAS: models/deudasModel.js, models/vehiculoModel.js
   ========================================================== */

const Deuda = require('../models/deudasModel');
const Vehiculo = require('../models/vehiculoModel');

// Tipos de deuda válidos según el CHECK constraint de la DB
const TIPOS_VALIDOS = ['multa', 'patente', 'otro'];

const deudasController = {

    // ----------------------------------------------------------
    // CREAR DEUDA: POST /api/deudas
    // Registra una nueva deuda (multa, patente, otro) para un vehículo.
    // ----------------------------------------------------------
    crear: (req, res) => {
        const { vehiculo_id, tipo, descripcion, monto, fecha } = req.body;

        // [VALIDACIÓN] Campos obligatorios
        if (!vehiculo_id || !tipo || !fecha) {
            return res.status(400).json({
                error: 'vehiculo_id, tipo y fecha son obligatorios'
            });
        }

        // [VALIDACIÓN] Tipo debe ser uno de los valores aceptados por la DB
        if (!TIPOS_VALIDOS.includes(tipo)) {
            return res.status(400).json({
                error: `Tipo inválido. Los tipos válidos son: ${TIPOS_VALIDOS.join(', ')}`
            });
        }

        // [DB] Verificar que el vehículo existe
        const vehiculo = Vehiculo.buscarPorId(vehiculo_id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        // [DB] Insertar la deuda. monto puede ser 0 si no se conoce aún.
        const resultado = Deuda.crear(vehiculo_id, tipo, descripcion, monto || 0, fecha);

        res.status(201).json({
            mensaje: 'Deuda registrada correctamente',
            id: resultado.lastInsertRowid
        });
    },

    // ----------------------------------------------------------
    // DEUDAS POR VEHÍCULO: GET /api/deudas/vehiculo/:vehiculo_id
    // Devuelve todas las deudas (pagas y pendientes) de un vehículo.
    // ----------------------------------------------------------
    porVehiculo: (req, res) => {
        const { vehiculo_id } = req.params;

        // [DB] Verificar que el vehículo existe
        const vehiculo = Vehiculo.buscarPorId(vehiculo_id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const deudas = Deuda.buscarPorVehiculo(vehiculo_id);
        res.json(deudas);
    },

    // ----------------------------------------------------------
    // MARCAR COMO PAGADA: PATCH /api/deudas/:id/pagar
    // Solo un admin puede marcar una deuda como pagada.
    // ----------------------------------------------------------
    pagar: (req, res) => {
        const { id } = req.params;
        const resultado = Deuda.marcarPagado(id);

        // [VALIDACIÓN] Si changes === 0, la deuda con ese ID no existe
        if (resultado.changes === 0) {
            return res.status(404).json({ error: 'Deuda no encontrada' });
        }

        res.json({ mensaje: 'Deuda marcada como pagada' });
    }
};

module.exports = deudasController;
