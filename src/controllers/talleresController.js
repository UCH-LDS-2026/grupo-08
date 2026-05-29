/* ==========================================================
   ARCHIVO: src/controllers/talleresController.js
   ROL: Maneja el perfil de talleres mecánicos.
         Un taller es un usuario con rol 'taller' que además
         crea un perfil con su nombre, dirección y teléfono.
   ENDPOINTS:
     POST /api/talleres          → crear
     GET  /api/talleres          → listar  (público)
     GET  /api/talleres/mi-perfil → miPerfil
   ACCESO:
     - crear: solo rol 'taller' o 'admin'
     - listar: público (sin token)
     - miPerfil: cualquier rol autenticado
   DEPENDENCIAS: models/talleresModel.js
   ========================================================== */

const Taller = require('../models/talleresModel');

const talleresController = {

    // ----------------------------------------------------------
    // CREAR PERFIL: POST /api/talleres
    // Crea el perfil de taller para el usuario autenticado.
    // Un usuario solo puede tener un perfil de taller.
    // ----------------------------------------------------------
    crear: (req, res) => {
        const { nombre_taller, direccion, telefono } = req.body;
        const usuario_id = req.usuario.id; // viene del token JWT

        // [VALIDACIÓN] El nombre del taller es el único campo obligatorio
        if (!nombre_taller) {
            return res.status(400).json({ error: 'El nombre del taller es obligatorio' });
        }

        // [VALIDACIÓN] Verificar que el usuario no tenga ya un perfil de taller
        const existe = Taller.buscarPorUsuario(usuario_id);
        if (existe) {
            return res.status(400).json({
                error: 'Ya tenés un perfil de taller registrado'
            });
        }

        // [DB] Crear el perfil de taller
        const resultado = Taller.crear(usuario_id, nombre_taller, direccion, telefono);

        res.status(201).json({
            mensaje: 'Perfil de taller creado correctamente',
            id: resultado.lastInsertRowid
        });
    },

    // ----------------------------------------------------------
    // LISTAR TALLERES: GET /api/talleres
    // Devuelve todos los talleres registrados (público).
    // Incluye nombre y email del usuario dueño del perfil.
    // ----------------------------------------------------------
    listar: (req, res) => {
        const talleres = Taller.listar();
        res.json(talleres);
    },

    // ----------------------------------------------------------
    // MI PERFIL: GET /api/talleres/mi-perfil
    // Devuelve el perfil de taller del usuario autenticado.
    // ----------------------------------------------------------
    miPerfil: (req, res) => {
        const taller = Taller.buscarPorUsuario(req.usuario.id);

        if (!taller) {
            return res.status(404).json({
                error: 'No tenés perfil de taller. Crealo con POST /api/talleres'
            });
        }

        res.json(taller);
    }
};

module.exports = talleresController;
