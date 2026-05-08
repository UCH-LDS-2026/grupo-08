const db = require('../config/database');

const Usuario = {

    // Crear un usuario nuevo
    crear: (nombre, email, passwordHash, rol) => {
        const query = db.prepare(`
            INSERT INTO usuarios (nombre, email, password, rol)
            VALUES (?, ?, ?, ?)
        `);
        return query.run(nombre, email, passwordHash, rol);
    },

    // Buscar usuario por email
    buscarPorEmail: (email) => {
        const query = db.prepare(`
            SELECT * FROM usuarios WHERE email = ?
        `);
        return query.get(email);
    },

    // Buscar usuario por id
    buscarPorId: (id) => {
        const query = db.prepare(`
            SELECT id, nombre, email, rol, creado_en
            FROM usuarios WHERE id = ?
        `);
        return query.get(id);
    }
};

module.exports = Usuario;
