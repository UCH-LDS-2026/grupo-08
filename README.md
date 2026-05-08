# HistoryCar 🚗
Ecosistema inteligente para la trazabilidad y gestión automotriz.

#### Universidad Champagnat - Laboratorio de Desarrollo de Software - 2026

## Proyecto Final - Grupo N.º 8

### Integrantes
- Ignacio Azzolina
- Constantino Mateu
- Arian Nuñez

---

## Descripción breve

**HistoryCar** es una plataforma digital pensada para registrar, consultar y validar el historial técnico, legal y comercial de vehículos usados. Su objetivo principal es mejorar la transparencia entre propietarios, talleres mecánicos, concesionarias y futuros compradores, permitiendo que cada vehículo cuente con una identidad digital confiable vinculada a su número de chasis o VIN.

---

## Problema que resuelve

El mercado automotriz sufre de falta de información confiable sobre el estado real de los vehículos usados. Al momento de comprar o vender un auto, el historial de mantenimiento suele perderse, estar incompleto o depender únicamente de lo que declara el vendedor.

Esta situación genera distintos problemas:

- pérdida de confianza entre compradores y vendedores;
- reducción del valor de reventa de vehículos bien mantenidos;
- diagnósticos mecánicos más lentos por falta de antecedentes;
- desconocimiento de reparaciones, fallas eléctricas o siniestros previos;
- posibles sorpresas legales, como multas o patentes impagas.

HistoryCar busca centralizar y proteger esta información para reducir los puntos ciegos del ecosistema automotriz.

---

## Usuarios del sistema

| Usuario | Necesidad principal |
|---|---|
| Dueños de vehículos | Conservar el historial de su auto, recibir alertas de mantenimiento y proteger su valor de reventa. |
| Talleres mecánicos independientes | Digitalizar órdenes de trabajo, consultar antecedentes técnicos y mejorar la transparencia con sus clientes. |
| Concesionarias y agencias | Consultar historiales verificados para respaldar operaciones de compra y venta de vehículos usados. |
| Administradores del sistema | Gestionar usuarios, roles, vehículos, permisos y auditoría de registros. |

---

## Stack Tecnológico

| Capa | Tecnología | Uso |
|---|---|---|
| Backend | Node.js + Express.js | API REST |
| Base de datos | SQLite (better-sqlite3) | Almacenamiento local |
| Autenticación | JWT + bcryptjs | Sesiones stateless |

### Justificación del Stack
Se eligió Node.js con Express.js por su simplicidad para construir APIs REST y por el conocimiento previo del equipo en JavaScript. SQLite fue seleccionada como base de datos por su naturaleza serverless, eliminando la necesidad de configurar un servidor externo. JWT permite implementar autenticación stateless y segura, ideal para un sistema con múltiples roles.

---

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

---

## Estrategia de Ramas
- `main` — rama protegida, producción
- `develop` — integración de features
- `feature/*` — desarrollo de funcionalidades

---

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

---

## Estructura del repositorio

```text
grupo-08/
│
├── src/
│   ├── config/         Base de datos
│   ├── controllers/    Lógica de negocio
│   ├── middleware/     Autenticación JWT
│   ├── models/         Modelos de datos
│   ├── routes/         Rutas de la API
│   └── index.js        Punto de entrada
│
├── trabajos-practicos/ Materiales y entregas de la materia
│
└── README.md
```
