/* ==========================================================
   ARCHIVO: src/models/historialModel.js
   ROL: Operaciones de base de datos para la tabla "historial".
   FUNCIONES:
     - crear             → INSERT nuevo registro de servicio
     - buscarPorVehiculo → SELECT todos los servicios de un vehículo
                           (incluye nombre_taller por JOIN con usuarios)
     - buscarPorId       → SELECT un registro por id
   USADO EN: src/controllers/historialController.js
   NOTA: Los registros se ordenan por fecha_servicio DESC
         (el más reciente primero).
   ========================================================== */

const db = require('../config/database');

const Historial = {

    // Inserta un nuevo registro de servicio.
    // taller_id es el id del usuario autenticado que realiza el registro.
    crear: (vehiculo_id, taller_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio) => {
        return db.prepare(`
            INSERT INTO historial
                (vehiculo_id, taller_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(vehiculo_id, taller_id, tipo_servicio, descripcion, kilometraje_servicio, fecha_servicio);
    },

    // Devuelve todo el historial de un vehículo con el nombre del taller.
    // El JOIN trae u.nombre como nombre_taller para mostrarlo en el frontend.
    buscarPorVehiculo: (vehiculo_id) => {
        return db.prepare(`
            SELECT
                h.*,
                u.nombre AS nombre_taller
            FROM historial h
            JOIN usuarios u ON h.taller_id = u.id
            WHERE h.vehiculo_id = ?
            ORDER BY h.fecha_servicio DESC
        `).all(vehiculo_id);
    },

    // Busca un registro de servicio por su ID.
    buscarPorId: (id) => {
        return db.prepare(`
            SELECT * FROM historial WHERE id = ?
        `).get(id);
    }
};

module.exports = Historial;
