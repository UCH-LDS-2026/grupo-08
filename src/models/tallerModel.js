const db = require('../config/database');

const Taller = {

    buscarPorUsuarioId: (usuario_id) => {
        return db.prepare('SELECT * FROM talleres WHERE usuario_id = ?').get(usuario_id);
    },

    // certificado = 0 cuando lo crea el propio taller; puede ser 1 cuando lo crea un admin
    crearPerfil: (usuario_id, nombre_taller, direccion, telefono, certificado = 0) => {
        return db.prepare(`
            INSERT INTO talleres (usuario_id, nombre_taller, direccion, telefono, certificado)
            VALUES (?, ?, ?, ?, ?)
        `).run(usuario_id, nombre_taller, direccion || null, telefono || null, certificado);
    },

    listar: () => {
        return db.prepare(`
            SELECT t.*, u.nombre AS nombre_usuario, u.email AS email_usuario
            FROM talleres t
            JOIN usuarios u ON t.usuario_id = u.id
            ORDER BY t.id
        `).all();
    },

    listarPendientes: () => {
        return db.prepare(`
            SELECT t.*, u.nombre AS nombre_usuario, u.email AS email_usuario
            FROM talleres t
            JOIN usuarios u ON t.usuario_id = u.id
            WHERE t.certificado = 0
            ORDER BY t.id
        `).all();
    },

    aprobar: (usuario_id) => {
        return db.prepare('UPDATE talleres SET certificado = 1 WHERE usuario_id = ?').run(usuario_id);
    },

    esCertificado: (usuario_id) => {
        const row = db.prepare('SELECT certificado FROM talleres WHERE usuario_id = ?').get(usuario_id);
        return row ? row.certificado === 1 : false;
    }
};

module.exports = Taller;
