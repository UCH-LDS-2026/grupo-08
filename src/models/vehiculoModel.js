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

    buscarPorPatente: (patente) => {
        const query = db.prepare(`
            SELECT * FROM vehiculos WHERE patente = ?
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
