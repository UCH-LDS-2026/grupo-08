# Inicio rápido local — HistoryCar

Universidad Champagnat · LDS 2026 · Grupo 8

Guía paso a paso para levantar HistoryCar en cualquier Mac de desarrollo.

---

## Requisitos previos

- **Node.js v18+** (recomendado: v24 LTS via nvm)
- **Git**

Si Node.js no está instalado, ejecutar primero:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# Cerrar y reabrir la terminal, luego:
nvm install --lts
```

---

## Pasos

### 1. Clonar (si no lo hiciste) y entrar a la carpeta

```bash
git clone https://github.com/UCH-LDS-2026/grupo-08.git
cd grupo-08
```

Si ya tenés el repositorio clonado, solo ingresá a su carpeta:</p>

```bash
cd <ruta-donde-clonaste>/grupo-08
```

### 2. Activar Node.js (solo si usás nvm)

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Esto es necesario en cada terminal nueva hasta que `.zshrc` lo cargue automáticamente.

### 3. Instalar dependencias

```bash
npm install
```

Solo necesario la primera vez, o cuando cambia `package.json`.

### 4. Crear el archivo `.env`

```bash
cp .env.example .env
```

El archivo `.env` debe contener:

```
PORT=3000
JWT_SECRET=clave_secreta_para_desarrollo
```

> `.env` no se sube a GitHub. No cambiar estos valores en producción.

### 5. Reiniciar datos demo locales

```bash
npm run reset:demo
```

Este comando:
- Elimina todos los datos locales existentes
- Crea la base de datos con tablas vacías (si no existe)
- Crea una cuenta administradora lista para usar

**Cuenta creada:**

| Campo | Valor |
|---|---|
| Email | `admin@gmail.com` |
| Password | `admin` |
| Rol | `admin` |

> ⚠️ Esta cuenta es **solo para demo local**. La contraseña `admin` no cumple el mínimo de 6 caracteres que se exige en la app general. No usar en producción.

### 6. Ejecutar el servidor

```bash
npm start
```

Deberías ver:

```
Base de datos SQLite lista ✅
Servidor corriendo en http://localhost:3000
```

Para detener el servidor: `Ctrl + C`

### 7. Abrir en el navegador

```
http://localhost:3000
```

### 8. Iniciar sesión con la cuenta demo

- **Email:** `admin@gmail.com`
- **Password:** `admin`

---

## Flujo recomendado para pruebas

### Desde la cuenta admin:

1. Iniciar sesión con `admin@gmail.com / admin`.
2. En el sidebar, ir a **Crear usuarios** (pestaña visible solo para admin).
3. Crear una cuenta de dueño:
   - Nombre: `Dueño Demo`
   - Email: `dueno@test.com`
   - Password: `dueno123`
   - Rol: `Dueño de vehículo`
4. Crear una cuenta de taller:
   - Nombre: `Taller Demo`
   - Email: `taller@test.com`
   - Password: `taller123`
   - Rol: `Taller mecánico`

### Probar el flujo de dueño:

5. Cerrar sesión e iniciar con `dueno@test.com / dueno123`.
6. Registrar un vehículo (ej: patente `ABC123`, Toyota Corolla 2020).
7. Buscar el vehículo por patente.

### Probar el flujo de taller:

8. Cerrar sesión e iniciar con `taller@test.com / taller123`.
9. Ir al panel de historial y crear el perfil de taller (nombre, dirección opcional).
10. Volver a la cuenta admin y certificar el taller desde `GET /api/talleres/pendientes` (o desde herramienta de prueba como curl/Postman).
11. Con el taller certificado, cargar un servicio al historial del vehículo `ABC123`.

---

## Roles y permisos

| Rol | Puede hacer |
|---|---|
| `dueno` | Registrar vehículos · Ver mis vehículos · Buscar por patente |
| `taller` | Crear perfil de taller · Cargar historial (si está certificado) · Ver historial |
| `admin` | Todo lo anterior · Crear usuarios internos · Certificar talleres |

---

## Comandos útiles

```bash
npm start              # Inicia el servidor en http://localhost:3000
npm run reset:demo     # Reinicia datos locales y crea admin demo
npm test               # Corre los 143 tests unitarios
npm run test:coverage  # Tests + reporte de cobertura en coverage/
npm run create:admin   # Crea un admin personalizado (con variables de entorno)
```

---

## Notas importantes

- `npm run reset:demo` **elimina todos los datos locales**. Usarlo solo cuando querés empezar de cero.
- `historycar.db` no se sube a GitHub (está en `.gitignore`).
- La cuenta `admin@gmail.com / admin` es solo para demo local. En un entorno real, usar `npm run create:admin` con una contraseña segura.
- Los archivos `coverage/`, `node_modules/` y `.env` tampoco se versionan.
