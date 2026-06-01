# Arquitectura del sistema HistoryCar

Universidad Champagnat · Laboratorio de Desarrollo de Software · 2026 · Grupo 8

---

## Descripción general

HistoryCar es una aplicación web de tipo monolítica con separación lógica en tres capas:

- **Frontend estático** servido directamente por Express desde la carpeta `public/`.
- **Backend API REST** en Node.js + Express que expone endpoints bajo `/api/`.
- **Base de datos local** SQLite gestionada con `better-sqlite3`, creada automáticamente al iniciar el servidor.

No requiere servidores externos, base de datos remota ni proceso de build para el frontend. Un desarrollador puede clonar el repositorio, instalar dependencias y ejecutar el sistema con `npm start`.

---

## Arquitectura por capas

```
┌─────────────────────────────────────────────────┐
│                   NAVEGADOR                     │
│  public/index.html + public/css/ + public/js/   │
│          HTML · CSS · JavaScript vanilla        │
└────────────────────┬────────────────────────────┘
                     │ fetch() → /api/*
┌────────────────────▼────────────────────────────┐
│               BACKEND (Express)                 │
│  src/index.js   —  punto de entrada             │
│  src/routes/    —  definición de endpoints      │
│  src/controllers/ — lógica de negocio           │
│  src/middlewares/ — autenticación y roles       │
│  src/models/    —  acceso a base de datos       │
└────────────────────┬────────────────────────────┘
                     │ better-sqlite3
┌────────────────────▼────────────────────────────┐
│             BASE DE DATOS (SQLite)              │
│         historycar.db  (archivo local)          │
│  Esquema: src/config/database.js                │
│  Documentación SQL: database/schema.sql         │
└─────────────────────────────────────────────────┘
```

---

## Flujo de una petición típica

```
Usuario → Navegador → public/js/app.js
  → fetch('/api/vehiculos', { headers: { Authorization: Bearer <token> } })
  → Express router (src/routes/vehiculoRoutes.js)
  → Middleware verificarToken → verificarRoles
  → Controller (src/controllers/vehiculoController.js)
  → Model (src/models/vehiculoModel.js)
  → better-sqlite3 → historycar.db
  → respuesta JSON → frontend → actualiza DOM
```

---

## Estructura de carpetas

```
grupo-08/
├── public/                    Frontend estático (servido por Express)
│   ├── index.html             SPA principal
│   ├── css/
│   │   └── styles.css         Estilos del sistema
│   └── js/
│       └── app.js             Lógica JavaScript del frontend
│
├── src/                       Backend
│   ├── index.js               Punto de entrada del servidor
│   ├── config/
│   │   └── database.js        Conexión SQLite y creación de tablas
│   ├── controllers/           Lógica de negocio por módulo
│   │   ├── authController.js
│   │   ├── vehiculoController.js
│   │   └── historialController.js
│   ├── middlewares/
│   │   └── authMiddleware.js  verificarToken + verificarRoles
│   ├── models/                Acceso directo a la base de datos
│   │   ├── usuarioModel.js
│   │   ├── vehiculoModel.js
│   │   └── historialModel.js
│   └── routes/                Definición de endpoints Express
│       ├── authRoutes.js
│       ├── vehiculoRoutes.js
│       └── historialRoutes.js
│
├── database/
│   └── schema.sql             Documentación SQL del esquema
│
├── docs/
│   ├── arquitectura.md        Este documento
│   ├── diagrama-er.png        Diagrama Entidad-Relación
│   ├── modelo-datos.md
│   └── product-discovery.md
│
├── trabajos-practicos/        Entregas de TPs
├── .env.example               Variables de entorno de referencia
├── .gitignore
├── package.json
└── README.md
```

---

## Autenticación y autorización

### Flujo de autenticación

1. El usuario envía email y password a `POST /api/auth/login`.
2. El backend verifica el hash bcrypt de la contraseña.
3. Si es válida, genera un token JWT firmado con `JWT_SECRET` (24h de expiración).
4. El frontend almacena el token en `localStorage`.
5. En cada petición protegida, el frontend envía `Authorization: Bearer <token>`.

### Middleware JWT

**`verificarToken`** — valida la firma y vigencia del token. Si es válido, inyecta `req.usuario` con `{ id, rol }`.

**`verificarRoles(rolesPermitidos[])`** — verifica que `req.usuario.rol` esté en la lista de roles permitidos. Devuelve 403 si no.

### Roles y permisos

| Acción | dueno | taller | admin |
|---|:---:|:---:|:---:|
| Registrar usuario | público | público | público |
| Login | público | público | público |
| Cambiar contraseña | ✓ | ✓ | ✓ |
| Registrar vehículo | ✓ | — | ✓ |
| Ver mis vehículos | ✓ | ✓ | ✓ |
| Buscar por patente | ✓ | ✓ | ✓ |
| Cargar historial | — | ✓ | ✓ |
| Consultar historial | público | público | público |

---

## Rutas API y responsabilidades

### Módulo Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/registro` | No | Crea usuario con email normalizado y password hasheado |
| POST | `/api/auth/login` | No | Valida credenciales y devuelve JWT |
| PUT | `/api/auth/cambiar-password` | Token | Verifica password actual, actualiza con nuevo hash |

