const db = require('../config/database');

// GET /vehiculos
const listar = (req, res) => {
  const vehiculos = db.prepare('SELECT * FROM vehiculos').all();
  res.json(vehiculos);
};

// GET /vehiculos/:patente
const buscarPorPatente = (req, res) => {
  const vehiculo = db.prepare('SELECT * FROM vehiculos WHERE patente = ?').get(req.params.patente);

  if (!vehiculo) {
    return res.status(404).json({ error: 'Vehículo no encontrado' });
  }

  res.json(vehiculo);
};

// POST /vehiculos
const crear = (req, res) => {
  const { patente, vin, marca, modelo, anio, kilometraje, dueno_id } = req.body;

  if (!patente || !marca || !modelo || !anio || !dueno_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO vehiculos (patente, vin, marca, modelo, anio, kilometraje, dueno_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const resultado = stmt.run(patente, vin || null, marca, modelo, anio, kilometraje || 0, dueno_id);
    res.status(201).json({ mensaje: 'Vehículo creado', id: resultado.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: 'La patente ya existe' });
  }
};

// PUT /vehiculos/:patente/kilometraje
const actualizarKilometraje = (req, res) => {
  const { kilometraje } = req.body;

  const stmt = db.prepare('UPDATE vehiculos SET kilometraje = ? WHERE patente = ?');
  const resultado = stmt.run(kilometraje, req.params.patente);

  if (resultado.changes === 0) {
    return res.status(404).json({ error: 'Vehículo no encontrado' });
  }

  res.json({ mensaje: 'Kilometraje actualizado' });
};

module.exports = { listar, buscarPorPatente, crear, actualizarKilometraje };
