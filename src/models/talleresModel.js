/* ==========================================================
   ARCHIVO: src/models/talleresModel.js
   ROL: Operaciones de base de datos para la tabla "talleres".
         Un taller es el perfil de un usuario con rol 'taller'.
         Cada usuario puede tener solo un perfil de taller.
   FUNCIONES:
     - crear            → INSERT perfil de taller
     - buscarPorUsuario → SELECT taller por usuario_id (uno a uno)
     - listar           → SELECT todos los talleres con datos del usuario
     - actualizar       → UPDATE nombre, dirección y teléfono
   USADO EN: src/controllers/talleresController.js
   ========================================================== */

const db = require('../config/database');

const Taller = {

    // Crea el perfil de taller para un usuario con rol 'taller'.
    crear: (usuario_id, nombre_taller, direccion, telefono) => {
        return db.prepare(`
            INSERT INTO talleres (usuario_id, nombre_taller, direccion, telefono)
            VALUES (?, ?, ?, ?)
        `).run(usuario_id, nombre_taller, direccion, telefono);
    },

    // Busca el taller de un usuario por su ID.
    // Devuelve null si el usuario no tiene perfil de taller.
    buscarPorUsuario: (usuario_id) => {
        return db.prepare(`
            SELECT * FROM talleres WHERE usuario_id = ?
        `).get(usuario_id);
    },

    // Lista todos los talleres con JOIN al nombre y email del usuario.
    listar: () => {
        return db.prepare(`
            SELECT
                t.*,
                u.nombre AS nombre_usuario,
                u.email  AS email_usuario
            FROM talleres t
            JOIN usuarios u ON t.usuario_id = u.id
            ORDER BY t.nombre_taller ASC
        `).all();
    },

    // Actualiza los datos de contacto de un taller.
    actualizar: (id, nombre_taller, direccion, telefono) => {
        return db.prepare(`
            UPDATE talleres
            SET nombre_taller = ?, direccion = ?, telefono = ?
            WHERE id = ?
        `).run(nombre_taller, direccion, telefono, id);
    }
};

module.exports = Taller;
