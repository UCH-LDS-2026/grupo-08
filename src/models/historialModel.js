const db = require('../config/database');

const Historial = {

    crear: (vehiculo_id, taller_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio) => {
        const query = db.prepare(`
            INSERT INTO historial (vehiculo_id, taller_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return query.run(vehiculo_id, taller_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio);
    },

    buscarPorVehiculo: (vehiculo_id) => {
        const query = db.prepare(`
            SELECT h.*, u.nombre as nombre_taller
            FROM historial h
            JOIN usuarios u ON h.taller_id = u.id
            WHERE h.vehiculo_id = ?
            ORDER BY h.fecha_servicio DESC
        `);
        return query.all(vehiculo_id);
    },

    buscarPorId: (id) => {
        const query = db.prepare(`
            SELECT * FROM historial WHERE id = ?
        `);
        return query.get(id);
    }
};

module.exports = Historial;
