# Modelo de datos — HistoryCar

Universidad Champagnat · LDS 2026 · Grupo 8

Basado en el esquema real definido en [`database/schema.sql`](../database/schema.sql)
y en [`src/config/database.js`](../src/config/database.js).

---

## Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram

    usuarios {
        INTEGER id PK "AUTOINCREMENT"
        TEXT nombre "NOT NULL"
        TEXT email UK "NOT NULL · normalizado a minusculas"
        TEXT password "NOT NULL · hash bcrypt sal 10"
        TEXT rol "CHECK: dueno OR taller OR admin"
        DATETIME creado_en "DEFAULT CURRENT_TIMESTAMP"
    }

    vehiculos {
        INTEGER id PK "AUTOINCREMENT"
        TEXT patente UK "NOT NULL · normalizada a MAYUSCULAS"
        TEXT vin "nullable · numero de chasis opcional"
        TEXT marca "NOT NULL"
        TEXT modelo "NOT NULL"
        INTEGER anio "NOT NULL"
        INTEGER kilometraje "DEFAULT 0"
        INTEGER dueno_id FK "NOT NULL"
        DATETIME creado_en "DEFAULT CURRENT_TIMESTAMP"
    }

    historial {
        INTEGER id PK "AUTOINCREMENT"
        INTEGER vehiculo_id FK "NOT NULL"
        INTEGER taller_id FK "NOT NULL"
        TEXT tipo_servicio "NOT NULL · sin CHECK en BD"
        TEXT descripcion "nullable"
        INTEGER kilometraje_servicio "NOT NULL"
        DATE fecha_servicio "NOT NULL"
        DATETIME creado_en "DEFAULT CURRENT_TIMESTAMP"
    }

    talleres {
        INTEGER id PK "AUTOINCREMENT"
        INTEGER usuario_id FK "NOT NULL"
        TEXT nombre_taller "NOT NULL"
        TEXT direccion "nullable"
        TEXT telefono "nullable"
        INTEGER certificado "DEFAULT 0"
    }

    deudas {
        INTEGER id PK "AUTOINCREMENT"
        INTEGER vehiculo_id FK "NOT NULL"
        TEXT tipo "CHECK: multa OR patente OR otro"
        TEXT descripcion "nullable"
        REAL monto "nullable"
        INTEGER pagado "DEFAULT 0 · 1 = pagado"
        DATE fecha "NOT NULL"
    }

    usuarios ||--o{ vehiculos  : "dueno_id — un usuario puede tener N vehiculos"
    usuarios ||--o{ historial  : "taller_id — un usuario carga N servicios"
    usuarios ||--o{ talleres   : "usuario_id — un usuario puede tener N perfiles de taller"
    vehiculos ||--o{ historial : "vehiculo_id — un vehiculo tiene N registros de servicio"
    vehiculos ||--o{ deudas    : "vehiculo_id — un vehiculo puede tener N deudas"
```

---

## Descripción de tablas

### `usuarios`
Almacena todos los usuarios del sistema. El campo `email` se normaliza a minúsculas antes de guardarse, garantizando unicidad sin distinción de mayúsculas. La `password` se almacena como hash bcrypt (sal 10), nunca en texto plano. El `rol` está restringido por CHECK a los valores `dueno`, `taller` o `admin`.

### `vehiculos`
Registra los vehículos ingresados al sistema. La `patente` se normaliza a mayúsculas y es única. El campo `vin` (número de chasis) es opcional. `dueno_id` apunta al usuario propietario mediante FK a `usuarios.id`.

### `historial`
Registra los servicios realizados sobre un vehículo. `vehiculo_id` y `taller_id` son FKs obligatorias. El campo `tipo_servicio` **no tiene restricción CHECK en la base de datos** — los valores `service`, `reparacion`, `inspeccion` y `siniestro` son validados y seleccionados por el frontend. `descripcion` es opcional.

### `talleres`
Perfil extendido del usuario con rol taller. `usuario_id` apunta a `usuarios.id`. Sin restricción UNIQUE sobre `usuario_id`, por lo que un usuario puede tener múltiples registros de perfil de taller (relación 1:N). **Sin endpoints API activos en esta versión.**

### `deudas`
Prevista para registrar multas, patentes impagas u otras obligaciones vinculadas a un vehículo. `tipo` está restringido por CHECK a `multa`, `patente` u `otro`. `pagado` es un entero (0 = pendiente, 1 = pagado). `monto` es opcional (REAL nullable). **Sin endpoints API activos en esta versión.**

---

## Relaciones

| Relación | Cardinalidad | Columna FK |
|---|---|---|
| `usuarios` → `vehiculos` | 1:N | `vehiculos.dueno_id` |
| `usuarios` → `historial` | 1:N | `historial.taller_id` |
| `usuarios` → `talleres` | 1:N | `talleres.usuario_id` |
| `vehiculos` → `historial` | 1:N | `historial.vehiculo_id` |
| `vehiculos` → `deudas` | 1:N | `deudas.vehiculo_id` |

---

## Notas técnicas

- **Integridad referencial:** declarada mediante `FOREIGN KEY ... REFERENCES`, pero SQLite no la aplica por defecto a menos que se active `PRAGMA foreign_keys = ON`. El código actual no activa este PRAGMA.
- **tipo_servicio sin CHECK:** la restricción de valores válidos es responsabilidad exclusiva del frontend. A nivel SQL, cualquier texto es aceptable en esta columna.
- **talleres y deudas:** el esquema está definido y las tablas se crean al iniciar el servidor, pero no tienen controladores, modelos ni rutas activas en la versión actual.
