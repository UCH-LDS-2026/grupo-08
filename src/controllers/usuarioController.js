const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /usuarios/registro
const registrar = (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const stmt = db.prepare('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)');
    const resultado = stmt.run(nombre, email, passwordHash, rol);
    res.status(201).json({ mensaje: 'Usuario creado', id: resultado.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: 'El email ya existe' });
  }
};

// POST /usuarios/login
const login = (req, res) => {
  const { email, password } = req.body;

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

  if (!usuario || !bcrypt.compareSync(password, usuario.password)) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET || 'secreto123',
    { expiresIn: '24h' }
  );

  res.json({ mensaje: 'Login exitoso', token, rol: usuario.rol });
};

// GET /usuarios
const listar = (req, res) => {
  const usuarios = db.prepare('SELECT id, nombre, email, rol, creado_en FROM usuarios').all();
  res.json(usuarios);
};

module.exports = { registrar, login, listar };
