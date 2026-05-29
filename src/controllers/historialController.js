const Historial = require('../models/historialModel');
const Vehiculo = require('../models/vehiculoModel');

const historialController = {

    agregar: (req, res) => {
        const { vehiculo_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio } = req.body;
        const taller_id = req.usuario.id;

        if (!vehiculo_id || !tipo_servicio || !kilometraje_servicio || !fecha_servicio) {
            return res.status(400).json({
                error: 'vehiculo_id, tipo_servicio, kilometraje y fecha son obligatorios'
            });
        }

        const vehiculo = Vehiculo.buscarPorId(vehiculo_id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const resultado = Historial.crear(
            vehiculo_id, taller_id, tipo_servicio,
            descripcion, kilometraje_servicio, fecha_servicio
        );

        res.status(201).json({
            mensaje: 'Servicio registrado en el historial ✅',
            id: resultado.lastInsertRowid
        });
    },

    // Buscar historial por ID de vehículo
    obtenerPorVehiculo: (req, res) => {
        const { vehiculo_id } = req.params;

        const vehiculo = Vehiculo.buscarPorId(vehiculo_id);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const historial = Historial.buscarPorVehiculo(vehiculo_id);
        res.json({ vehiculo, historial });
    },

    // Buscar historial por patente del vehículo
    obtenerPorPatente: (req, res) => {
        const patente = req.params.patente.trim().toUpperCase();

        const vehiculo = Vehiculo.buscarPorPatente(patente);
        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const historial = Historial.buscarPorVehiculo(vehiculo.id);
        res.json({ vehiculo, historial });
    }
};

module.exports = historialController;
