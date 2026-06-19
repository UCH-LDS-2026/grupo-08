jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/models/usuarioModel');

const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const Usuario      = require('../../src/models/usuarioModel');
const authController = require('../../src/controllers/authController');

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, usuario: { id: 1, rol: 'dueno' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  // ─────────────────────────────────────────────
  // registro (público — solo dueno)
  // ─────────────────────────────────────────────
  describe('registro', () => {
    it('retorna 400 si falta nombre', () => {
      req.body = { email: 'test@test.com', password: '123456' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Todos los campos son obligatorios' });
    });

    it('retorna 400 si falta email', () => {
      req.body = { nombre: 'Ana', password: '123456' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si falta password', () => {
      req.body = { nombre: 'Ana', email: 'ana@test.com' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si se intenta registrar con rol admin', () => {
      req.body = { nombre: 'Ana', email: 'ana@test.com', password: '123456', rol: 'admin' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('dueño de vehículo') })
      );
    });

    it('retorna 400 si se intenta registrar con rol taller', () => {
      req.body = { nombre: 'Ana', email: 'ana@test.com', password: '123456', rol: 'taller' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('dueño de vehículo') })
      );
    });

    it('retorna 400 si el email tiene formato inválido', () => {
      req.body = { nombre: 'Ana', email: 'no-es-email', password: '123456' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('email') })
      );
    });

    it('retorna 400 si la contraseña tiene menos de 6 caracteres', () => {
      req.body = { nombre: 'Ana', email: 'ana@test.com', password: 'abc' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('6 caracteres') })
      );
    });

    it('retorna 400 si el email ya está registrado', () => {
      req.body = { nombre: 'Ana', email: 'existe@test.com', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue({ id: 1 });
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El email ya está registrado' });
    });

    it('retorna 400 si crear() lanza error UNIQUE (race condition)', () => {
      req.body = { nombre: 'Ana', email: 'nuevo@test.com', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash');
      Usuario.crear.mockImplementation(() => { throw new Error('UNIQUE constraint failed'); });
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 500 si crear() lanza error genérico', () => {
      req.body = { nombre: 'Ana', email: 'nuevo@test.com', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash');
      Usuario.crear.mockImplementation(() => { throw new Error('disk full'); });
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('registro sin rol crea usuario con rol dueno (201)', () => {
      req.body = { nombre: 'Ana', email: 'ana@test.com', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash_pw');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 10 });
      authController.registro(req, res);
      expect(Usuario.crear).toHaveBeenCalledWith('Ana', 'ana@test.com', 'hash_pw', 'dueno');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 10 }));
    });

    it('registro con rol dueno explícito lo acepta (201)', () => {
      req.body = { nombre: 'Ana', email: 'ana@test.com', password: '123456', rol: 'dueno' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash_pw');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 11 });
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('normaliza el email antes de guardar', () => {
      req.body = { nombre: 'Ana', email: '  ANA@TEST.COM  ', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 1 });
      authController.registro(req, res);
      expect(Usuario.buscarPorEmail).toHaveBeenCalledWith('ana@test.com');
      expect(Usuario.crear).toHaveBeenCalledWith('Ana', 'ana@test.com', 'hash', 'dueno');
    });
  });

  // ─────────────────────────────────────────────
  // crearUsuarioPorAdmin
  // ─────────────────────────────────────────────
  describe('crearUsuarioPorAdmin', () => {
    it('retorna 400 si faltan campos obligatorios', () => {
      req.body = { nombre: 'Carlos', email: 'c@test.com', password: '123456' }; // sin rol
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si el email es inválido', () => {
      req.body = { nombre: 'Carlos', email: 'no-email', password: '123456', rol: 'taller' };
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si la contraseña es corta', () => {
      req.body = { nombre: 'Carlos', email: 'c@test.com', password: 'abc', rol: 'taller' };
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si el rol es inválido', () => {
      req.body = { nombre: 'Carlos', email: 'c@test.com', password: '123456', rol: 'superadmin' };
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Rol inválido') })
      );
    });

    it('retorna 400 si el email ya existe', () => {
      req.body = { nombre: 'Carlos', email: 'c@test.com', password: '123456', rol: 'taller' };
      Usuario.buscarPorEmail.mockReturnValue({ id: 1 });
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('admin puede crear un usuario con rol taller (201)', () => {
      req.body = { nombre: 'Taller Norte', email: 'taller@test.com', password: '123456', rol: 'taller' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash_pw');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 5 });
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5, rol: 'taller', email: 'taller@test.com' })
      );
    });

    it('admin puede crear un usuario con rol admin (201)', () => {
      req.body = { nombre: 'Admin2', email: 'admin2@test.com', password: '123456', rol: 'admin' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash_pw');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 6 });
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ rol: 'admin' }));
    });

    it('la respuesta no incluye el campo password', () => {
      req.body = { nombre: 'Carlos', email: 'c@test.com', password: '123456', rol: 'dueno' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 7 });
      authController.crearUsuarioPorAdmin(req, res);
      const respuesta = res.json.mock.calls[0][0];
      expect(respuesta).not.toHaveProperty('password');
    });
  });

  // ─────────────────────────────────────────────
  // login
  // ─────────────────────────────────────────────
  describe('login', () => {
    it('retorna 400 si faltan email o password', () => {
      req.body = { email: 'test@test.com' };
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 401 si el usuario no existe', () => {
      req.body = { email: 'noexiste@test.com', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 401 si la password no coincide', () => {
      req.body = { email: 'test@test.com', password: 'wrong' };
      Usuario.buscarPorEmail.mockReturnValue({ id: 1, password: 'hash', rol: 'dueno' });
      bcrypt.compareSync.mockReturnValue(false);
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna token y datos del usuario en login exitoso', () => {
      req.body = { email: 'test@test.com', password: 'pass123' };
      const usuarioMock = { id: 3, nombre: 'Juan', email: 'test@test.com', rol: 'dueno', password: 'hash' };
      Usuario.buscarPorEmail.mockReturnValue(usuarioMock);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('jwt_generado');
      authController.login(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'jwt_generado', usuario: expect.objectContaining({ id: 3, rol: 'dueno' }) })
      );
      expect(res.json.mock.calls[0][0].usuario).not.toHaveProperty('password');
    });

    it('retorna 400 si el email tiene formato inválido', () => {
      req.body = { email: 'no-es-un-email', password: '123456' };
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('email') })
      );
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
    it('retorna 400 si falta algún campo', () => {
      req.body = { passwordActual: '123456', passwordNueva: 'nueva123' };
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si las contraseñas nuevas no coinciden', () => {
      req.body = { passwordActual: '123456', passwordNueva: 'abc123', confirmarPasswordNueva: 'xyz789' };
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si la nueva contraseña tiene menos de 6 caracteres', () => {
      req.body = { passwordActual: '123456', passwordNueva: 'abc', confirmarPasswordNueva: 'abc' };
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 si el usuario no existe en la base', () => {
      req.body = { passwordActual: '123456', passwordNueva: 'nueva123', confirmarPasswordNueva: 'nueva123' };
      req.usuario = { id: 99 };
      Usuario.buscarPorIdConPassword.mockReturnValue(null);
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 400 si la password actual es incorrecta', () => {
      req.body = { passwordActual: 'wrong', passwordNueva: 'nueva123', confirmarPasswordNueva: 'nueva123' };
      req.usuario = { id: 1 };
      Usuario.buscarPorIdConPassword.mockReturnValue({ id: 1, password: 'hash_viejo' });
      bcrypt.compareSync.mockReturnValue(false);
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('actualiza la password y retorna mensaje de éxito', () => {
      req.body = { passwordActual: 'pass123', passwordNueva: 'nueva456', confirmarPasswordNueva: 'nueva456' };
      req.usuario = { id: 1 };
      Usuario.buscarPorIdConPassword.mockReturnValue({ id: 1, password: 'hash_viejo' });
      bcrypt.compareSync.mockReturnValue(true);
      bcrypt.hashSync.mockReturnValue('hash_nuevo');
      Usuario.actualizarPassword.mockReturnValue({ changes: 1 });
      authController.cambiarPassword(req, res);
      expect(Usuario.actualizarPassword).toHaveBeenCalledWith(1, 'hash_nuevo');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.stringContaining('actualizada') }));
    });
  });
});
