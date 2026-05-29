/* ==========================================================
   ARCHIVO: src/models/deudasModel.js
   ROL: Operaciones de base de datos para la tabla "deudas".
         Registra multas, patentes impagas y otras deudas
         asociadas a un vehículo.
   FUNCIONES:
     - crear           → INSERT nueva deuda
     - buscarPorVehiculo → SELECT todas las deudas de un vehículo
     - marcarPagado    → UPDATE deuda como pagada (pagado = 1)
   USADO EN: src/controllers/deudasController.js
   ========================================================== */

const db = require('../config/database');

const Deuda = {

    // Registra una nueva deuda para un vehículo.
    crear: (vehiculo_id, tipo, descripcion, monto, fecha) => {
        return db.prepare(`
            INSERT INTO deudas (vehiculo_id, tipo, descripcion, monto, fecha)
            VALUES (?, ?, ?, ?, ?)
        `).run(vehiculo_id, tipo, descripcion, monto, fecha);
    },

    // Devuelve todas las deudas de un vehículo, ordenadas por fecha DESC.
    buscarPorVehiculo: (vehiculo_id) => {
        return db.prepare(`
            SELECT * FROM deudas
            WHERE vehiculo_id = ?
            ORDER BY fecha DESC
        `).all(vehiculo_id);
    },

    // Marca una deuda como pagada. Devuelve info sobre las filas afectadas.
    // Si result.changes === 0, la deuda con ese id no existía.
    marcarPagado: (id) => {
        return db.prepare(`
            UPDATE deudas SET pagado = 1 WHERE id = ?
        `).run(id);
    }
};

module.exports = Deuda;
