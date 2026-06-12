# HistoryCar 🚗

**Ecosistema inteligente para la trazabilidad y gestión automotriz.**

Universidad Champagnat · Laboratorio de Desarrollo de Software · 2026 · Grupo N.º 8

---

## Integrantes

| Nombre | Rol |
|---|---|
| Ignacio Azzolina | Desarrollador |
| Constantino Mateu | Desarrollador |
| Arian Nuñez | Desarrollador |

---

## Descripción del problema

El mercado automotriz sufre de falta de información confiable sobre el estado real de los vehículos usados. Al comprar o vender un auto, el historial de mantenimiento suele perderse, estar incompleto o depender exclusivamente de lo que declara el vendedor.

Esto genera:
- pérdida de confianza entre compradores y vendedores;
- reducción del valor de reventa de vehículos bien mantenidos;
- diagnósticos mecánicos más lentos por falta de antecedentes;
- desconocimiento de reparaciones, siniestros o fallas previas.

---

## Objetivo del sistema

HistoryCar es una plataforma web que permite:

- registrar usuarios con roles diferenciados (dueño, taller, administrador);
- iniciar y cerrar sesión con autenticación JWT;
- registrar vehículos vinculados a un propietario;
- consultar cualquier vehículo por patente;
- consultar el historial de servicios de un vehículo por ID o patente;
- cargar nuevos servicios al historial;
- cambiar la contraseña de acceso;
- mantener trazabilidad básica del estado técnico de vehículos usados.

---

## Usuarios y roles

| Rol | Descripción |
|---|---|
| `dueno` | Propietario de vehículos |
| `taller` | Mecánico o taller que carga servicios |
| `admin` | Administrador con acceso completo |

### Permisos por rol

| Acción | dueno | taller | admin |
|---|:---:|:---:|:---:|
| Registrar usuario | público | público | público |
| Iniciar sesión | ✓ | ✓ | ✓ |
| Cambiar contraseña | ✓ | ✓ | ✓ |
| Registrar vehículo | ✓ | — | ✓ |
| Ver mis vehículos | ✓ | ✓ | ✓ |
| Buscar vehículo por patente | ✓ | ✓ | ✓ |
| Cargar historial de servicio | — | ✓ | ✓ |
| Consultar historial | público | público | público |

---

## Stack tecnológico

### Frontend
- HTML5 · CSS3 · JavaScript vanilla
- Archivos separados: `public/index.html`, `public/css/styles.css`, `public/js/app.js`
- Sin framework ni paso de build

### Backend
- Node.js
- Express.js

### Base de datos
- SQLite — archivo `historycar.db` generado localmente
- Driver: `better-sqlite3`

### Autenticación
- JWT (`jsonwebtoken`) — tokens con expiración de 24h
- `bcryptjs` — hash de contraseñas con sal 10

### Variables de entorno
- `dotenv`

---

## Versiones y dependencias

| Herramienta | Versión declarada |
|---|---|
| Node.js | v22+ recomendado |
| Express.js | 4.18.x |
| better-sqlite3 | 12.9.x |
| bcryptjs | 2.4.x |
| jsonwebtoken | 9.0.x |
| dotenv | 16.0.x |
| cors | 2.8.x |
| nodemon (dev) | 3.0.x |

Las dependencias exactas se encuentran en `package.json`.

---

## Instalación y ejecución local

### Requisitos previos
- Node.js v18 o superior
- npm
- Git

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/UCH-LDS-2026/grupo-08.git
cd grupo-08
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Configurar variables de entorno**

En Windows:
```cmd
copy .env.example .env
```

En Linux/Mac:
```bash
cp .env.example .env
```

**4. Iniciar el servidor**
```bash
npm start
```

**5. Abrir en el navegador**
```
http://localhost:3000
```

> La base de datos `historycar.db` se crea automáticamente al iniciar el servidor. No se requiere configuración adicional.

---

## Variables de entorno

El archivo `.env` debe contener:

```
PORT=3000
JWT_SECRET=clave_secreta_para_desarrollo
```

- `PORT` — puerto del servidor (default: 3000)
- `JWT_SECRET` — clave para firmar los tokens JWT (cambiar en producción)

El archivo `.env` no se sube al repositorio (está en `.gitignore`). El archivo `.env.example` sirve como plantilla.

---

## Estructura del repositorio

```
grupo-08/
│
├── public/                      Frontend estático
│   ├── index.html               Interfaz principal (SPA)
│   ├── css/
│   │   └── styles.css           Estilos
│   └── js/
│       └── app.js               Lógica del frontend
│
├── src/                         Backend
│   ├── index.js                 Punto de entrada del servidor
│   ├── config/
│   │   └── database.js          Configuración SQLite y creación de tablas
│   ├── controllers/             Lógica de negocio
│   │   ├── authController.js
│   │   ├── vehiculoController.js
│   │   └── historialController.js
│   ├── middlewares/
│   │   └── authMiddleware.js    JWT y control de roles
│   ├── models/                  Acceso a la base de datos
│   │   ├── usuarioModel.js
│   │   ├── vehiculoModel.js
│   │   └── historialModel.js
│   └── routes/                  Definición de endpoints
│       ├── authRoutes.js
│       ├── vehiculoRoutes.js
│       └── historialRoutes.js
│
├── database/
│   └── schema.sql               Esquema SQL documentado
│
├── docs/
│   ├── arquitectura.md          Arquitectura del sistema
│   ├── modelo-datos.md          Modelo ER técnico (diagrama Mermaid)
│   └── product-discovery.md
│
├── trabajos-practicos/          Entregas de TPs
│
├── .env.example                 Variables de entorno de referencia
├── .gitignore
├── package.json
└── README.md
```

---

