const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const historialRoutes = require('./routes/historialRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/historial', historialRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'HistoryCar API funcionando ✅',
        version: '1.0.0',
        equipo: 'Grupo 08',
        rutas: [
            'POST /api/auth/registro',
            'POST /api/auth/login',
            'POST /api/vehiculos',
            'GET /api/vehiculos/mis-vehiculos',
            'GET /api/vehiculos/patente/:patente',
            'POST /api/historial',
            'GET /api/historial/vehiculo/:vehiculo_id'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
