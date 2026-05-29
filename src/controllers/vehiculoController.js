/* ==========================================================
   ARCHIVO: src/controllers/vehiculoController.js
   ROL: Maneja el registro y consulta de vehículos.
   ENDPOINTS:
     POST /api/vehiculos                    → crear
     GET  /api/vehiculos/mis-vehiculos      → misvehiculos
     GET  /api/vehiculos/patente/:patente   → buscarPorPatente
     PUT  /api/vehiculos/:id/kilometraje    → actualizarKilometraje
   ACCESO:
     - crear: solo rol 'dueno' o 'admin' (verificarRoles en la ruta)
     - misvehiculos: cualquier rol autenticado
     - buscarPorPatente: requiere token (muestra datos del dueño)
     - actualizarKilometraje: solo el dueño del vehículo o admin
   DEPENDENCIAS: models/vehiculoModel.js
   ========================================================== */

const Vehiculo = require('../models/vehiculoModel');

const vehiculoController = {

    // ----------------------------------------------------------
    // CREAR VEHÍCULO: POST /api/vehiculos
    // Solo pueden registrar vehículos los usuarios con rol dueno o admin.
    // ----------------------------------------------------------
    crear: (req, res) => {
        // [NORMALIZACIÓN] Patente siempre en mayúsculas y sin espacios
        const patente = (req.body.patente || '').trim().toUpperCase();
        const { vin, marca, modelo, anio, kilometraje, color } = req.body;
        const dueno_id = req.usuario.id; // viene del token JWT

        // [VALIDACIÓN] Campos mínimos requeridos
        if (!patente || !marca || !modelo || !anio) {
            return res.status(400).json({
                error: 'Patente, marca, modelo y año son obligatorios'
            });
        }

        // [VALIDACIÓN] Verificar que la patente no esté ya registrada
        const existe = Vehiculo.buscarPorPatente(patente);
        if (existe) {
            return res.status(400).json({ error: 'Ya existe un vehículo con esa patente' });
        }

        // [DB] Insertar el vehículo. color puede ser null si no se provee.
        const resultado = Vehiculo.crear(
            patente, vin, marca, modelo, anio, kilometraje || 0, dueno_id, color || null
        );

        res.status(201).json({
            mensaje: 'Vehículo registrado exitosamente',
            id: resultado.lastInsertRowid
        });
    },

    // ----------------------------------------------------------
    // MIS VEHÍCULOS: GET /api/vehiculos/mis-vehiculos
    // Devuelve todos los vehículos del usuario autenticado.
    // La respuesta está envuelta en { vehiculos: [] } para compatibilidad.
    // ----------------------------------------------------------
    misvehiculos: (req, res) => {
        const dueno_id = req.usuario.id;
        const vehiculos = Vehiculo.buscarPorDueno(dueno_id);
        res.json({ vehiculos });
    },

    // ----------------------------------------------------------
    // BUSCAR POR PATENTE: GET /api/vehiculos/patente/:patente
    // Búsqueda pública de vehículo por patente. Incluye datos
    // del dueño (nombre y email) para que el taller pueda contactarlo.
    // ----------------------------------------------------------
    buscarPorPatente: (req, res) => {
        // [NORMALIZACIÓN] Patente siempre en mayúsculas
        const patente = req.params.patente.trim().toUpperCase();
        const vehiculo = Vehiculo.buscarPorPatenteConDueno(patente);

        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        res.json({ vehiculo });
    },

    // ----------------------------------------------------------
    // ACTUALIZAR KILOMETRAJE: PUT /api/vehiculos/:id/kilometraje
    // Solo el dueño del vehículo o un admin puede actualizar el km.
    // ----------------------------------------------------------
    actualizarKilometraje: (req, res) => {
        const { id } = req.params;
        const { kilometraje } = req.body;

        // [VALIDACIÓN] El kilometraje debe ser un número no negativo
        if (kilometraje === undefined || isNaN(kilometraje) || Number(kilometraje) < 0) {
            return res.status(400).json({ error: 'Kilometraje inválido' });
        }

        // [DB] Verificar que el vehículo existe
        const vehiculo = Vehiculo.buscarPorId(id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        // [AUTORIZACIÓN] Solo el dueño o un admin puede actualizar
        const esAdmin = req.usuario.rol === 'admin';
        const esDueno = vehiculo.dueno_id === req.usuario.id;
        if (!esDueno && !esAdmin) {
            return res.status(403).json({
                error: 'Solo el dueño del vehículo puede actualizar el kilometraje'
            });
        }

        Vehiculo.actualizarKilometraje(id, Number(kilometraje));
        res.json({ mensaje: 'Kilometraje actualizado correctamente' });
    }
};

module.exports = vehiculoController;
