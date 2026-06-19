const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');
const Taller  = require('../models/tallerModel');
const { normalizarEmail, esEmailValido, validarPassword } = require('../utils/validators');

const authController = {

    // REGISTRO PÚBLICO — solo crea rol dueno
    registro: (req, res) => {
        const { nombre, email, password } = req.body;
        const rolSolicitado = req.body.rol;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        if (rolSolicitado && rolSolicitado !== 'dueno') {
            return res.status(400).json({
                error: 'El registro público solo permite cuentas de dueño de vehículo'
            });
        }

        const emailNormalizado = normalizarEmail(email);

        if (!esEmailValido(emailNormalizado)) {
            return res.status(400).json({ error: 'El formato del email no es válido' });
        }

        if (!validarPassword(password)) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const usuarioExiste = Usuario.buscarPorEmail(emailNormalizado);
        if (usuarioExiste) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        try {
            const resultado = Usuario.crear(nombre.trim(), emailNormalizado, passwordHash, 'dueno');
            res.status(201).json({ mensaje: 'Usuario creado exitosamente', id: resultado.lastInsertRowid });
        } catch (err) {
            if (err.message && err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            res.status(500).json({ error: 'Error al crear el usuario' });
        }
    },

    // CREACIÓN INTERNA POR ADMIN
    // Roles disponibles: dueno, mecanico, admin
    // El rol mecanico requiere taller_id obligatorio
    crearUsuarioPorAdmin: (req, res) => {
        const { nombre, email, password, rol, taller_id } = req.body;

        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const emailNormalizado = normalizarEmail(email);

        if (!esEmailValido(emailNormalizado)) {
            return res.status(400).json({ error: 'El formato del email no es válido' });
        }

        if (!validarPassword(password)) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const rolesValidos = ['dueno', 'mecanico', 'admin'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({
                error: `Rol inválido. Los roles válidos son: ${rolesValidos.join(', ')}`
            });
        }

        // Mecánico debe tener taller asociado
        if (rol === 'mecanico') {
            if (!taller_id) {
                return res.status(400).json({
                    error: 'Para crear un usuario mecánico, debe asociarlo a un taller.'
                });
            }
            if (!Taller.existePorId(taller_id)) {
                return res.status(400).json({ error: 'El taller indicado no existe.' });
            }
        }

        const existe = Usuario.buscarPorEmail(emailNormalizado);
        if (existe) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        const tallerIdFinal = rol === 'mecanico' ? taller_id : null;

        try {
            const resultado = Usuario.crear(nombre.trim(), emailNormalizado, passwordHash, rol, tallerIdFinal);
            res.status(201).json({
                mensaje: 'Usuario creado exitosamente',
                id: resultado.lastInsertRowid,
                nombre: nombre.trim(),
                email: emailNormalizado,
                rol,
                taller_id: tallerIdFinal
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

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son obligatorios' });
        }

        const emailNormalizado = normalizarEmail(email);

        if (!esEmailValido(emailNormalizado)) {
            return res.status(400).json({ error: 'El formato del email no es válido' });
        }

        const usuario = Usuario.buscarPorEmail(emailNormalizado);
        if (!usuario) {
            return res.status(401).json({ error: 'Email o password incorrectos' });
        }

        const passwordValida = bcrypt.compareSync(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Email o password incorrectos' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, taller_id: usuario.taller_id || null },
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
                rol: usuario.rol,
                taller_id: usuario.taller_id || null
            }
        });
    },

    // CAMBIAR CONTRASEÑA
    cambiarPassword: (req, res) => {
        const { passwordActual, passwordNueva, confirmarPasswordNueva } = req.body;

        if (!passwordActual || !passwordNueva || !confirmarPasswordNueva) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        if (passwordNueva !== confirmarPasswordNueva) {
            return res.status(400).json({
                error: 'La nueva contraseña y la confirmación no coinciden'
            });
        }

        if (passwordNueva.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const usuario = Usuario.buscarPorIdConPassword(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const passwordValida = bcrypt.compareSync(passwordActual, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
        }

        const passwordHash = bcrypt.hashSync(passwordNueva, 10);
        Usuario.actualizarPassword(usuario.id, passwordHash);

        res.json({ mensaje: 'Contraseña actualizada correctamente' });
    }
};

module.exports = authController;
