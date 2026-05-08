# HistoryCar

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

## Solución propuesta

La solución consiste en crear un **pasaporte digital del vehículo**, donde se registre su historial de mantenimiento, reparaciones, repuestos, siniestros, estado legal y demás datos relevantes.

Cada vehículo estaría identificado de forma única mediante su número de chasis o VIN. De esta manera, el historial no dependería solamente del dueño actual, sino que acompañaría al vehículo durante toda su vida útil.

---

## Usuarios del sistema

| Usuario | Necesidad principal |
|---|---|
| Dueños de vehículos | Conservar el historial de su auto, recibir alertas de mantenimiento y proteger su valor de reventa. |
| Talleres mecánicos independientes | Digitalizar órdenes de trabajo, consultar antecedentes técnicos y mejorar la transparencia con sus clientes. |
| Concesionarias y agencias | Consultar historiales verificados para respaldar operaciones de compra y venta de vehículos usados. |
| Administradores del sistema | Gestionar usuarios, roles, vehículos, permisos y auditoría de registros. |

---

## Funcionalidades principales

- **Trazabilidad 360° e identidad digital:** registro del historial del vehículo asociado permanentemente al número de chasis o VIN.
- **Historial de mantenimiento:** carga y consulta de reparaciones, servicios realizados, repuestos utilizados y observaciones técnicas.
- **Control de acceso basado en roles (RBAC):** permisos diferenciados para dueños, talleres, concesionarias y administradores.
- **Registros técnicos validados:** solo talleres o entidades autorizadas podrían cargar o modificar información técnica sensible.
- **Alertas de mantenimiento:** avisos preventivos para próximos servicios, vencimientos o controles recomendados.
- **Sistema de reputación validado:** reseñas de talleres basadas en reparaciones efectivamente realizadas.
- **Asistencia con inteligencia artificial:** uso futuro de agentes de IA para sugerir diagnósticos, procedimientos o alertas en base al historial del vehículo.

---

## Alcance inicial del MVP

Para una primera versión del proyecto, se propone desarrollar un MVP con las siguientes funcionalidades mínimas:

1. Registro e inicio de sesión de usuarios.
2. Alta, baja y modificación de vehículos.
3. Asociación de vehículos a propietarios.
4. Carga de mantenimientos y reparaciones por parte de talleres.
5. Consulta del historial de un vehículo.
6. Roles básicos: propietario, taller y administrador.
7. Visualización simple del estado general del vehículo.

Las funcionalidades avanzadas, como agentes de IA, integración con bases gubernamentales, reputación validada y automatizaciones con n8n, podrán incorporarse en etapas posteriores.

---

## Stack tecnológico propuesto

| Capa | Tecnología | Uso previsto |
|---|---|---|
| Frontend web | React.js | Portal de gestión para talleres, concesionarias y administradores. |
| Aplicación móvil | React Native | Aplicación para dueños de vehículos. |
| Backend / BaaS | Supabase | Autenticación, base de datos, seguridad y APIs. |
| Base de datos | PostgreSQL | Almacenamiento relacional de usuarios, vehículos, roles e historiales. |
| Automatización | n8n | Flujos automáticos, alertas y notificaciones. |
| Inteligencia Artificial | OpenAI / Gemini | Asistencia para diagnósticos, recomendaciones y análisis de historial. |

---

## Estructura del repositorio

Estructura inicial sugerida para el proyecto:

```text
grupo-08/
│
├── frontend/
│   └── Aplicación web en React.js
│
├── mobile/
│   └── Aplicación móvil en React Native
│
├── backend/
│   └── Configuraciones, servicios o integraciones del sistema
│
├── docs/
│   └── Documentación funcional y técnica del proyecto
│
├── trabajos-practicos/
│   └── Materiales y entregas de la materia
│
└── README.md
```

> Nota: la estructura definitiva podrá modificarse a medida que avance el desarrollo del proyecto.

---

## Cómo ejecutar el proyecto

Actualmente el proyecto se encuentra en etapa inicial de análisis, documentación y definición funcional. La estructura ejecutable del sistema se incorporará progresivamente.

Cuando el proyecto tenga una estructura técnica completa, los pasos generales serán:

```bash
git clone https://github.com/UCH-LDS-2026/grupo-08.git
cd grupo-08
npm install
npm run dev
```

En caso de utilizar variables de entorno, se deberá crear un archivo `.env` a partir de un archivo de ejemplo `.env.example`, configurando las credenciales correspondientes de Supabase, APIs externas y servicios de automatización.

---

## Estado actual del proyecto

El proyecto se encuentra en una etapa inicial. Actualmente el repositorio contiene la documentación base de la idea, información general del sistema y materiales de trabajo vinculados a la materia.

Próximamente se debería avanzar con:

- definición detallada de requerimientos funcionales;
- diseño de pantallas principales;
- modelado de base de datos;
- creación de la estructura inicial del frontend;
- configuración de Supabase;
- definición de roles y permisos;
- implementación del primer MVP.

---

## Próximos pasos

1. Completar los requerimientos funcionales y no funcionales.
2. Diseñar el modelo entidad-relación inicial.
3. Crear la estructura base del proyecto frontend.
4. Definir las pantallas principales del sistema.
5. Configurar autenticación y roles en Supabase.
6. Implementar el módulo de vehículos.
7. Implementar el módulo de historial de mantenimiento.
8. Preparar una primera versión demostrable del MVP.
