const Taller = require('../models/tallerModel');

const tallerController = {

    // POST /api/talleres/perfil — crea perfil del taller autenticado
    crearPerfil: (req, res) => {
        const usuario_id = req.usuario.id;
        const { nombre_taller, direccion, telefono } = req.body;

        if (!nombre_taller || !nombre_taller.trim()) {
            return res.status(400).json({ error: 'El nombre del taller es obligatorio' });
        }

        const perfilExistente = Taller.buscarPorUsuarioId(usuario_id);
        if (perfilExistente) {
            return res.status(400).json({ error: 'Ya existe un perfil de taller para este usuario' });
        }

        const resultado = Taller.crearPerfil(
            usuario_id,
            nombre_taller.trim(),
            direccion ? String(direccion).trim() : null,
            telefono  ? String(telefono).trim()  : null
        );

        res.status(201).json({
            mensaje: 'Perfil de taller creado. Pendiente de certificación por un administrador.',
            id: resultado.lastInsertRowid
        });
    },

    // GET /api/talleres — lista todos los talleres (admin)
    listar: (req, res) => {
        const talleres = Taller.listar();
        res.json({ talleres });
    },

    // GET /api/talleres/pendientes — lista talleres sin certificar (admin)
    listarPendientes: (req, res) => {
        const talleres = Taller.listarPendientes();
        res.json({ talleres });
    },

    // PUT /api/talleres/:usuario_id/aprobar — certifica un taller (admin)
    aprobar: (req, res) => {
        const { usuario_id } = req.params;

        const perfilExistente = Taller.buscarPorUsuarioId(usuario_id);
        if (!perfilExistente) {
            return res.status(404).json({ error: 'No existe perfil de taller para ese usuario' });
        }

        Taller.aprobar(usuario_id);
        res.json({ mensaje: 'Taller certificado exitosamente' });
    }
};

module.exports = tallerController;
