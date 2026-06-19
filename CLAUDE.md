# Memoria del proyecto — HistoryCar

Universidad Champagnat · LDS 2026 · Grupo 8
Integrantes: Ignacio Azzolina, Constantino Mateu, Arian Nuñez

---

## Objetivo

Plataforma web para registrar, consultar y validar el historial técnico de vehículos usados.
Permite a dueños, talleres y administradores gestionar vehículos, servicios y historial.

---

## Stack

- **Backend:** Node.js + Express.js (`src/index.js`)
- **Base de datos:** SQLite local (`historycar.db`) vía `better-sqlite3`
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Frontend:** HTML5 + CSS3 + JS vanilla (`public/`)
- **Env:** `dotenv`

---

## Ejecución local

```bash
git clone https://github.com/UCH-LDS-2026/grupo-08.git
cd grupo-08
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/Mac
npm start                # NO usar npm run dev
```

El servidor levanta en **http://localhost:3000**.
La base `historycar.db` se crea automáticamente al iniciar.

### Variables de entorno (`.env`)

```
PORT=3000
JWT_SECRET=clave_secreta_para_desarrollo
```

---

## Estructura de carpetas

```
grupo-08/
├── public/
│   ├── index.html          SPA principal
│   ├── css/styles.css
│   └── js/app.js
├── src/
│   ├── index.js            Punto de entrada
│   ├── config/database.js  Crea tablas SQLite al arrancar
│   ├── controllers/        authController, vehiculoController, historialController
│   ├── middlewares/        authMiddleware (verificarToken, verificarRoles)
│   ├── models/             usuarioModel, vehiculoModel, historialModel
│   └── routes/             authRoutes, vehiculoRoutes, historialRoutes
├── database/
│   └── schema.sql          Esquema SQLite documentado (fuente de verdad)
├── docs/
│   ├── arquitectura.md     Arquitectura del sistema
│   └── modelo-datos.md     ← ER TÉCNICO OFICIAL (diagrama Mermaid)
├── .env.example
├── package.json
└── README.md
```

---

## Roles y permisos

| Acción | dueno | taller | admin |
|---|:---:|:---:|:---:|
| Registrar vehículo | ✓ | — | ✓ |
| Ver mis vehículos | ✓ | ✓ | ✓ |
| Buscar por patente | ✓ | ✓ | ✓ |
| Cargar historial | — | ✓ | ✓ |
| Consultar historial | público | público | público |
| Cambiar contraseña | ✓ | ✓ | ✓ |

---

## Rutas API

| Método | Ruta | Auth | Roles | Notas |
|---|---|---|---|---|
| POST | `/api/auth/registro` | No | — | Solo crea rol `dueno` |
| POST | `/api/auth/login` | No | — | |
| PUT | `/api/auth/cambiar-password` | Token | todos | |
| POST | `/api/auth/admin/usuarios` | Token | admin | Crea cualquier rol |
| POST | `/api/vehiculos` | Token | dueno, admin | Valida formato patente y año |
| GET | `/api/vehiculos/mis-vehiculos` | Token | todos | |
| GET | `/api/vehiculos/patente/:patente` | Token | todos | Privacidad según rol |
| POST | `/api/historial` | Token | taller cert., admin | Taller debe estar certificado |
| GET | `/api/historial/vehiculo/:id` | No | público | Vehiculo saneado (sin dueno_id) |
| GET | `/api/historial/patente/:patente` | No | público | Vehiculo saneado (sin dueno_id) |
| POST | `/api/talleres/perfil` | Token | taller | Crea perfil (pendiente cert.) |
| GET | `/api/talleres` | Token | admin | Lista talleres |
| GET | `/api/talleres/pendientes` | Token | admin | Lista sin certificar |
| PUT | `/api/talleres/:id/aprobar` | Token | admin | Certifica taller |

Normalización: email → `trim().toLowerCase()` · patente → `trim().toUpperCase()`

---

## Tablas SQLite

`usuarios` · `vehiculos` · `historial` · `talleres` · `deudas`

