-- ============================================================
-- HistoryCar — Esquema de base de datos SQLite
-- Universidad Champagnat · LDS 2026 · Grupo 8
-- ============================================================
-- Este archivo documenta el esquema real de la base de datos.
-- La base se crea automáticamente en historycar.db al iniciar
-- el servidor (src/config/database.js).
-- NO ejecutar este archivo sobre una base existente sin
-- asegurarse de que las tablas no estén ya creadas.
-- ============================================================

-- ------------------------------------------------------------
-- Tabla: usuarios
-- Almacena todos los usuarios del sistema.
-- Roles posibles: dueno, taller, admin.
-- El email se normaliza a minúsculas antes de guardarse.
-- La contraseña se almacena como hash bcrypt (sal 10).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    nombre     TEXT     NOT NULL,
    email      TEXT     NOT NULL UNIQUE,
    password   TEXT     NOT NULL,
    rol        TEXT     CHECK(rol IN ('dueno', 'taller', 'admin')) NOT NULL,
    creado_en  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Tabla: vehiculos
-- Registra los vehículos ingresados al sistema.
-- La patente se normaliza a mayúsculas y se almacena única.
-- dueno_id referencia al usuario propietario.
-- El campo vin es opcional.
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Tabla: historial
-- Registra los servicios realizados sobre un vehículo.
-- taller_id referencia al usuario con rol taller o admin
-- que cargó el servicio.
-- tipo_servicio: service, reparacion, inspeccion, siniestro.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historial (
    id                   INTEGER  PRIMARY KEY AUTOINCREMENT,
    vehiculo_id          INTEGER  NOT NULL,
    taller_id            INTEGER  NOT NULL,
    tipo_servicio        TEXT     NOT NULL,
    descripcion          TEXT,
    kilometraje_servicio INTEGER  NOT NULL,
    fecha_servicio       DATE     NOT NULL,
    creado_en            DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
    FOREIGN KEY (taller_id)   REFERENCES usuarios(id)
);

-- ------------------------------------------------------------
-- Tabla: talleres
-- Almacena el perfil extendido de los usuarios con rol taller.
-- Prevista para futuras funcionalidades (certificaciones,
-- dirección, teléfono). Actualmente sin endpoints API activos.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS talleres (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id    INTEGER NOT NULL,
    nombre_taller TEXT    NOT NULL,
    direccion     TEXT,
    telefono      TEXT,
    certificado   INTEGER DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ------------------------------------------------------------
-- Tabla: deudas
-- Prevista para registrar multas, patentes impagas u otras
-- obligaciones asociadas a un vehículo.
-- Actualmente sin endpoints API activos (módulo futuro).
-- tipo: multa, patente, otro.
-- pagado: 0 = pendiente, 1 = pagado.
-- ------------------------------------------------------------
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