## Rutas disponibles

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | `/api/auth/registro` | No | Público | Registrar nuevo usuario |
| POST | `/api/auth/login` | No | Público | Iniciar sesión, devuelve JWT |
| PUT | `/api/auth/cambiar-password` | Sí | dueno, taller, admin | Cambiar contraseña del usuario autenticado |
| POST | `/api/vehiculos` | Sí | dueno, admin | Registrar vehículo |
| GET | `/api/vehiculos/mis-vehiculos` | Sí | dueno, taller, admin | Ver vehículos del usuario autenticado |
| GET | `/api/vehiculos/patente/:patente` | Sí | dueno, taller, admin | Buscar vehículo por patente (incluye datos del dueño) |
| POST | `/api/historial` | Sí | taller, admin | Cargar servicio al historial |
| GET | `/api/historial/vehiculo/:vehiculo_id` | No | Público | Consultar historial por ID de vehículo |
| GET | `/api/historial/patente/:patente` | No | Público | Consultar historial por patente |

---

## Base de datos

SQLite local. El archivo `historycar.db` se genera automáticamente en la raíz del proyecto al ejecutar `npm start`.

### Tablas

| Tabla | Descripción |
|---|---|
| `usuarios` | Usuarios del sistema con rol y contraseña hasheada |
| `vehiculos` | Vehículos registrados, vinculados a un dueño |
| `historial` | Servicios realizados sobre un vehículo |
| `talleres` | Perfil extendido de usuarios con rol taller (sin endpoints activos) |
| `deudas` | Multas y obligaciones del vehículo (sin endpoints activos, módulo futuro) |

El esquema completo se encuentra en:
- Código: [`src/config/database.js`](src/config/database.js)
- SQL documentado: [`database/schema.sql`](database/schema.sql)

### Relaciones principales

```
usuarios 1:N vehiculos
usuarios 1:N historial (como taller_id)
vehiculos 1:N historial
vehiculos 1:N deudas
usuarios 1:N talleres
```

---

## Modelo ER

El modelo Entidad-Relación técnico del sistema se encuentra documentado en:

[`docs/modelo-datos.md`](docs/modelo-datos.md)

Este archivo contiene un diagrama ER en formato Mermaid basado en el esquema real definido en `database/schema.sql` y en `src/config/database.js`. Representa las tablas actuales del sistema: `usuarios`, `vehiculos`, `historial`, `talleres` y `deudas`.

---

## Pruebas manuales sugeridas

1. Registrar un usuario con rol `dueno`.
2. Iniciar sesión.
3. Registrar un vehículo.
4. Intentar registrar la misma patente — debe retornar error.
5. Buscar el vehículo por patente.
6. Cerrar sesión. Registrar un usuario con rol `taller`.
7. Cargar un servicio al historial del vehículo (usando su ID).
8. Consultar historial por ID del vehículo.
9. Consultar historial por patente.
10. Cambiar contraseña. Verificar login con la nueva.
11. Verificar que el taller NO puede registrar vehículos (403).
12. Verificar que el dueño NO puede cargar historial (403).

---

## Pruebas

### Ejecutar tests unitarios

```bash
npm test                 # Corre los 49 tests unitarios
npm run test:coverage    # Genera reporte de cobertura en coverage/
```

### Cobertura (módulos productivos activos)

| Módulo | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `authController.js` | 100 % | 100 % | 100 % | 100 % |
| `historialController.js` | 100 % | 100 % | 100 % | 100 % |
| `vehiculoController.js` | 100 % | 100 % | 100 % | 100 % |
| `authMiddleware.js` | 100 % | 100 % | 100 % | 100 % |

La cobertura corresponde al 100 % de los módulos productivos activos incluidos en el alcance unitario del TP4.
El reporte HTML detallado está en `coverage/lcov-report/index.html`.
Documentación completa: [`docs/tp4-testing.md`](docs/tp4-testing.md).

---

## Estado actual del proyecto

### Funcionalidades implementadas

- Registro de usuarios con email normalizado
- Login con JWT (24h de expiración)
- Roles y control de acceso por rol
- Cambio de contraseña autenticado
- Registro de vehículos con normalización de patente
- Validación de patentes duplicadas
- Búsqueda de vehículo por patente con datos del propietario
- Historial de servicios por ID de vehículo o patente
- Carga de servicios al historial
- Frontend rediseñado con layout moderno (sidebar, cards, timeline)
- Frontend separado en HTML / CSS / JS

### Pendiente o previsto a futuro

- Tests de integración (Supertest)
- Módulo funcional de deudas (endpoints CRUD)
- Módulo funcional de talleres (certificaciones, perfil)
- Validación de formato de patente
- Deploy en entorno productivo
- Mejoras de seguridad y auditoría
- Migración a PostgreSQL para producción multiusuario
- Eliminar archivos heredados no activos (`usuarioController.js`, `routes/usuarios.js`, `routes/vehiculos.js`)

---

## GitHub Flow

| Rama | Uso |
|---|---|
| `main` | Rama estable. Recibe merges desde feature/* vía Pull Request. |
| `feature/*` | Ramas de trabajo por funcionalidad. Se eliminan tras el merge. |

El flujo de trabajo es: crear rama `feature/*` → desarrollar → Pull Request → revisión → merge a `main`.

---

## Justificación del Stack

| Tecnología | Razón |
|---|---|
| Node.js + Express | Conocimiento previo del equipo. Rápido de configurar para APIs REST. |
| SQLite | Sin servidor externo. Ideal para prototipo académico y desarrollo local. |
| JWT | Autenticación stateless sin sesiones en servidor. |
| JavaScript vanilla | Sin framework ni build step. Código directo y comprensible. |
| bcryptjs | Estándar para hasheo seguro de contraseñas. |
