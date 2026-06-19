const Historial = require('../models/historialModel');
const Vehiculo  = require('../models/vehiculoModel');
const { sanitizarVehiculoPublico } = require('../utils/sanitizers');
const {
    normalizarPatente,
    esPatenteValida,
    esTipoServicioValido,
    esEnteroNoNegativo,
    esFechaValida,
    esFechaNoFutura,
    limpiarTexto,
} = require('../utils/validators');

// Comprueba si el usuario puede ver el historial de un vehículo dado.
// - admin y mecanico: acceso total
// - dueno: solo puede ver vehículos propios
function puedeVerHistorial(usuario, vehiculo) {
    if (usuario.rol === 'admin' || usuario.rol === 'mecanico') return true;
    if (usuario.rol === 'dueno') return usuario.id === vehiculo.dueno_id;
    return false;
}

const historialController = {

    // POST /api/historial — registra un servicio usando la PATENTE del vehículo
    agregar: (req, res) => {
        const { tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio } = req.body;
        const patente     = normalizarPatente(req.body.patente);
        const mecanico_id = req.usuario.id;
        const rol         = req.usuario.rol;
        const taller_id   = req.usuario.taller_id || null;

        // Mecánico debe tener taller asignado
        if (rol === 'mecanico' && !taller_id) {
            return res.status(403).json({
                error: 'El usuario mecánico debe estar asociado a un taller para registrar servicios.'
            });
        }

        if (!patente) {
            return res.status(400).json({ error: 'La patente es obligatoria' });
        }
        if (!esPatenteValida(patente)) {
            return res.status(400).json({ error: 'Formato de patente inválido. Formatos aceptados: ABC123 o AB123CD' });
        }

        if (!tipo_servicio || kilometraje_servicio == null || kilometraje_servicio === '' || !fecha_servicio) {
            return res.status(400).json({
                error: 'tipo_servicio, kilometraje y fecha son obligatorios'
            });
        }

        if (!esTipoServicioValido(tipo_servicio)) {
            return res.status(400).json({
                error: 'tipo_servicio inválido. Valores permitidos: service, reparacion, inspeccion, siniestro'
            });
        }

        if (!esEnteroNoNegativo(kilometraje_servicio)) {
            return res.status(400).json({ error: 'El kilometraje debe ser un número entero mayor o igual a 0' });
        }

        if (!esFechaValida(fecha_servicio)) {
            return res.status(400).json({ error: 'La fecha de servicio no es válida' });
        }

        if (!esFechaNoFutura(fecha_servicio)) {
            return res.status(400).json({ error: 'La fecha de servicio no puede ser futura' });
        }

        const vehiculo = Vehiculo.buscarPorPatente(patente);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado para la patente indicada' });
        }

        const descripcionLimpia = limpiarTexto(descripcion, 1000);

        const resultado = Historial.crear(
            vehiculo.id,
            mecanico_id,
            taller_id,
            tipo_servicio,
            descripcionLimpia,
            kilometraje_servicio,
            fecha_servicio
        );

        res.status(201).json({
            mensaje: 'Servicio registrado en el historial ✅',
            id: resultado.lastInsertRowid
        });
    },

    // GET /api/historial/vehiculo/:vehiculo_id — requiere token
    // admin y mecanico: ven cualquier vehículo
    // dueno: solo sus propios vehículos
    obtenerPorVehiculo: (req, res) => {
        const { vehiculo_id } = req.params;
        const usuario = req.usuario;

        const vehiculo = Vehiculo.buscarPorId(vehiculo_id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        if (!puedeVerHistorial(usuario, vehiculo)) {
            return res.status(403).json({
                error: 'No tenés permiso para consultar el historial de este vehículo.'
            });
        }

        const historial = Historial.buscarPorVehiculo(vehiculo_id);
        res.json({ vehiculo: sanitizarVehiculoPublico(vehiculo), historial });
    },

    // GET /api/historial/patente/:patente — requiere token
    // admin y mecanico: ven cualquier vehículo
    // dueno: solo sus propios vehículos
    obtenerPorPatente: (req, res) => {
        const patente = req.params.patente.trim().toUpperCase();
        const usuario = req.usuario;

        const vehiculo = Vehiculo.buscarPorPatente(patente);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        if (!puedeVerHistorial(usuario, vehiculo)) {
            return res.status(403).json({
                error: 'No tenés permiso para consultar el historial de este vehículo.'
            });
        }

        const historial = Historial.buscarPorVehiculo(vehiculo.id);
        res.json({ vehiculo: sanitizarVehiculoPublico(vehiculo), historial });
    }
};

module.exports = historialController;
