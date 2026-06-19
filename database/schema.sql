-- ============================================================
-- HistoryCar — Esquema de base de datos SQLite
-- Universidad Champagnat · LDS 2026 · Grupo 8
-- ============================================================
-- IMPORTANTE:
-- • El esquema se crea automáticamente al iniciar el servidor.
-- • Para aplicar el esquema con datos demo ejecutar:
--   npm run reset:demo
-- ============================================================

-- ------------------------------------------------------------
-- Tabla: talleres
-- Entidades independientes creadas por el administrador.
-- Los usuarios con rol 'mecanico' se asocian a un taller.
-- certificado: 0 = no, 1 = sí (default 1).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS talleres (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT,
    nombre_taller TEXT     NOT NULL,
    direccion     TEXT     NOT NULL,
    telefono      TEXT,
    certificado   INTEGER  DEFAULT 1,
    creado_en     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Tabla: usuarios
-- Cuentas de usuario del sistema.
-- Roles: dueno | mecanico | admin
--   - dueno:    propietario de vehículos; no puede cargar historial.
--   - mecanico: usuario de taller; debe tener taller_id asignado.
--   - admin:    gestiona usuarios y talleres; puede todo.
-- taller_id: obligatorio para mecanico; NULL para dueno y admin.
-- Email se normaliza a minúsculas antes de guardarse.
-- Password guardada como hash bcrypt (sal 10).
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Tabla: vehiculos
-- Vehículos registrados, vinculados a un usuario con rol dueno.
-- Patente normalizada a mayúsculas, única.
-- vin: campo opcional (número de chasis).
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
-- Servicios registrados sobre un vehículo.
-- mecanico_id: usuario con rol mecanico que cargó el servicio.
-- taller_id:   taller físico al que pertenece el mecánico.
-- Ambos pueden ser NULL si lo registra un admin directamente.
-- tipo_servicio: validado en backend, no con CHECK en SQL.
--   Valores aceptados: service, reparacion, inspeccion, siniestro.
-- Los servicios se registran por PATENTE (el backend resuelve el ID).
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Tabla: deudas
-- Prevista para registrar multas u obligaciones de un vehículo.
-- Sin endpoints activos (módulo futuro).
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
