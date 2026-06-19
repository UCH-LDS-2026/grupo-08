const Historial = require('../models/historialModel');
const Vehiculo  = require('../models/vehiculoModel');
const Taller    = require('../models/tallerModel');
const { sanitizarVehiculoPublico } = require('../utils/sanitizers');
const {
    esTipoServicioValido,
    esEnteroNoNegativo,
    esFechaValida,
    esFechaNoFutura,
    limpiarTexto,
} = require('../utils/validators');

const historialController = {

    agregar: (req, res) => {
        const { vehiculo_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio } = req.body;
        const taller_id = req.usuario.id;
        const rol       = req.usuario.rol;

        // Talleres necesitan estar certificados; admin puede siempre
        if (rol === 'taller' && !Taller.esCertificado(taller_id)) {
            return res.status(403).json({
                error: 'El taller debe estar certificado para cargar historial'
            });
        }

        // Validar presencia de campos obligatorios (km=0 es válido)
        if (!vehiculo_id || !tipo_servicio || kilometraje_servicio == null || kilometraje_servicio === '' || !fecha_servicio) {
            return res.status(400).json({
                error: 'vehiculo_id, tipo_servicio, kilometraje y fecha son obligatorios'
            });
        }

        if (!esTipoServicioValido(tipo_servicio)) {
            return res.status(400).json({
                error: 'tipo_servicio inválido. Valores permitidos: service, reparacion, inspeccion, siniestro'
            });
        }

        if (!esEnteroNoNegativo(kilometraje_servicio)) {
            return res.status(400).json({
                error: 'El kilometraje debe ser un número entero mayor o igual a 0'
            });
        }

        if (!esFechaValida(fecha_servicio)) {
            return res.status(400).json({ error: 'La fecha de servicio no es válida' });
        }

        if (!esFechaNoFutura(fecha_servicio)) {
            return res.status(400).json({ error: 'La fecha de servicio no puede ser futura' });
        }

        const vehiculo = Vehiculo.buscarPorId(vehiculo_id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const descripcionLimpia = limpiarTexto(descripcion, 1000);

        const resultado = Historial.crear(
            vehiculo_id, taller_id, tipo_servicio,
            descripcionLimpia, kilometraje_servicio, fecha_servicio
        );

        res.status(201).json({
            mensaje: 'Servicio registrado en el historial ✅',
            id: resultado.lastInsertRowid
        });
    },

    // GET público: historial por ID de vehículo (sin datos del dueño)
    obtenerPorVehiculo: (req, res) => {
        const { vehiculo_id } = req.params;

        const vehiculo = Vehiculo.buscarPorId(vehiculo_id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const historial = Historial.buscarPorVehiculo(vehiculo_id);
        res.json({ vehiculo: sanitizarVehiculoPublico(vehiculo), historial });
    },

    // GET público: historial por patente (sin datos del dueño)
    obtenerPorPatente: (req, res) => {
        const patente = req.params.patente.trim().toUpperCase();

        const vehiculo = Vehiculo.buscarPorPatente(patente);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const historial = Historial.buscarPorVehiculo(vehiculo.id);
        res.json({ vehiculo: sanitizarVehiculoPublico(vehiculo), historial });
    }
};

module.exports = historialController;
