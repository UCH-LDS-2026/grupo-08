# TP4 — Calidad y Testing unitario

Universidad Champagnat · LDS 2026 · Grupo 8

---

## Objetivo

Incorporar pruebas unitarias automatizadas al proyecto HistoryCar como parte del Trabajo Práctico 4 de Calidad y Testing.

---

## Herramientas

| Herramienta | Versión | Rol |
|---|---|---|
| Jest | ^30.4.2 | Framework de testing y cobertura |
| Node.js | v24.16.0 (LTS) | Entorno de ejecución |

No se utiliza Supertest ni ninguna herramienta de integración. Esta etapa cubre exclusivamente pruebas **unitarias**.

---

## Alcance del testing

Las pruebas cubren los **módulos productivos activos**, es decir, los que están registrados y ejecutándose en `src/index.js`:

| Módulo | Archivo | Funciones probadas |
|---|---|---|
| Middleware de autenticación | `src/middlewares/authMiddleware.js` | `verificarToken`, `verificarRoles` |
| Controlador de autenticación | `src/controllers/authController.js` | `registro`, `login`, `cambiarPassword` |
| Controlador de vehículos | `src/controllers/vehiculoController.js` | `crear`, `misvehiculos`, `buscarPorPatente` |
| Controlador de historial | `src/controllers/historialController.js` | `agregar`, `obtenerPorVehiculo`, `obtenerPorPatente` |

### Archivos excluidos del alcance

Los siguientes archivos existen en el repositorio pero **no están montados en `src/index.js`**
y por lo tanto no forman parte del runtime actual del sistema:

| Archivo | Motivo de exclusión |
|---|---|
| `src/controllers/usuarioController.js` | Implementación alternativa de auth sin normalización de email ni capa de modelo. No registrado en `src/index.js`. Debe evaluarse para eliminación en un PR separado. |
| `src/routes/usuarios.js` | Rutas para `usuarioController.js`. No montadas en el servidor. |
| `src/routes/vehiculos.js` | Referencia a funciones (`listar`, `actualizarKilometraje`) que no existen en `vehiculoController.js`. No montadas en el servidor. |

La cobertura se calcula exclusivamente sobre los **módulos productivos activos** listados arriba.
**No representa el 100 % del proyecto total**, sino el 100 % de cobertura en los módulos productivos activos incluidos en el alcance unitario del TP4.

---

## Estrategia de aislamiento

Todos los tests son **unitarios puros**: ninguno crea, lee ni modifica `historycar.db`.

El aislamiento se logra mediante mocks de Jest aplicados a nivel de módulo:

| Test file | Módulos mockeados |
|---|---|
| `authMiddleware.test.js` | `jsonwebtoken` |
| `authController.test.js` | `bcryptjs`, `jsonwebtoken`, `../../src/models/usuarioModel` |
| `vehiculoController.test.js` | `../../src/models/vehiculoModel` |
| `historialController.test.js` | `../../src/models/historialModel`, `../../src/models/vehiculoModel` |

Al mockear los modelos completos, `src/config/database.js` nunca se carga y `better-sqlite3` no abre ningún archivo. Verificado mediante comparación de timestamps antes y después de cada ejecución.

---

## Cobertura real del alcance (TP4)

Cobertura calculada sobre los 4 módulos del alcance. Datos del archivo `docs/tp4-coverage-summary.json`.

| Archivo | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `authController.js` | 100 % (50/50) | 100 % (35/35) | 100 % (3/3) | 100 % (50/50) |
| `historialController.js` | 100 % (25/25) | 100 % (12/12) | 100 % (3/3) | 100 % (25/25) |
| `vehiculoController.js` | 100 % (21/21) | 100 % (14/14) | 100 % (3/3) | 100 % (21/21) |
| `authMiddleware.js` | 100 % (17/17) | 100 % (6/6) | 100 % (3/3) | 100 % (16/16) |
| **Total del alcance** | **100 % (113/113)** | **100 % (67/67)** | **100 % (12/12)** | **100 % (112/112)** |

---

## Estructura de archivos de test

```
tests/
└── unit/
    ├── authMiddleware.test.js    (7 tests)
    ├── authController.test.js    (18 tests)
    ├── vehiculoController.test.js (11 tests)
    └── historialController.test.js (13 tests)
```

**Total: 49 tests en 4 suites.**

---

## Detalle de tests por módulo

### authMiddleware.test.js — 7 tests

`verificarToken`:
- Retorna 401 sin header Authorization
- Retorna 401 con header sin Bearer token
- Retorna 401 con token inválido o expirado
- Llama a `next()` y asigna `req.usuario` con token válido

`verificarRoles`:
- Llama a `next()` si el rol está en la lista permitida
- Retorna 403 si el rol no está permitido
- Retorna 403 para rol completamente desconocido

### authController.test.js — 18 tests

`registro` (7): campos obligatorios · email duplicado · rol inválido · error UNIQUE en BD · error genérico en BD · creación exitosa · normalización de email

`login` (5): campos obligatorios · usuario no encontrado · password incorrecta · login exitoso con token · normalización de email

`cambiarPassword` (6): campos obligatorios · contraseñas no coinciden · longitud mínima · usuario no encontrado · password actual incorrecta · actualización exitosa

### vehiculoController.test.js — 11 tests

`crear` (6): patente faltante · otros campos faltantes · patente duplicada · creación exitosa · normalización de patente a mayúsculas · kilometraje 0 por defecto

`misvehiculos` (2): lista con vehículos · lista vacía

`buscarPorPatente` (3): no encontrado · encontrado con datos de dueño · normalización de patente

### historialController.test.js — 13 tests

`agregar` (7): sin vehiculo_id · sin tipo_servicio · sin kilometraje · sin fecha · vehículo no encontrado · registro exitoso · taller_id tomado de `req.usuario.id`

`obtenerPorVehiculo` (3): vehículo no encontrado · retorna vehículo + historial · historial vacío

`obtenerPorPatente` (3): vehículo no encontrado · normalización de patente · retorna vehículo + historial

---

## Cómo ejecutar

```bash
# Solo tests
npm test

# Tests con reporte de cobertura (genera coverage/)
npm run test:coverage
```

El reporte HTML de cobertura queda en:

- `coverage/lcov-report/index.html` (formato LCOV — recomendado para revisión)
- `coverage/index.html` (formato HTML nativo de Istanbul)

El resumen en JSON queda en `docs/tp4-coverage-summary.json`.

---

## Trabajo pendiente

- Tests de integración con Supertest (etapa posterior al TP4)
- Evaluar y eliminar archivos heredados (`usuarioController.js`, `routes/usuarios.js`, `routes/vehiculos.js`) en un PR separado
- Agregar `coverage/` y `.claude/` al `.gitignore` si aún no están ✓ (ya agregados en este PR)
