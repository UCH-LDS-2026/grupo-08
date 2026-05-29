/* ==========================================================
   ARCHIVO: src/config/database.js
   ROL: Inicializa la base de datos SQLite y crea las tablas
         si no existen. También corre migraciones para columnas
         agregadas después de la creación inicial (ej: color).
   TABLAS: usuarios, vehiculos, historial, talleres, deudas
   USADO EN: todos los archivos de src/models/
   ========================================================== */

const Database = require('better-sqlite3');
const path = require('path');

// La DB se guarda en la raíz del proyecto como historycar.db
const db = new Database(path.join(__dirname, '../../historycar.db'));

// ----------------------------------------------------------
// CREACIÓN DE TABLAS (solo si no existen)
// ----------------------------------------------------------
db.exec(`
    -- Usuarios del sistema (dueños, talleres, admins)
    CREATE TABLE IF NOT EXISTS usuarios (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre     TEXT    NOT NULL,
        email      TEXT    NOT NULL UNIQUE,
        password   TEXT    NOT NULL,
        rol        TEXT    CHECK(rol IN ('dueno', 'taller', 'admin')) NOT NULL,
        creado_en  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Vehículos registrados por los dueños
    CREATE TABLE IF NOT EXISTS vehiculos (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        patente     TEXT    NOT NULL UNIQUE,
        vin         TEXT,
        marca       TEXT    NOT NULL,
        modelo      TEXT    NOT NULL,
        anio        INTEGER NOT NULL,
        color       TEXT,
        kilometraje INTEGER DEFAULT 0,
        dueno_id    INTEGER NOT NULL,
        creado_en   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dueno_id) REFERENCES usuarios(id)
    );

    -- Registros de servicio / historial técnico de cada vehículo
    CREATE TABLE IF NOT EXISTS historial (
        id                   INTEGER PRIMARY KEY AUTOINCREMENT,
        vehiculo_id          INTEGER NOT NULL,
        taller_id            INTEGER NOT NULL,
        tipo_servicio        TEXT    NOT NULL,
        descripcion          TEXT,
        kilometraje_servicio INTEGER NOT NULL,
        fecha_servicio       DATE    NOT NULL,
        creado_en            DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
        FOREIGN KEY (taller_id)   REFERENCES usuarios(id)
    );

    -- Perfil de taller vinculado a un usuario con rol 'taller'
    CREATE TABLE IF NOT EXISTS talleres (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id    INTEGER NOT NULL,
        nombre_taller TEXT    NOT NULL,
        direccion     TEXT,
        telefono      TEXT,
        certificado   INTEGER DEFAULT 0,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    -- Deudas, multas y patentes pendientes de un vehículo
    CREATE TABLE IF NOT EXISTS deudas (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        vehiculo_id INTEGER NOT NULL,
        tipo        TEXT    CHECK(tipo IN ('multa', 'patente', 'otro')) NOT NULL,
        descripcion TEXT,
        monto       REAL,
        pagado      INTEGER DEFAULT 0,
        fecha       DATE    NOT NULL,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
    );
`);

// ----------------------------------------------------------
// MIGRACIONES: columnas agregadas después de la creación
// ALTER TABLE falla si la columna ya existe, por eso el try/catch
// ----------------------------------------------------------
try {
    db.exec('ALTER TABLE vehiculos ADD COLUMN color TEXT');
} catch {
    // La columna ya existe en esta DB — ignorar
}

console.log('Base de datos SQLite lista ✅');

module.exports = db;
