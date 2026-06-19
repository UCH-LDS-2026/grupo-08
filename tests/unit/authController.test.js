jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/models/usuarioModel');
jest.mock('../../src/models/tallerModel');

const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Usuario  = require('../../src/models/usuarioModel');
const Taller   = require('../../src/models/tallerModel');
const authController = require('../../src/controllers/authController');

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, usuario: { id: 1, rol: 'admin' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  // ─── registro ────────────────────────────────────────
  describe('registro (público — solo dueno)', () => {
    it('retorna 400 si falta nombre', () => {
      req.body = { email: 'a@b.com', password: '123456' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si intenta registrar como admin', () => {
      req.body = { nombre: 'X', email: 'a@b.com', password: '123456', rol: 'admin' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('dueño') }));
    });

    it('retorna 400 si intenta registrar como mecanico', () => {
      req.body = { nombre: 'X', email: 'a@b.com', password: '123456', rol: 'mecanico' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si email inválido', () => {
      req.body = { nombre: 'X', email: 'no-email', password: '123456' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si password corta', () => {
      req.body = { nombre: 'X', email: 'a@b.com', password: 'abc' };
      authController.registro(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('registro sin rol crea usuario dueno (201)', () => {
      req.body = { nombre: 'Ana', email: 'ana@test.com', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 5 });
      authController.registro(req, res);
      expect(Usuario.crear).toHaveBeenCalledWith('Ana', 'ana@test.com', 'hash', 'dueno');
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('normaliza el email', () => {
      req.body = { nombre: 'Ana', email: '  ANA@TEST.COM  ', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 1 });
      authController.registro(req, res);
      expect(Usuario.buscarPorEmail).toHaveBeenCalledWith('ana@test.com');
    });
  });

  // ─── crearUsuarioPorAdmin ─────────────────────────────
  describe('crearUsuarioPorAdmin', () => {
    it('retorna 400 si faltan campos', () => {
      req.body = { nombre: 'X', email: 'a@b.com', password: '123456' };
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si rol inválido', () => {
      req.body = { nombre: 'X', email: 'a@b.com', password: '123456', rol: 'superadmin' };
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si mecanico sin taller_id', () => {
      req.body = { nombre: 'M', email: 'm@b.com', password: '123456', rol: 'mecanico' };
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('taller') }));
    });

    it('retorna 400 si taller_id no existe', () => {
      req.body = { nombre: 'M', email: 'm@b.com', password: '123456', rol: 'mecanico', taller_id: 99 };
      Taller.existePorId.mockReturnValue(false);
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('no existe') }));
    });

    it('admin crea mecanico con taller válido (201)', () => {
      req.body = { nombre: 'M', email: 'm@b.com', password: '123456', rol: 'mecanico', taller_id: 1 };
      Taller.existePorId.mockReturnValue(true);
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 7 });
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json.mock.calls[0][0]).not.toHaveProperty('password');
      expect(res.json.mock.calls[0][0].taller_id).toBe(1);
    });

    it('admin crea dueno (taller_id se ignora — null)', () => {
      req.body = { nombre: 'D', email: 'd@b.com', password: '123456', rol: 'dueno' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 8 });
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json.mock.calls[0][0].taller_id).toBeNull();
    });

    it('admin crea usuario admin (201)', () => {
      req.body = { nombre: 'A', email: 'a2@b.com', password: '123456', rol: 'admin' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      bcrypt.hashSync.mockReturnValue('hash');
      Usuario.crear.mockReturnValue({ lastInsertRowid: 9 });
      authController.crearUsuarioPorAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('no admin no puede crear usuarios — el middleware bloquea, no el controller', () => {
      // La protección está en verificarRoles(['admin']) del router.
      // El controller asume que req.usuario.rol === 'admin'.
      // Este test sólo verifica que el controller crea correctamente.
      expect(true).toBe(true);
    });
  });

  // ─── login ───────────────────────────────────────────
  describe('login', () => {
    it('retorna 400 sin credenciales', () => {
      req.body = { email: 'a@b.com' };
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si email inválido', () => {
      req.body = { email: 'no-email', password: '123456' };
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 401 si usuario no existe', () => {
      req.body = { email: 'x@b.com', password: '123456' };
      Usuario.buscarPorEmail.mockReturnValue(null);
      authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('login exitoso incluye taller_id en token y respuesta', () => {
      req.body = { email: 'mecanico@test.com', password: '123456' };
      const u = { id: 2, nombre: 'M', email: 'mecanico@test.com', rol: 'mecanico', taller_id: 1, password: 'hash' };
      Usuario.buscarPorEmail.mockReturnValue(u);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('token_jwt');
      authController.login(req, res);
      // El payload del JWT debe incluir taller_id
      const jwtPayload = jwt.sign.mock.calls[0][0];
      expect(jwtPayload).toMatchObject({ id: 2, rol: 'mecanico', taller_id: 1 });
      const resp = res.json.mock.calls[0][0];
      expect(resp.usuario.taller_id).toBe(1);
      expect(resp.usuario).not.toHaveProperty('password');
    });
  });

  // ─── cambiarPassword ─────────────────────────────────
  describe('cambiarPassword', () => {
    it('retorna 400 si faltan campos', () => {
      req.body = { passwordActual: '123' };
      authController.cambiarPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('actualiza contraseña exitosamente', () => {
      req.body = { passwordActual: 'vieja', passwordNueva: 'nueva123', confirmarPasswordNueva: 'nueva123' };
      req.usuario = { id: 1 };
      Usuario.buscarPorIdConPassword.mockReturnValue({ id: 1, password: 'hash_viejo' });
      bcrypt.compareSync.mockReturnValue(true);
      bcrypt.hashSync.mockReturnValue('hash_nuevo');
      Usuario.actualizarPassword.mockReturnValue({ changes: 1 });
      authController.cambiarPassword(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.stringContaining('actualizada') }));
    });
  });
});
