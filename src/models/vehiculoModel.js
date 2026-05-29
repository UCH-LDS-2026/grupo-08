const db = require('../config/database');

const Vehiculo = {

    crear: (patente, vin, marca, modelo, anio, kilometraje, dueno_id) => {
        const query = db.prepare(`
            INSERT INTO vehiculos (patente, vin, marca, modelo, anio, kilometraje, dueno_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        return query.run(patente, vin, marca, modelo, anio, kilometraje, dueno_id);
    },

    buscarPorDueno: (dueno_id) => {
        const query = db.prepare(`
            SELECT * FROM vehiculos WHERE dueno_id = ?
        `);
        return query.all(dueno_id);
    },

    // Búsqueda simple por patente (uso interno: verificar duplicados)
    buscarPorPatente: (patente) => {
        const query = db.prepare(`
            SELECT * FROM vehiculos WHERE patente = ?
        `);
        return query.get(patente);
    },

    // Búsqueda por patente incluyendo nombre y email del dueño (sin password)
    buscarPorPatenteConDueno: (patente) => {
        const query = db.prepare(`
            SELECT
                v.id,
                v.patente,
                v.vin,
                v.marca,
                v.modelo,
                v.anio,
                v.kilometraje,
                v.dueno_id,
                u.nombre AS dueno_nombre,
                u.email  AS dueno_email
            FROM vehiculos v
            JOIN usuarios u ON v.dueno_id = u.id
            WHERE v.patente = ?
        `);
        return query.get(patente);
    },

    buscarPorId: (id) => {
        const query = db.prepare(`
            SELECT * FROM vehiculos WHERE id = ?
        `);
        return query.get(id);
    }
};

module.exports = Vehiculo;
