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

        // Normalizar email para evitar duplicados por mayúsculas o espacios
        const emailNormalizado = email.trim().toLowerCase();

        // Verificar que el email no exista ya
        const usuarioExiste = Usuario.buscarPorEmail(emailNormalizado);
        if (usuarioExiste) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        // Encriptar la contraseña
        const passwordHash = bcrypt.hashSync(password, 10);

        // Validar rol
        const rolesValidos = ['dueno', 'taller', 'admin'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({
                error: `Rol inválido. Los roles válidos son: ${rolesValidos.join(', ')}`
            });
        }

        // Guardar en la base de datos
        try {
            const resultado = Usuario.crear(nombre, emailNormalizado, passwordHash, rol);
            res.status(201).json({
                mensaje: 'Usuario creado exitosamente ✅',
                id: resultado.lastInsertRowid
            });
        } catch (err) {
            if (err.message && err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            res.status(500).json({ error: 'Error al crear el usuario' });
        }
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

        // Normalizar email para permitir login con mayúsculas o espacios
        const emailNormalizado = email.trim().toLowerCase();

        // Buscar el usuario
        const usuario = Usuario.buscarPorEmail(emailNormalizado);
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
    },

    // CAMBIAR CONTRASEÑA
    cambiarPassword: (req, res) => {
        const { passwordActual, passwordNueva, confirmarPasswordNueva } = req.body;

        // Validar que llegaron todos los campos
        if (!passwordActual || !passwordNueva || !confirmarPasswordNueva) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }

        // Validar que la nueva contraseña y la confirmación coincidan
        if (passwordNueva !== confirmarPasswordNueva) {
            return res.status(400).json({
                error: 'La nueva contraseña y la confirmación no coinciden'
            });
        }

        // Validar longitud mínima
        if (passwordNueva.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Obtener el usuario con su password actual
        const usuario = Usuario.buscarPorIdConPassword(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar la contraseña actual
        const passwordValida = bcrypt.compareSync(passwordActual, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({
                error: 'La contraseña actual es incorrecta'
            });
        }

        // Hashear la nueva contraseña y guardarla
        const passwordHash = bcrypt.hashSync(passwordNueva, 10);
        Usuario.actualizarPassword(usuario.id, passwordHash);

        res.json({ mensaje: 'Contraseña actualizada correctamente' });
    }
};

module.exports = authController;
