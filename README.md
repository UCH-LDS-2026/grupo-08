# HistoryCar 🚗

**Ecosistema web para trazabilidad y gestión del historial automotriz.**

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

En la compra, venta y mantenimiento de vehículos usados suele faltar información confiable sobre el estado real del auto. El historial de servicios puede estar incompleto, perderse entre dueños anteriores o depender solamente de lo que declara el vendedor.

Esto genera:

- menor confianza entre compradores, vendedores, dueños y mecánicos;
- pérdida de valor para vehículos bien mantenidos;
- diagnósticos mecánicos más lentos por falta de antecedentes;
- dificultad para conocer reparaciones, inspecciones, siniestros o servicios previos.

---

## Objetivo del sistema

HistoryCar permite registrar vehículos y mantener un historial técnico consultable por patente, con roles diferenciados y reglas de privacidad.

El MVP implementa:

- autenticación con JWT;
- registro público de dueños de vehículo;
- creación interna de usuarios por administrador;
- gestión de talleres mecánicos independientes;
- asociación obligatoria de usuarios mecánicos a un taller;
- registro de vehículos vinculados a un dueño;
- búsqueda de vehículos por patente con permisos por rol;
- registro de servicios por patente, sin exigir conocer el ID interno del vehículo;
- consulta de historial por patente o ID con control de acceso;
- cambio de contraseña;
- datos demo locales para facilitar la defensa y las pruebas.

---

## Usuarios y roles

| Rol | Descripción |
|---|---|
| `dueno` | Propietario de vehículos. Puede registrar y consultar sus propios vehículos. |
| `mecanico` | Usuario mecánico asociado a un taller. Puede consultar vehículos e historial y registrar servicios. |
| `admin` | Administrador. Gestiona usuarios, talleres, vehículos e historial. |

### Diferencia entre mecánico y taller

- **Mecánico**: es una cuenta de usuario que inicia sesión, tiene email, contraseña y rol `mecanico`.
- **Taller**: es una entidad independiente creada por el administrador, con nombre, dirección, teléfono y estado de certificación.
- Todo usuario con rol `mecanico` debe estar asociado a un `taller_id` existente.

### Permisos principales

| Acción | dueno | mecanico | admin |
|---|:---:|:---:|:---:|
| Registro público | ✓ | — | — |
| Login | ✓ | ✓ | ✓ |
| Cambiar contraseña | ✓ | ✓ | ✓ |
| Crear usuarios internos | — | — | ✓ |
| Crear talleres | — | — | ✓ |
| Registrar vehículo | ✓ | — | ✓ |
| Ver mis vehículos | ✓ | ✓ | ✓ |
| Buscar vehículo por patente | Solo propios | ✓ | ✓ |
| Consultar historial | Solo propios | ✓ | ✓ |
| Registrar servicio por patente | — | ✓ | ✓ |

---

## Stack tecnológico

### Frontend

- HTML5, CSS3 y JavaScript vanilla.
- Archivos principales: `public/index.html`, `public/css/styles.css`, `public/js/app.js`.
- No requiere framework ni proceso de build.

### Backend

- Node.js.
- Express.js.
- API REST bajo `/api`.

### Base de datos

- SQLite local.
- Driver `better-sqlite3`.
- Archivo local `historycar.db`, generado en la raíz del proyecto.

### Seguridad

- JWT con `jsonwebtoken`.
- Hash de contraseñas con `bcryptjs`.
- Variables de entorno con `dotenv`.
- Middleware de autenticación y control de roles.

---

## Requisitos previos

- Node.js v18 o superior, recomendado v22+.
- npm.
- Git.

Las dependencias exactas están declaradas en `package.json` y `package-lock.json`.

---

## Inicio rápido en macOS

El proyecto incluye un ejecutable local para macOS:

```text
INICIAR_HISTORYCAR.command
```

Uso:

1. Abrir la carpeta del proyecto en Finder.
2. Hacer doble clic en `INICIAR_HISTORYCAR.command`.
3. El script verifica Node/npm, instala dependencias si faltan, crea `.env`, crea datos demo si no existe la base, abre el navegador e inicia el servidor.

Si `historycar.db` ya existe, el script pregunta antes de reiniciar datos. Solo borra datos si el usuario escribe exactamente `SI`.

Más detalles en [`docs/INICIO_RAPIDO_LOCAL.md`](docs/INICIO_RAPIDO_LOCAL.md).

---

## Instalación manual

### 1. Clonar el repositorio

