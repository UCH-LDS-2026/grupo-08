const express = require('express');
const cors = require('cors');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET no está definido en las variables de entorno.');
    console.error('Copiá el archivo .env.example a .env y configurá las variables.');
    process.exit(1);
}

const db = require('./config/database');
const authRoutes     = require('./routes/authRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const historialRoutes = require('./routes/historialRoutes');
const tallerRoutes   = require('./routes/tallerRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth',      authRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/talleres',  tallerRoutes);


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
