const db = require('../config/database');

const Historial = {

    crear: (vehiculo_id, mecanico_id, taller_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio) => {
        return db.prepare(`
            INSERT INTO historial
                (vehiculo_id, mecanico_id, taller_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(vehiculo_id, mecanico_id, taller_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio);
    },

    buscarPorVehiculo: (vehiculo_id) => {
        return db.prepare(`
            SELECT h.*,
                u.nombre AS nombre_mecanico,
                t.nombre_taller AS nombre_taller
            FROM historial h
            LEFT JOIN usuarios u ON h.mecanico_id = u.id
            LEFT JOIN talleres t ON h.taller_id   = t.id
            WHERE h.vehiculo_id = ?
            ORDER BY h.fecha_servicio DESC
        `).all(vehiculo_id);
    },

    buscarPorId: (id) => {
        return db.prepare('SELECT * FROM historial WHERE id = ?').get(id);
    }
};

module.exports = Historial;