Las tablas `talleres` y `deudas` existen en el esquema pero **no tienen endpoints activos**.
Esquema completo: `database/schema.sql`

---

## Diagrama ER técnico

**`docs/modelo-datos.md`** es el modelo ER oficial.
Contiene un diagrama Mermaid fiel a `database/schema.sql` con las 5 tablas reales.

> `docs/diagrama-er.png` fue **eliminado** — correspondía a un diseño conceptual previo
> con entidades incorrectas (`Turno/Reserva`) que no representaban el modelo real.

---

## Reglas de Git

- Rama estable: `main` (no trabajar directamente sobre ella)
- Ramas de trabajo: `feature/*`
- Flujo: crear `feature/*` → desarrollar → Pull Request → revisión → merge
- **Nunca** hacer merge directo a `main` sin PR
- **Nunca** commitear `.env`, `historycar.db`, `node_modules/`

## Archivos que NO deben subirse

```
.env
historycar.db
*.db / *.sqlite / *.sqlite3
node_modules/
*.log
dist/ / build/
.DS_Store
.claude/
```

---

## Estado actual del proyecto

### Implementado ✓
- Auth: registro solo para dueños · login JWT · cambio de contraseña · creación interna por admin
- Script `npm run create:admin` para crear el primer administrador
- Validaciones backend: email, contraseña (≥6), formato de patente, año (1900-actual+1), km (≥0), fecha no futura, tipo_servicio
- `src/utils/validators.js` y `src/utils/sanitizers.js` como utilidades reutilizables
- Middleware JWT con validación estricta del esquema `Bearer`
- Foreign keys activadas: `db.pragma('foreign_keys = ON')` en `src/config/database.js`
- Módulo de talleres: perfil, certificación por admin, control de acceso al historial
- Privacidad en búsqueda por patente según rol (admin/dueño-propietario/taller-cert./ajeno)
- Saneamiento del vehículo público (sin dueno_id) en endpoints de historial
- Frontend con `escapeHTML()` en todos los valores dinámicos (prevención de XSS)
- Registro público sin selector de rol (solo dueños)
- Archivos heredados eliminados: `usuarioController.js`, `routes/usuarios.js`, `routes/vehiculos.js`
- TP4 + hardening: 140 tests unitarios con Jest · 97 % cobertura (100 % funciones)
  - `tests/unit/authMiddleware.test.js` (8 tests)
  - `tests/unit/authController.test.js` (26 tests)
  - `tests/unit/vehiculoController.test.js` (20 tests)
  - `tests/unit/historialController.test.js` (24 tests)
  - `tests/unit/tallerController.test.js` (9 tests)
  - `tests/unit/validators.test.js` (35 tests)
- GitHub Actions: `.github/workflows/tests.yml` ejecuta `npm test` en PR y push a `main`

### Testing
- Framework: Jest ^30.4.2 · entorno: Node
- Ejecutar: `npm test` / `npm run test:coverage`
- Total: 143 tests en 6 suites · 97 % statements · 100 % funciones
- Scope: controllers/ + middlewares/ + utils/ activos
- Ver `docs/tp4-testing.md` para detalles completos

### Scripts de desarrollo local
- `npm run reset:demo` — elimina todos los datos locales y crea admin demo (admin@gmail.com / admin)
  - La contraseña `admin` (5 chars) es una excepción local; el sistema sigue exigiendo ≥6 chars en general
- `npm run create:admin` — crea admin personalizado con variables de entorno (requiere password ≥6)
- `docs/INICIO_RAPIDO_LOCAL.md` — guía paso a paso para levantar el proyecto desde cero

### Panel admin en frontend
- Pestaña "Crear usuarios" visible solo cuando `usuarioActual.rol === 'admin'`
- Permite crear usuarios con rol dueno, taller o admin vía POST /api/auth/admin/usuarios
- La protección real está en el backend (verificarToken + verificarRoles(['admin']))

### Pendiente / Futuro
- Tests de integración (Supertest)
- Módulo de deudas con endpoints CRUD
- Migración a PostgreSQL para producción
- Deploy productivo
