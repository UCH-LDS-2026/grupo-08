/* ==========================================================
   ARCHIVO: src/controllers/historialController.js
   ROL: Maneja el registro y consulta del historial de servicios.
   ENDPOINTS:
     POST /api/historial                      → agregar
     GET  /api/historial/vehiculo/:vehiculo_id → obtenerPorVehiculo
     GET  /api/historial/patente/:patente      → obtenerPorPatente
   ACCESO:
     - agregar: solo rol 'taller' o 'admin' (verificarRoles en la ruta)
     - obtenerPorVehiculo / obtenerPorPatente: público (sin token)
   DEPENDENCIAS: models/historialModel.js, models/vehiculoModel.js
   ========================================================== */

const Historial = require('../models/historialModel');
const Vehiculo = require('../models/vehiculoModel');

const historialController = {

    // ----------------------------------------------------------
    // AGREGAR SERVICIO: POST /api/historial
    // Registra un nuevo evento de servicio para un vehículo.
    // El taller_id se toma del token JWT (req.usuario.id).
    // ----------------------------------------------------------
    agregar: (req, res) => {
        const { vehiculo_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio } = req.body;
        const taller_id = req.usuario.id; // viene del token JWT

        // [VALIDACIÓN] Campos obligatorios.
        // IMPORTANTE: kilometraje_servicio puede ser 0 (vehículo nuevo),
        // por eso no se usa !kilometraje_servicio (que fallaría con 0).
        if (!vehiculo_id || !tipo_servicio || kilometraje_servicio === undefined || !fecha_servicio) {
            return res.status(400).json({
                error: 'vehiculo_id, tipo_servicio, kilometraje y fecha son obligatorios'
            });
        }

        // [DB] Verificar que el vehículo existe antes de agregar historial
        const vehiculo = Vehiculo.buscarPorId(vehiculo_id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        // [DB] Insertar el registro de servicio
        const resultado = Historial.crear(
            vehiculo_id, taller_id, tipo_servicio,
            descripcion, kilometraje_servicio, fecha_servicio
        );

        res.status(201).json({
            mensaje: 'Servicio registrado en el historial',
            id: resultado.lastInsertRowid
        });
    },

    // ----------------------------------------------------------
    // VER HISTORIAL POR ID DE VEHÍCULO: GET /api/historial/vehiculo/:vehiculo_id
    // Devuelve el vehículo y su historial completo de servicios.
    // ----------------------------------------------------------
    obtenerPorVehiculo: (req, res) => {
        const { vehiculo_id } = req.params;

        // [DB] Verificar que el vehículo existe
        const vehiculo = Vehiculo.buscarPorId(vehiculo_id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const historial = Historial.buscarPorVehiculo(vehiculo_id);
        res.json({ vehiculo, historial });
    },

    // ----------------------------------------------------------
    // VER HISTORIAL POR PATENTE: GET /api/historial/patente/:patente
    // Alternativa más conveniente para el frontend (no necesita el ID).
    // ----------------------------------------------------------
    obtenerPorPatente: (req, res) => {
        // [NORMALIZACIÓN] Patente siempre en mayúsculas
        const patente = req.params.patente.trim().toUpperCase();

        // [DB] Buscar el vehículo por patente para obtener su ID
        const vehiculo = Vehiculo.buscarPorPatente(patente);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const historial = Historial.buscarPorVehiculo(vehiculo.id);
        res.json({ vehiculo, historial });
    }
};

module.exports = historialController;