```bash
git clone https://github.com/UCH-LDS-2026/grupo-08.git
cd grupo-08
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo `.env`

En Linux/macOS:

```bash
cp .env.example .env
```

En Windows:

```cmd
copy .env.example .env
```

Contenido esperado:

```env
PORT=3000
JWT_SECRET=clave_secreta_para_desarrollo
```

### 4. Crear datos demo locales

```bash
npm run reset:demo
```

> ⚠️ Este comando elimina todos los datos locales existentes en `historycar.db` y recrea la base demo. No usar en producción.

### 5. Iniciar servidor

```bash
npm start
```

Abrir en el navegador:

```text
http://localhost:3000
```

---

## Datos demo

Después de ejecutar:

```bash
npm run reset:demo
```

se crean los siguientes datos:

| Tipo | Email / dato | Password |
|---|---|---|
| Administrador | `admin@gmail.com` | `admin` |
| Dueño demo | `dueno@test.com` | `dueno123` |
| Mecánico demo | `mecanico@test.com` | `mecanico123` |
| Taller demo | `Taller Demo SRL` | — |
| Vehículo demo | `ABC123`, Toyota Corolla 2020 | — |

La contraseña `admin` es una excepción local de demo. En el resto de la aplicación se exige contraseña mínima de 6 caracteres.

Las credenciales se guardan en SQLite, en la tabla `usuarios`. Las contraseñas se almacenan hasheadas con bcrypt, nunca en texto plano.

---

## Flujo recomendado para demo

1. Ejecutar `npm run reset:demo`.
2. Ejecutar `npm start`.
3. Iniciar sesión como administrador: `admin@gmail.com / admin`.
4. Crear un taller desde la pestaña **Talleres**.
5. Crear un usuario mecánico desde la pestaña **Usuarios** y asociarlo al taller creado.
6. Crear o usar un usuario dueño.
7. Registrar un vehículo para el dueño.
8. Iniciar sesión como mecánico.
9. Registrar un servicio usando la patente del vehículo.
10. Consultar el historial por patente.
11. Probar que un dueño no puede consultar vehículos ajenos.
12. Ejecutar `npm test` para mostrar las pruebas automatizadas.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor Express. |
| `npm run dev` | Inicia el servidor con nodemon. |
| `npm test` | Ejecuta los tests unitarios con Jest. |
| `npm run test:coverage` | Ejecuta tests y genera reporte de cobertura. |
| `npm run reset:demo` | Reinicia la base local y crea datos demo. |
| `npm run create:admin` | Crea un administrador personalizado usando variables de entorno. |

Ejemplo para crear un administrador personalizado:

```bash
ADMIN_NAME="Admin" ADMIN_EMAIL="admin@ejemplo.com" ADMIN_PASSWORD="admin123" npm run create:admin
```

---

## Estructura del repositorio

```text
grupo-08/
│
├── public/                       Frontend estático
│   ├── index.html                Interfaz principal
│   ├── css/
│   │   └── styles.css            Estilos
│   └── js/
│       └── app.js                Lógica del frontend
│
├── src/                          Backend
│   ├── index.js                  Punto de entrada del servidor
│   ├── config/
│   │   └── database.js           Conexión SQLite y creación de tablas
│   ├── controllers/              Lógica de negocio
│   │   ├── authController.js
│   │   ├── vehiculoController.js
│   │   ├── historialController.js
│   │   └── tallerController.js
│   ├── middlewares/
│   │   └── authMiddleware.js     JWT y control de roles
│   ├── models/                   Acceso a base de datos
│   │   ├── usuarioModel.js
│   │   ├── vehiculoModel.js
│   │   ├── historialModel.js
│   │   └── tallerModel.js
│   ├── routes/                   Endpoints Express
│   │   ├── authRoutes.js
│   │   ├── vehiculoRoutes.js
│   │   ├── historialRoutes.js
│   │   └── tallerRoutes.js
│   └── utils/                    Validaciones y saneamiento
│
├── database/
│   └── schema.sql                Esquema SQL documentado
│
├── docs/
│   ├── arquitectura.md
│   ├── modelo-datos.md
│   ├── INICIO_RAPIDO_LOCAL.md
│   ├── tp4-testing.md
│   └── tp4-coverage-summary.json
│
├── tests/
│   └── unit/                     Tests unitarios Jest
│
├── scripts/
│   ├── createAdmin.js
│   └── resetDemoData.js
│
├── INICIAR_HISTORYCAR.command    Inicio rápido local en macOS
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## Rutas API actuales

### Autenticación

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | `/api/auth/registro` | No | Público | Registro público, solo crea usuarios `dueno`. |
| POST | `/api/auth/login` | No | Público | Login, devuelve JWT y datos mínimos del usuario. |
| PUT | `/api/auth/cambiar-password` | Sí | Todos | Cambia la contraseña del usuario autenticado. |
| POST | `/api/auth/admin/usuarios` | Sí | admin | Crea usuarios internos `dueno`, `mecanico` o `admin`. |

### Vehículos

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | `/api/vehiculos` | Sí | dueno, admin | Registra un vehículo. |
| GET | `/api/vehiculos/mis-vehiculos` | Sí | Todos | Lista vehículos asociados al usuario autenticado. |
| GET | `/api/vehiculos/patente/:patente` | Sí | Todos | Busca por patente. El dueño solo puede consultar vehículos propios. |

### Historial

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | `/api/historial` | Sí | mecanico, admin | Registra un servicio usando patente. |
| GET | `/api/historial/vehiculo/:vehiculo_id` | Sí | Todos | Consulta historial por ID. Dueño solo puede ver vehículos propios. |
| GET | `/api/historial/patente/:patente` | Sí | Todos | Consulta historial por patente. Dueño solo puede ver vehículos propios. |

