const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../historycar.db'));

// Deshabilitar FK durante setup/migración
db.pragma('foreign_keys = OFF');

// ────────────────────────────────────────────────────────────
// Detección de esquema anterior (NO borra datos automáticamente)
// ────────────────────────────────────────────────────────────
try {
    const usuariosSchema = db.prepare(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='usuarios'"
    ).get();

    // Si el CHECK incluye 'taller' → esquema previo al refactor rol mecanico
    const esquemaDesactualizado = usuariosSchema && (
        usuariosSchema.sql.includes("'taller'") ||
        usuariosSchema.sql.includes('"taller"')
    );

    if (esquemaDesactualizado) {
        console.error('');
        console.error('❌  Esquema de base de datos desactualizado.');
        console.error('    La base local fue creada con una versión anterior del proyecto.');
        console.error('    Para migrar y crear datos demo ejecutá:');
        console.error('');
        console.error('        npm run reset:demo');
        console.error('');
        db.close();
        process.exit(1);
    }
} catch (_) {
    // Tablas aún no existen — se crean a continuación
}

// ────────────────────────────────────────────────────────────
// Creación de tablas (orden: talleres → usuarios → vehiculos
//                    → historial → deudas)
// ────────────────────────────────────────────────────────────
db.exec(`
    -- Talleres: entidades independientes, creadas por admin
    CREATE TABLE IF NOT EXISTS talleres (
        id            INTEGER  PRIMARY KEY AUTOINCREMENT,
        nombre_taller TEXT     NOT NULL,
        direccion     TEXT     NOT NULL,
        telefono      TEXT,
        certificado   INTEGER  DEFAULT 1,
        creado_en     DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Usuarios: cuentas que inician sesión
    -- rol mecanico reemplaza al antiguo rol taller
    -- taller_id: obligatorio solo para mecanicos
    CREATE TABLE IF NOT EXISTS usuarios (
        id         INTEGER  PRIMARY KEY AUTOINCREMENT,
        nombre     TEXT     NOT NULL,
        email      TEXT     NOT NULL UNIQUE,
        password   TEXT     NOT NULL,
        rol        TEXT     CHECK(rol IN ('dueno', 'mecanico', 'admin')) NOT NULL,
        taller_id  INTEGER,
        creado_en  DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taller_id) REFERENCES talleres(id)
    );

    CREATE TABLE IF NOT EXISTS vehiculos (
        id          INTEGER  PRIMARY KEY AUTOINCREMENT,
        patente     TEXT     NOT NULL UNIQUE,
        vin         TEXT,
        marca       TEXT     NOT NULL,
        modelo      TEXT     NOT NULL,
        anio        INTEGER  NOT NULL,
        kilometraje INTEGER  DEFAULT 0,
        dueno_id    INTEGER  NOT NULL,
        creado_en   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dueno_id) REFERENCES usuarios(id)
    );

    -- historial: mecanico_id = usuario que cargó el servicio
    --            taller_id   = taller físico del mecánico
    CREATE TABLE IF NOT EXISTS historial (
        id                   INTEGER  PRIMARY KEY AUTOINCREMENT,
        vehiculo_id          INTEGER  NOT NULL,
        mecanico_id          INTEGER,
        taller_id            INTEGER,
        tipo_servicio        TEXT     NOT NULL,
        descripcion          TEXT,
        kilometraje_servicio INTEGER  NOT NULL,
        fecha_servicio       DATE     NOT NULL,
        creado_en            DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
        FOREIGN KEY (mecanico_id) REFERENCES usuarios(id),
        FOREIGN KEY (taller_id)   REFERENCES talleres(id)
    );

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

db.pragma('foreign_keys = ON');

console.log('Base de datos SQLite lista ✅');

module.exports = db;
