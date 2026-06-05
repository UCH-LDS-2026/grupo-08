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

| Método | Ruta | Auth | Roles |
|---|---|---|---|
| POST | `/api/auth/registro` | No | — |
| POST | `/api/auth/login` | No | — |
| PUT | `/api/auth/cambiar-password` | Token | todos |
| POST | `/api/vehiculos` | Token | dueno, admin |
| GET | `/api/vehiculos/mis-vehiculos` | Token | todos |
| GET | `/api/vehiculos/patente/:patente` | Token | todos |
| POST | `/api/historial` | Token | taller, admin |
| GET | `/api/historial/vehiculo/:id` | No | público |
| GET | `/api/historial/patente/:patente` | No | público |

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
- Auth completo (registro, login, JWT, cambio de contraseña)
- Normalización de email y patente
- CRUD parcial de vehículos (registro, listado, búsqueda por patente)
- Historial de servicios (carga y consulta por ID o patente)
- Control de roles en backend (middleware) y frontend (sidebar)
- Frontend rediseñado: sidebar, cards de vehículos, timeline, tarjeta de identidad
- Frontend separado: `public/index.html` + `public/css/styles.css` + `public/js/app.js`
- Documentación TP3: README, arquitectura, schema.sql, diagrama ER Mermaid

### Pendiente / Futuro
- Tests automáticos (Jest + Supertest)
- Módulo de deudas con endpoints CRUD
- Módulo de talleres con endpoints CRUD
- Migración a PostgreSQL para producción
- Deploy productivo
- Activar `PRAGMA foreign_keys = ON` en SQLite
- Proteger rutas públicas de historial si se requiere mayor privacidad
