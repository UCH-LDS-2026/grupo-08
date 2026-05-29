const Vehiculo = require('../models/vehiculoModel');

const vehiculoController = {

    // Crear vehículo
    crear: (req, res) => {
        const { vin, marca, modelo, anio, kilometraje } = req.body;
        // Normalizar patente: sin espacios y en mayúsculas
        const patente = (req.body.patente || '').trim().toUpperCase();
        const dueno_id = req.usuario.id;

        if (!patente || !marca || !modelo || !anio) {
            return res.status(400).json({
                error: 'Patente, marca, modelo y año son obligatorios'
            });
        }

        const existe = Vehiculo.buscarPorPatente(patente);
        if (existe) {
            return res.status(400).json({
                error: 'Ya existe un vehículo con esa patente'
            });
        }

        const resultado = Vehiculo.crear(
            patente, vin, marca, modelo, anio, kilometraje || 0, dueno_id
        );

        res.status(201).json({
            mensaje: 'Vehículo registrado exitosamente ✅',
            id: resultado.lastInsertRowid
        });
    },

    // Obtener mis vehículos
    misvehiculos: (req, res) => {
        const dueno_id = req.usuario.id;
        const vehiculos = Vehiculo.buscarPorDueno(dueno_id);
        res.json({ vehiculos });
    },

    // Obtener vehículo por patente incluyendo datos del dueño
    buscarPorPatente: (req, res) => {
        const patente = req.params.patente.trim().toUpperCase();
        const vehiculo = Vehiculo.buscarPorPatenteConDueno(patente);

        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        res.json({ vehiculo });
    }
};

module.exports = vehiculoController;
