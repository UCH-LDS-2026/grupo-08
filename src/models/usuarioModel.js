const db = require('../config/database');

const Usuario = {

    crear: (nombre, email, passwordHash, rol, taller_id = null) => {
        return db.prepare(`
            INSERT INTO usuarios (nombre, email, password, rol, taller_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(nombre, email, passwordHash, rol, taller_id);
    },

    buscarPorEmail: (email) => {
        return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    },

    buscarPorId: (id) => {
        return db.prepare(`
            SELECT id, nombre, email, rol, taller_id, creado_en
            FROM usuarios WHERE id = ?
        `).get(id);
    },

    buscarPorIdConPassword: (id) => {
        return db.prepare(`
            SELECT id, nombre, email, rol, taller_id, password
            FROM usuarios WHERE id = ?
        `).get(id);
    },

    actualizarPassword: (id, passwordHash) => {
        return db.prepare('UPDATE usuarios SET password = ? WHERE id = ?').run(passwordHash, id);
    }
};

module.exports = Usuario;
