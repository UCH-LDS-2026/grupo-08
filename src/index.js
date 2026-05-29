/* ==========================================================
   ARCHIVO: src/index.js
   ROL: Punto de entrada del servidor. Configura Express,
         registra todas las rutas y arranca en el puerto definido.
   RUTAS REGISTRADAS:
     /api/auth       → src/routes/authRoutes.js
     /api/vehiculos  → src/routes/vehiculoRoutes.js
     /api/historial  → src/routes/historialRoutes.js
     /api/deudas     → src/routes/deudasRoutes.js
     /api/talleres   → src/routes/talleresRoutes.js
   ARCHIVOS ESTÁTICOS: carpeta /public (sirve el frontend index.html)
   VARIABLES DE ENTORNO: PORT, JWT_SECRET (ver .env.example)
   ========================================================== */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// [SEGURIDAD] Abortar si no está configurado JWT_SECRET.
// Sin esta variable no se pueden generar ni verificar tokens.
if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET no está definido en las variables de entorno.');
    console.error('Copiá el archivo .env.example a .env y configurá las variables.');
    process.exit(1);
}

// [DB] Importar la DB para asegurarnos que las tablas se crean al arrancar
const db = require('./config/database');

// ----------------------------------------------------------
// RUTAS
// ----------------------------------------------------------
const authRoutes      = require('./routes/authRoutes');
const vehiculoRoutes  = require('./routes/vehiculoRoutes');
const historialRoutes = require('./routes/historialRoutes');
const deudasRoutes    = require('./routes/deudasRoutes');
const talleresRoutes  = require('./routes/talleresRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------------
// MIDDLEWARES GLOBALES
// ----------------------------------------------------------
app.use(cors());                    // Habilita CORS para todos los orígenes
app.use(express.json());            // Parsea el body de las requests como JSON
app.use(express.static('public'));  // Sirve el frontend desde /public

// ----------------------------------------------------------
// REGISTRO DE RUTAS
// ----------------------------------------------------------
app.use('/api/auth',      authRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/deudas',    deudasRoutes);
app.use('/api/talleres',  talleresRoutes);

// ----------------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
