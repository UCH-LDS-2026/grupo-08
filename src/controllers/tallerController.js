const Taller = require('../models/tallerModel');

const tallerController = {

    // POST /api/talleres — admin crea un taller mecánico independiente
    crear: (req, res) => {
        const { nombre_taller, direccion, telefono, certificado } = req.body;

        if (!nombre_taller || !String(nombre_taller).trim()) {
            return res.status(400).json({ error: 'El nombre del taller es obligatorio' });
        }
        if (!direccion || !String(direccion).trim()) {
            return res.status(400).json({ error: 'La dirección del taller es obligatoria' });
        }

        const cert = certificado !== undefined ? (certificado ? 1 : 0) : 1;
        const resultado = Taller.crear(
            String(nombre_taller).trim(),
            String(direccion).trim(),
            telefono ? String(telefono).trim() : null,
            cert
        );

        res.status(201).json({
            mensaje: 'Taller creado exitosamente',
            id: resultado.lastInsertRowid
        });
    },

    // GET /api/talleres — lista todos los talleres (admin)
    listar: (req, res) => {
        const talleres = Taller.listar();
        res.json({ talleres });
    },

    // GET /api/talleres/:id — obtiene un taller (admin)
    obtenerPorId: (req, res) => {
        const taller = Taller.buscarPorId(req.params.id);
        if (!taller) {
            return res.status(404).json({ error: 'Taller no encontrado' });
        }
        res.json({ taller });
    }
};

module.exports = tallerController;
