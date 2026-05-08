const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

const authController = {

    // REGISTRO
    registro: (req, res) => {
        const { nombre, email, password, rol } = req.body;

        // Validar que llegaron todos los datos
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }

        // Verificar que el email no exista ya
        const usuarioExiste = Usuario.buscarPorEmail(email);
        if (usuarioExiste) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        // Encriptar la contraseña
        const passwordHash = bcrypt.hashSync(password, 10);

        // Guardar en la base de datos
        const resultado = Usuario.crear(nombre, email, passwordHash, rol);

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente ✅',
            id: resultado.lastInsertRowid
        });
    },

    // LOGIN
    login: (req, res) => {
        const { email, password } = req.body;

        // Validar datos
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y password son obligatorios'
            });
        }

        // Buscar el usuario
        const usuario = Usuario.buscarPorEmail(email);
        if (!usuario) {
            return res.status(401).json({
                error: 'Email o password incorrectos'
            });
        }

        // Verificar la contraseña
        const passwordValida = bcrypt.compareSync(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({
                error: 'Email o password incorrectos'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: 'Login exitoso ✅',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    }
};

module.exports = authController;