### Módulo Vehículos (`/api/vehiculos`)

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | `/api/vehiculos` | Token | dueno, admin | Registra vehículo normalizando patente a mayúsculas |
| GET | `/api/vehiculos/mis-vehiculos` | Token | todos | Retorna vehículos del usuario autenticado |
| GET | `/api/vehiculos/patente/:patente` | Token | todos | Busca por patente incluyendo datos del dueño |

### Módulo Historial (`/api/historial`)

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | `/api/historial` | Token | taller, admin | Carga un servicio al historial de un vehículo |
| GET | `/api/historial/vehiculo/:id` | No | público | Consulta historial por ID de vehículo |
| GET | `/api/historial/patente/:patente` | No | público | Consulta historial por patente |

---

## Modelo de datos

### Tablas y relaciones

```
usuarios (id, nombre, email, password, rol, creado_en)
    │
    ├──1:N── vehiculos (id, patente, vin, marca, modelo, anio, kilometraje, dueno_id, creado_en)
    │            │
    │            └──1:N── historial (id, vehiculo_id, taller_id, tipo_servicio,
    │            │                   descripcion, kilometraje_servicio, fecha_servicio, creado_en)
    │            │
    │            └──1:N── deudas (id, vehiculo_id, tipo, descripcion, monto, pagado, fecha)
    │
    └──1:N── talleres (id, usuario_id, nombre_taller, direccion, telefono, certificado)
```

**Relaciones clave:**
- `vehiculos.dueno_id` → `usuarios.id` — cada vehículo pertenece a un usuario
- `historial.vehiculo_id` → `vehiculos.id` — cada servicio pertenece a un vehículo
- `historial.taller_id` → `usuarios.id` — cada servicio fue cargado por un usuario (taller/admin)
- `talleres.usuario_id` → `usuarios.id` — perfil extendido del taller
- `deudas.vehiculo_id` → `vehiculos.id` — cada deuda pertenece a un vehículo

### Diagrama ER

El diagrama Entidad-Relación del sistema se encuentra en:

```
docs/diagrama-er.png
```

---

## Decisiones técnicas

| Decisión | Justificación |
|---|---|
| **SQLite + better-sqlite3** | Sin servidor externo requerido. Ideal para prototipo académico y desarrollo local. API síncrona simple. |
| **Node.js + Express** | Conocimiento previo del equipo. Ecosistema amplio. Rápido de configurar para APIs REST. |
| **JWT stateless** | Sin estado en servidor. Portátil entre peticiones. Expiración configurable. |
| **Frontend HTML/CSS/JS vanilla** | Sin framework, sin paso de build. Facilita la comprensión y el mantenimiento. Separado en archivos para organización. |
| **bcryptjs** | Hasheo seguro de contraseñas con sal configurable. |
| **better-sqlite3** | Driver síncrono para SQLite, más simple que alternativas asíncronas para un proyecto de esta escala. |
| **dotenv** | Variables sensibles fuera del código. Patrón estándar de la industria. |

---

## Limitaciones actuales

- **Sin tests automáticos** — no hay tests unitarios ni de integración implementados.
- **SQLite no apta para producción multiusuario** — sin concurrencia avanzada ni réplicas.
- **Tablas `talleres` y `deudas` sin módulo funcional** — el esquema está definido pero no tienen endpoints API activos.
- **Historial consultable públicamente** — los endpoints `GET /api/historial/*` no requieren token según el código actual.
- **Sin deploy productivo** — el sistema corre solo en entorno local.
- **Sin manejo de refresh de token** — el JWT expira a las 24h sin posibilidad de renovación automática.

---

## Posibles mejoras futuras

- Migrar a PostgreSQL para entorno productivo multiusuario.
- Implementar tests automáticos (Jest + Supertest).
- Construir módulo completo de deudas con endpoints CRUD.
- Construir módulo completo de talleres con certificaciones.
- Proteger rutas de historial con autenticación opcional.
- Implementar auditoría de cambios en registros críticos.
- Agregar validación de formatos de patente (ej. formato argentino).
- Definir estrategia de deploy (Railway, Render, etc.).

---

## Relación con TP3

Este documento cubre los siguientes requerimientos del Trabajo Práctico 3:

| Requerimiento TP3 | Dónde se encuentra |
|---|---|
| Descripción de arquitectura | Este documento — sección "Descripción general" |
| Separación frontend / backend / base de datos | Este documento — sección "Arquitectura por capas" |
| Persistencia de datos | Este documento — sección "Base de datos" |
| Estructura técnica del proyecto | Este documento — sección "Estructura de carpetas" |
| Modelo de datos con relaciones | Este documento — sección "Modelo de datos" |
| Diagrama ER | `docs/diagrama-er.png` |
| Schema SQL documentado | `database/schema.sql` |
| Rutas API documentadas | Este documento — sección "Rutas API" + `README.md` |
| Autenticación y roles | Este documento — sección "Autenticación y autorización" |
| Decisiones técnicas | Este documento — sección "Decisiones técnicas" |
