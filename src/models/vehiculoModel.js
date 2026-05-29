/* ==========================================================
   ARCHIVO: src/models/vehiculoModel.js
   ROL: Operaciones de base de datos para la tabla "vehiculos".
   FUNCIONES:
     - crear                   → INSERT nuevo vehículo
     - buscarPorDueno          → SELECT todos los vehículos de un usuario
     - buscarPorPatente        → SELECT por patente (uso interno/duplicados)
     - buscarPorPatenteConDueno→ SELECT por patente con JOIN al dueño
     - buscarPorId             → SELECT por id
     - actualizarKilometraje   → UPDATE del kilometraje
   USADO EN: src/controllers/vehiculoController.js
             src/controllers/historialController.js
   ========================================================== */

const db = require('../config/database');

const Vehiculo = {

    // Inserta un vehículo nuevo. El color es opcional (puede ser null).
    crear: (patente, vin, marca, modelo, anio, kilometraje, dueno_id, color) => {
        return db.prepare(`
            INSERT INTO vehiculos (patente, vin, marca, modelo, anio, kilometraje, dueno_id, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(patente, vin, marca, modelo, anio, kilometraje, dueno_id, color || null);
    },

    // Devuelve todos los vehículos de un dueño (para "Mis Vehículos").
    buscarPorDueno: (dueno_id) => {
        return db.prepare(`
            SELECT * FROM vehiculos WHERE dueno_id = ?
        `).all(dueno_id);
    },

    // Búsqueda simple por patente. Devuelve solo datos del vehículo.
    // Usar para verificar duplicados antes de crear.
    buscarPorPatente: (patente) => {
        return db.prepare(`
            SELECT * FROM vehiculos WHERE patente = ?
        `).get(patente);
    },

    // Búsqueda por patente con JOIN al usuario dueño (nombre y email).
    // Usar para el endpoint público GET /api/vehiculos/patente/:patente
    // NO expone la contraseña del dueño.
    buscarPorPatenteConDueno: (patente) => {
        return db.prepare(`
            SELECT
                v.id,
                v.patente,
                v.vin,
                v.marca,
                v.modelo,
                v.anio,
                v.color,
                v.kilometraje,
                v.dueno_id,
                u.nombre AS dueno_nombre,
                u.email  AS dueno_email
            FROM vehiculos v
            JOIN usuarios u ON v.dueno_id = u.id
            WHERE v.patente = ?
        `).get(patente);
    },

    // Búsqueda por ID. Usado para validar existencia antes de agregar historial.
    buscarPorId: (id) => {
        return db.prepare(`
            SELECT * FROM vehiculos WHERE id = ?
        `).get(id);
    },

    // Actualiza el kilometraje de un vehículo.
    // Se llama desde PUT /api/vehiculos/:id/kilometraje
    actualizarKilometraje: (id, kilometraje) => {
        return db.prepare(`
            UPDATE vehiculos SET kilometraje = ? WHERE id = ?
        `).run(kilometraje, id);
    }
};

module.exports = Vehiculo;
