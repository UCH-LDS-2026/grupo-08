const db = require('../config/database');

const Taller = {

    crear: (nombre_taller, direccion, telefono, certificado = 1) => {
        return db.prepare(`
            INSERT INTO talleres (nombre_taller, direccion, telefono, certificado)
            VALUES (?, ?, ?, ?)
        `).run(nombre_taller, direccion, telefono || null, certificado);
    },

    listar: () => {
        return db.prepare(`
            SELECT t.*,
                COUNT(u.id) AS cantidad_mecanicos
            FROM talleres t
            LEFT JOIN usuarios u ON u.taller_id = t.id AND u.rol = 'mecanico'
            GROUP BY t.id
            ORDER BY t.id
        `).all();
    },

    buscarPorId: (id) => {
        return db.prepare('SELECT * FROM talleres WHERE id = ?').get(id);
    },

    existePorId: (id) => {
        const row = db.prepare('SELECT id FROM talleres WHERE id = ?').get(id);
        return !!row;
    }
};

module.exports = Taller;
