const Taller  = require('../models/tallerModel');
const Usuario = require('../models/usuarioModel');

const tallerController = {

    // POST /api/talleres/perfil — taller crea su propio perfil (siempre certificado=0)
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
            // certificado = 0 (default): taller comienza sin certificar
        );

        res.status(201).json({
            mensaje: 'Perfil de taller creado. Pendiente de certificación por un administrador.',
            id: resultado.lastInsertRowid
        });
    },

    // POST /api/talleres/admin/perfil — admin crea perfil para un usuario taller
    crearPerfilDesdeAdmin: (req, res) => {
        const { usuario_id, nombre_taller, direccion, telefono, certificado } = req.body;

        if (!usuario_id || !nombre_taller || !String(nombre_taller).trim()) {
            return res.status(400).json({ error: 'usuario_id y nombre_taller son obligatorios' });
        }

        const usuario = Usuario.buscarPorId(usuario_id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (usuario.rol !== 'taller') {
            return res.status(400).json({
                error: 'El usuario debe tener rol taller para crear un perfil de taller'
            });
        }

        const perfilExistente = Taller.buscarPorUsuarioId(usuario_id);
        if (perfilExistente) {
            return res.status(400).json({ error: 'Este usuario ya tiene un perfil de taller' });
        }

        const cert = certificado ? 1 : 0;
        const resultado = Taller.crearPerfil(
            usuario_id,
            String(nombre_taller).trim(),
            direccion ? String(direccion).trim() : null,
            telefono  ? String(telefono).trim()  : null,
            cert
        );

        res.status(201).json({
            mensaje: cert
                ? 'Perfil de taller creado y certificado exitosamente'
                : 'Perfil de taller creado. Pendiente de certificación.',
            id: resultado.lastInsertRowid,
            certificado: Boolean(cert)
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
