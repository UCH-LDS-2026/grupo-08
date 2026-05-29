/* ==========================================================
   ARCHIVO: src/models/usuarioModel.js
   ROL: Operaciones de base de datos para la tabla "usuarios".
   FUNCIONES:
     - crear                  → INSERT nuevo usuario
     - buscarPorEmail         → SELECT por email (para login y registro)
     - buscarPorId            → SELECT por id (sin exponer password)
     - buscarPorIdConPassword → SELECT por id incluyendo password
                                (solo para cambio de contraseña)
     - actualizarPassword     → UPDATE del hash de la contraseña
   USADO EN: src/controllers/authController.js
   ========================================================== */

const db = require('../config/database');

const Usuario = {

    // Crea un usuario nuevo. passwordHash ya viene hasheado con bcrypt.
    crear: (nombre, email, passwordHash, rol) => {
        return db.prepare(`
            INSERT INTO usuarios (nombre, email, password, rol)
            VALUES (?, ?, ?, ?)
        `).run(nombre, email, passwordHash, rol);
    },

    // Busca por email. Devuelve TODOS los campos incluyendo password
    // (necesario para verificar contraseña en el login).
    buscarPorEmail: (email) => {
        return db.prepare(`
            SELECT * FROM usuarios WHERE email = ?
        `).get(email);
    },

    // Busca por id SIN devolver la contraseña (para respuestas al cliente).
    buscarPorId: (id) => {
        return db.prepare(`
            SELECT id, nombre, email, rol, creado_en
            FROM usuarios WHERE id = ?
        `).get(id);
    },

    // Busca por id CON contraseña. Solo usar cuando se necesita verificar
    // la contraseña actual (endpoint cambiar-password).
    buscarPorIdConPassword: (id) => {
        return db.prepare(`
            SELECT id, nombre, email, rol, password
            FROM usuarios WHERE id = ?
        `).get(id);
    },

    // Actualiza el hash de contraseña de un usuario.
    actualizarPassword: (id, passwordHash) => {
        return db.prepare(`
            UPDATE usuarios SET password = ? WHERE id = ?
        `).run(passwordHash, id);
    }
};

module.exports = Usuario;
