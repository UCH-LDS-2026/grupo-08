const Database = require('better-sqlite3');
const path = require('path');

// Crea el archivo historycar.db en la raíz del proyecto
const db = new Database(path.join(__dirname, '../../historycar.db'));

// Activar integridad referencial (desactivada por defecto en SQLite)
db.pragma('foreign_keys = ON');

// Crear las tablas si no existen
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        rol TEXT CHECK(rol IN ('dueno', 'taller', 'admin')) NOT NULL,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehiculos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patente TEXT NOT NULL UNIQUE,
        vin TEXT,
        marca TEXT NOT NULL,
        modelo TEXT NOT NULL,
        anio INTEGER NOT NULL,
        kilometraje INTEGER DEFAULT 0,
        dueno_id INTEGER NOT NULL,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dueno_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS historial (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehiculo_id INTEGER NOT NULL,
        taller_id INTEGER NOT NULL,
        tipo_servicio TEXT NOT NULL,
        descripcion TEXT,
        kilometraje_servicio INTEGER NOT NULL,
        fecha_servicio DATE NOT NULL,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
        FOREIGN KEY (taller_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS talleres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nombre_taller TEXT NOT NULL,
        direccion TEXT,
        telefono TEXT,
        certificado INTEGER DEFAULT 0,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS deudas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehiculo_id INTEGER NOT NULL,
        tipo TEXT CHECK(tipo IN ('multa', 'patente', 'otro')) NOT NULL,
        descripcion TEXT,
        monto REAL,
        pagado INTEGER DEFAULT 0,
        fecha DATE NOT NULL,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
    );
`);

console.log('Base de datos SQLite lista ✅');

module.exports = db;
