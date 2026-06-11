jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/models/usuarioModel');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../../src/models/usuarioModel');
const authController = require('../../src/controllers/authController');

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, usuario: { id: 1, rol: 'dueno' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // ─────────────────────────────────────────────
  // registro
  // ─────────────────────────────────────────────
  describe('registro', () => {
    it('retorna 400 si falta algún campo obligatorio', () => {
      req.body = { nombre: 'Test', email: 'test@test.com', password: '123456' }; // sin rol
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Todos los campos son obligatorios' });
    });

    it('retorna 400 si el email ya está registrado (buscarPorEmail)', () => {
      req.body = { nombre: 'Test', email: 'existe@test.com', password: '123456', rol: 'dueno' };
      Usuario.buscarPorEmail.mockReturnValue({ id: 1, email: 'existe@test.com' });
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El email ya está registrado' });
    });

    it('retorna 400 si el rol es inválido', () => {
      req.body = { nombre: 'Test', email: 'nuevo@test.com', password: '123456', rol: 'superadmin' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash_pw');
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Rol inválido') })
      );
    });

    it('retorna 400 si crear() lanza error UNIQUE (race condition)', () => {
      req.body = { nombre: 'Test', email: 'nuevo@test.com', password: '123456', rol: 'dueno' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash_pw');
      Usuario.crear.mockImplementation(() => { throw new Error('UNIQUE constraint failed'); });
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El email ya está registrado' });
    });

    it('retorna 500 si crear() lanza un error genérico', () => {
      req.body = { nombre: 'Test', email: 'nuevo@test.com', password: '123456', rol: 'dueno' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash_pw');
      Usuario.crear.mockImplementation(() => { throw new Error('disk full'); });
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al crear el usuario' });
    });

    it('retorna 201 con el id del nuevo usuario en registro exitoso', () => {
      req.body = { nombre: 'Ana', email: 'ana@test.com', password: 'pass123', rol: 'taller' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash_pw');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 7 });
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7 })
      );
    });

    it('normaliza el email a minúsculas y sin espacios antes de guardar', () => {
      req.body = { nombre: 'Ana', email: '  ANA@TEST.COM  ', password: 'pass123', rol: 'dueno' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash_pw');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 1 });
      authController.registro(req, res);
      expect(Usuario.buscarPorEmail).toHaveBeenCalledWith('ana@test.com');
      expect(Usuario.crear).toHaveBeenCalledWith('Ana', 'ana@test.com', 'hash_pw', 'dueno');
    });
  });

  // ─────────────────────────────────────────────
  // login
  // ─────────────────────────────────────────────
  describe('login', () => {
    it('retorna 400 si faltan email o password', () => {
      req.body = { email: 'test@test.com' }; // sin password
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email y password son obligatorios' });
    });

    it('retorna 401 si el usuario no existe', () => {
      req.body = { email: 'noexiste@test.com', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email o password incorrectos' });
    });

    it('retorna 401 si la password no coincide con el hash', () => {
      req.body = { email: 'test@test.com', password: 'wrongpass' };
      Usuario.buscarPorEmail.mockReturnValue({ id: 1, password: 'hash_real', rol: 'dueno' });
      bcrypt.compareSync.mockReturnValue(false);
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email o password incorrectos' });
    });

    it('retorna token y datos del usuario en login exitoso', () => {
      req.body = { email: 'test@test.com', password: 'pass123' };
      const usuarioMock = { id: 3, nombre: 'Juan', email: 'test@test.com', rol: 'dueno', password: 'hash' };
      Usuario.buscarPorEmail.mockReturnValue(usuarioMock);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('jwt_generado');
      authController.login(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'jwt_generado',
          usuario: expect.objectContaining({ id: 3, nombre: 'Juan', rol: 'dueno' })
        })
      );
      // El password no debe estar en la respuesta
      const llamada = res.json.mock.calls[0][0];
      expect(llamada.usuario).not.toHaveProperty('password');
    });

    it('normaliza el email al buscar el usuario', () => {
      req.body = { email: '  JUAN@TEST.COM  ', password: 'pass123' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      authController.login(req, res);
      expect(Usuario.buscarPorEmail).toHaveBeenCalledWith('juan@test.com');
    });
  });

  // ─────────────────────────────────────────────
  // cambiarPassword
  // ─────────────────────────────────────────────
  describe('cambiarPassword', () => {
    it('retorna 400 si falta algún campo obligatorio', () => {
      req.body = { passwordActual: '123456', passwordNueva: 'nueva123' }; // sin confirmar
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Todos los campos son obligatorios' });
    });

    it('retorna 400 si la nueva password y la confirmación no coinciden', () => {
      req.body = { passwordActual: '123456', passwordNueva: 'nueva123', confirmarPasswordNueva: 'otra456' };
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('no coinciden') })
      );
    });

    it('retorna 400 si la nueva password tiene menos de 6 caracteres', () => {
      req.body = { passwordActual: '123456', passwordNueva: 'abc', confirmarPasswordNueva: 'abc' };
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('6 caracteres') })
      );
    });

    it('retorna 404 si el usuario autenticado no existe en la base', () => {
      req.body = { passwordActual: '123456', passwordNueva: 'nueva123', confirmarPasswordNueva: 'nueva123' };
      req.usuario = { id: 99 };
      Usuario.buscarPorIdConPassword.mockReturnValue(null);
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });

    it('retorna 400 si la password actual es incorrecta', () => {
      req.body = { passwordActual: 'wrongpass', passwordNueva: 'nueva123', confirmarPasswordNueva: 'nueva123' };
      req.usuario = { id: 1 };
      Usuario.buscarPorIdConPassword.mockReturnValue({ id: 1, password: 'hash_viejo' });
      bcrypt.compareSync.mockReturnValue(false);
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('contraseña actual es incorrecta') })
      );
    });

    it('actualiza la password y retorna mensaje de éxito', () => {
      req.body = { passwordActual: 'pass123', passwordNueva: 'nueva456', confirmarPasswordNueva: 'nueva456' };
      req.usuario = { id: 1 };
      Usuario.buscarPorIdConPassword.mockReturnValue({ id: 1, password: 'hash_viejo' });
      bcrypt.compareSync.mockReturnValue(true);
      bcrypt.hashSync.mockReturnValue('hash_nuevo');
      Usuario.actualizarPassword.mockReturnValue({ changes: 1 });
      authController.cambiarPassword(req, res);
      expect(bcrypt.hashSync).toHaveBeenCalledWith('nueva456', 10);
      expect(Usuario.actualizarPassword).toHaveBeenCalledWith(1, 'hash_nuevo');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ mensaje: expect.stringContaining('actualizada') })
      );
    });
  });
});
