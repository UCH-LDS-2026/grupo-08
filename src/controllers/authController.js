/* ==========================================================
   ARCHIVO: src/controllers/authController.js
   ROL: Maneja registro, login y cambio de contraseña de usuarios.
   ENDPOINTS:
     POST /api/auth/registro         → authController.registro
     POST /api/auth/login            → authController.login
     PUT  /api/auth/cambiar-password → authController.cambiarPassword
   DEPENDENCIAS:
     - models/usuarioModel.js (DB)
     - bcryptjs (hashing de contraseñas)
     - jsonwebtoken (generación de tokens JWT)
   ========================================================== */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');

const authController = {

    // ----------------------------------------------------------
    // REGISTRO: POST /api/auth/registro
    // Crea un usuario nuevo en la base de datos.
    // ----------------------------------------------------------
    registro: (req, res) => {
        const { nombre, email, password, rol } = req.body;

        // [VALIDACIÓN] Todos los campos son obligatorios
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // [NORMALIZACIÓN] El email se guarda en minúsculas para evitar
        // duplicados por diferencias de capitalización (juan@gmail vs Juan@Gmail)
        const emailNormalizado = email.trim().toLowerCase();

        // [VALIDACIÓN] Verificar que el email no esté registrado ya
        const usuarioExiste = Usuario.buscarPorEmail(emailNormalizado);
        if (usuarioExiste) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // [VALIDACIÓN] Solo se aceptan estos tres roles
        const rolesValidos = ['dueno', 'taller', 'admin'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({
                error: `Rol inválido. Los roles válidos son: ${rolesValidos.join(', ')}`
            });
        }

        // [SEGURIDAD] Hashear la contraseña antes de guardarla.
        // saltRounds=10 es el balance estándar entre seguridad y velocidad.
        const passwordHash = bcrypt.hashSync(password, 10);

        // [DB] Guardar el usuario. Try/catch para capturar
        // errores de UNIQUE constraint de la DB (segunda línea de defensa).
        try {
            const resultado = Usuario.crear(nombre, emailNormalizado, passwordHash, rol);
            res.status(201).json({
                mensaje: 'Usuario creado exitosamente',
                id: resultado.lastInsertRowid
            });
        } catch (err) {
            if (err.message && err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            res.status(500).json({ error: 'Error al crear el usuario' });
        }
    },

    // ----------------------------------------------------------
    // LOGIN: POST /api/auth/login
    // Verifica credenciales y devuelve un token JWT (válido 24h).
    // ----------------------------------------------------------
    login: (req, res) => {
        const { email, password } = req.body;

        // [VALIDACIÓN] Ambos campos son obligatorios
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son obligatorios' });
        }

        const emailNormalizado = email.trim().toLowerCase();

        // [DB] Buscar el usuario. El mensaje de error es genérico a propósito
        // para no revelar si el email existe o no (seguridad).
        const usuario = Usuario.buscarPorEmail(emailNormalizado);
        if (!usuario) {
            return res.status(401).json({ error: 'Email o password incorrectos' });
        }

        // [SEGURIDAD] Comparar la contraseña ingresada con el hash guardado
        const passwordValida = bcrypt.compareSync(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Email o password incorrectos' });
        }

        // [JWT] Generar token firmado con JWT_SECRET del .env
        // El payload incluye solo id y rol (lo mínimo necesario para los middlewares)
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    },

    // ----------------------------------------------------------
    // CAMBIAR PASSWORD: PUT /api/auth/cambiar-password
    // Requiere token JWT válido (verificarToken en la ruta).
    // ----------------------------------------------------------
    cambiarPassword: (req, res) => {
        const { passwordActual, passwordNueva, confirmarPasswordNueva } = req.body;

        // [VALIDACIÓN] Todos los campos son obligatorios
        if (!passwordActual || !passwordNueva || !confirmarPasswordNueva) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // [VALIDACIÓN] Confirmar que las contraseñas coinciden
        if (passwordNueva !== confirmarPasswordNueva) {
            return res.status(400).json({
                error: 'La nueva contraseña y la confirmación no coinciden'
            });
        }

        // [VALIDACIÓN] Longitud mínima
        if (passwordNueva.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // [DB] Obtener el usuario CON su password actual para poder verificarla
        const usuario = Usuario.buscarPorIdConPassword(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // [SEGURIDAD] Verificar que la contraseña actual sea correcta
        const passwordValida = bcrypt.compareSync(passwordActual, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
        }

        // [DB] Hashear y guardar la nueva contraseña
        const passwordHash = bcrypt.hashSync(passwordNueva, 10);
        Usuario.actualizarPassword(usuario.id, passwordHash);

        res.json({ mensaje: 'Contraseña actualizada correctamente' });
    }
};

module.exports = authController;
