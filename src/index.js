const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'HistoryCar API funcionando ✅',
        version: '1.0.0',
        equipo: 'Grupo 08',
        rutas: [
            'POST /api/auth/registro',
            'POST /api/auth/login'
        ]
    });
});

app.get('/test-db', (req, res) => {
    const resultado = db.prepare('SELECT 1 + 1 AS resultado').get();
    res.json({
        mensaje: 'Base de datos conectada ✅',
        resultado: resultado.resultado
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
