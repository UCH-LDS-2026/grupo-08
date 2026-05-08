# HistoryCar 🚗
Ecosistema inteligente para la trazabilidad y gestión automotriz.

#### Universidad Champagnat - Laboratorio de Desarrollo de Software - 2026

## Grupo 08

### Integrantes
- Ignacio Azzolina
- Constantino Mateu
- Arian Nuñez

## Problema que resuelve

El mercado automotriz sufre de "amnesia mecánica" y falta de transparencia. Al comprar o vender un vehículo usado, el historial de mantenimiento suele perderse o ser dudoso, lo que reduce la confianza y el valor de reventa. Simultáneamente, los talleres mecánicos pierden tiempo valioso en diagnósticos "a ciegas" al desconocer reparaciones o fallas eléctricas previas, mientras que los usuarios frecuentemente se encuentran con sorpresas legales (multas o patentes impagas) al momento de transferir el dominio. HistoryCar centraliza y protege esta información para eliminar los puntos ciegos del ecosistema automotriz.

## Usuarios

- **Dueños de vehículos:** Buscan tener el "pasaporte digital" de su auto siempre a mano, proteger su valor de reventa y recibir alertas tempranas de mantenimiento.
- **Talleres mecánicos independientes:** Necesitan digitalizar sus órdenes de trabajo, fidelizar a sus clientes mediante la transparencia y optimizar tiempos de diagnóstico.
- **Concesionarias y Agencias:** Requieren historiales verificados para brindar garantías comprobables en la compra y venta de flotas o unidades usadas.

## Stack Tecnológico
- **Lenguaje:** JavaScript (Node.js)
- **Framework:** Express.js
- **Base de datos:** SQLite (better-sqlite3)
- **Autenticación:** JWT + bcryptjs

## Justificación del Stack
Se eligió Node.js con Express.js por su simplicidad para construir APIs REST y por el conocimiento previo del equipo en JavaScript. SQLite fue seleccionada como base de datos por su naturaleza serverless, eliminando la necesidad de configurar un servidor de base de datos externo, lo que facilita la instalación y el desarrollo local. JWT permite implementar autenticación stateless y segura, ideal para un sistema con múltiples roles de usuario como HistoryCar.

## Requisitos previos
- Node.js v18 o superior
- npm v9 o superior
- Git

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/UCH-LDS-2026/grupo-08.git
cd grupo-08
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```
Editar el archivo `.env` con sus valores.

### 4. Iniciar el servidor
```bash
npm run dev
```

### 5. Verificar instalación
Abrir en el navegador: `http://localhost:3000`

## Estrategia de Ramas
- `main` — rama protegida, producción
- `develop` — integración de features
- `feature/*` — desarrollo de funcionalidades

## Rutas disponibles
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /api/auth/registro | Registrar usuario | No |
| POST | /api/auth/login | Iniciar sesión | No |
| POST | /api/vehiculos | Registrar vehículo | Sí |
| GET | /api/vehiculos/mis-vehiculos | Ver mis vehículos | Sí |
| GET | /api/vehiculos/patente/:patente | Buscar por patente | No |
| POST | /api/historial | Agregar servicio | Sí |
| GET | /api/historial/vehiculo/:id | Ver historial | No |
