#### Universidad Champagnat - Laboratorio de Desarrollo de Software - 2026

# Proyecto Final: HistoryCar
## Grupo N° 8

## Integrantes:
- Ignacio Azzolina
- Constantino Mateu
- Arian Nuñez

## Problema que resuelve

El mercado automotriz sufre de "amnesia mecánica" y falta de transparencia. Al comprar o vender un vehículo usado, el historial de mantenimiento suele perderse o ser dudoso, lo que reduce la confianza y el valor de reventa. Simultáneamente, los talleres mecánicos pierden tiempo valioso en diagnósticos "a ciegas" al desconocer reparaciones o fallas eléctricas previas, mientras que los usuarios frecuentemente se encuentran con sorpresas legales (multas o patentes impagas) al momento de transferir el dominio. HistoryCar centraliza y protege esta información para eliminar los puntos ciegos del ecosistema automotriz.

## Usuarios

- **Dueños de vehículos (Consumidores finales):** Buscan tener el "pasaporte digital" de su auto siempre a mano, proteger su valor de reventa y recibir alertas tempranas de mantenimiento.
- **Talleres mecánicos independientes:** Necesitan digitalizar sus órdenes de trabajo, fidelizar a sus clientes mediante la transparencia y optimizar tiempos utilizando asistencia de Inteligencia Artificial para diagnósticos complejos.
- **Concesionarias y Agencias:** Requieren historiales verificados para brindar garantías comprobables en la compra y venta de flotas o unidades usadas.

## Funcionalidades principales

- **Trazabilidad 360° e Identidad Digital:** Registro inmutable del historial de mantenimiento, repuestos, siniestros y estado legal, vinculado permanentemente al número de chasis (VIN).
- **Control de Acceso Basado en Roles (RBAC):** Sistema de seguridad donde únicamente los mecánicos y entidades certificadas tienen permisos para cargar o modificar registros técnicos en la plataforma.
- **Ecosistema de Agentes de IA:** Asistentes autónomos que cruzan el historial del vehículo con manuales de taller para sugerir procedimientos al mecánico, y consultan bases gubernamentales para alertar al usuario sobre infracciones.
- **Sistema de Reputación Validado:** Ranking de talleres impulsado por reseñas 100% verificadas, exclusivas para usuarios que efectivamente realizaron una reparación en dicho establecimiento.

## Stack tecnológico

- **Frontend:** React.js (Portal web de gestión para talleres) y React Native (Aplicación móvil para dueños de vehículos).
- **Backend y Base de Datos:** Supabase con PostgreSQL (para autenticación, gestión de bases de datos relacionales, políticas de seguridad y logs de auditoría) y n8n (para orquestación de flujos y automatización de alertas).
- **Inteligencia Artificial:** APIs de modelos fundacionales (ej. Gemini / OpenAI) para el procesamiento de los Agentes de IA.

## Cómo ejecutar el proyecto

1. Clonar el repositorio localmente usando `git clone [URL_DEL_REPOSITORIO]`.
2. Crear un archivo `.env` en la raíz del proyecto basándose en el `.env.example` y configurar las variables de entorno (Credenciales de Supabase, claves de APIs de Inteligencia Artificial y webhooks de n8n).
3. Instalar las dependencias del proyecto ejecutando `npm install` tanto en el directorio del cliente como en el del servidor.
4. Ejecutar las migraciones correspondientes en el panel de Supabase para generar las tablas estructurales (vehículos, usuarios, roles, historiales).
5. Iniciar el servidor de desarrollo local ejecutando `npm run dev`.