### Talleres

| Método | Ruta | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | `/api/talleres` | Sí | admin | Crea un taller independiente. |
| GET | `/api/talleres` | Sí | admin | Lista talleres existentes. |
| GET | `/api/talleres/:id` | Sí | admin | Obtiene un taller por ID. |

---

## Base de datos

SQLite local. El archivo `historycar.db` se crea en la raíz del proyecto y no se sube al repositorio.

### Tablas principales

| Tabla | Descripción |
|---|---|
| `talleres` | Talleres mecánicos independientes creados por admin. |
| `usuarios` | Cuentas del sistema con rol, password hasheada y posible `taller_id`. |
| `vehiculos` | Vehículos registrados y vinculados a un dueño. |
| `historial` | Servicios registrados sobre vehículos. |
| `deudas` | Tabla prevista para multas u obligaciones, sin endpoints activos. |

### Relaciones principales

```text
talleres 1:N usuarios        Un taller puede tener varios mecánicos.
usuarios 1:N vehiculos       Un dueño puede tener varios vehículos.
vehiculos 1:N historial      Un vehículo puede tener muchos servicios.
usuarios 1:N historial       Un mecánico puede cargar muchos servicios.
talleres 1:N historial       Un taller puede estar asociado a muchos servicios.
vehiculos 1:N deudas         Un vehículo puede tener muchas obligaciones futuras.
```

El esquema completo está en:

- [`src/config/database.js`](src/config/database.js)
- [`database/schema.sql`](database/schema.sql)

---

## Validaciones y reglas de negocio

- El registro público solo crea usuarios `dueno`.
- Los roles `mecanico` y `admin` solo pueden ser creados por un administrador.
- Un usuario `mecanico` debe estar asociado a un taller existente.
- Un dueño solo puede buscar y consultar historial de vehículos propios.
- Un mecánico puede consultar vehículos e historial, pero no ve el email del dueño.
- Los servicios se registran por patente; el backend resuelve internamente el ID del vehículo.
- La patente se normaliza a mayúsculas y se valida con formatos viejo/Mercosur.
- Las contraseñas se guardan con bcrypt.
- Las rutas protegidas exigen `Authorization: Bearer <token>`.
- SQLite usa `PRAGMA foreign_keys = ON` para aplicar integridad referencial.

---

## Testing

El proyecto usa Jest para pruebas unitarias.

```bash
npm test
npm run test:coverage
```

El reporte de cobertura documentado está en:

- [`docs/tp4-testing.md`](docs/tp4-testing.md)
- [`docs/tp4-coverage-summary.json`](docs/tp4-coverage-summary.json)

Los tests se ejecutan automáticamente en GitHub Actions para pull requests y pushes a `main`.

> Nota: el conteo exacto de tests y la cobertura pueden cambiar después de cada refactor. Para obtener el valor real actual, ejecutar `npm test` y `npm run test:coverage`.

---

## GitHub Flow

| Rama | Uso |
|---|---|
| `main` | Rama estable. Debe recibir cambios mediante Pull Request. |
| `feature/*` | Ramas de trabajo por funcionalidad. |

Flujo recomendado:

```text
crear rama feature/* → desarrollar → abrir Pull Request → revisar → mergear a main
```

---

## Justificación del stack

| Tecnología | Justificación |
|---|---|
| Node.js + Express | Permite construir una API REST simple, rápida y adecuada para el alcance académico. |
| SQLite | No requiere servidor externo. Es ideal para prototipos, demos y desarrollo local. |
| JavaScript vanilla | Evita complejidad de frameworks y permite enfocarse en arquitectura, lógica y persistencia. |
| JWT | Facilita autenticación stateless para endpoints protegidos. |
| bcryptjs | Permite almacenar contraseñas de forma segura mediante hashing. |
| Jest | Permite pruebas unitarias rápidas y automatizadas. |

---

## Estado actual y próximos pasos

### Implementado

- MVP web funcional.
- Autenticación y roles.
- Gestión de usuarios por admin.
- Gestión de talleres independientes.
- Asociación de mecánicos a talleres.
- Registro y consulta de vehículos.
- Registro de servicios por patente.
- Consulta de historial con control de acceso.
- Validaciones backend.
- Tests unitarios.
- Script de datos demo.
- Inicio rápido local en macOS.

### Pendiente o futuro

- Agregar tests de integración con Supertest.
- Actualizar diagramas y documentos técnicos si cambia el modelo.
- Implementar módulo funcional de deudas.
- Agregar ejecutable equivalente para Windows si se requiere inicio con doble clic.
- Deploy productivo.
- Migración a PostgreSQL para uso multiusuario real.

---

## Archivos no versionados

El repositorio ignora archivos locales o generados automáticamente:

- `.env`
- `historycar.db`
- `*.db`, `*.sqlite`, `*.sqlite3`
- `node_modules/`
- `coverage/`
- `.claude/`

Ver reglas en [`.gitignore`](.gitignore).
