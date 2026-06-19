jest.mock('../../src/models/tallerModel');
jest.mock('../../src/models/usuarioModel');

const Taller  = require('../../src/models/tallerModel');
const Usuario = require('../../src/models/usuarioModel');
const tallerController = require('../../src/controllers/tallerController');

describe('tallerController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, usuario: { id: 2, rol: 'taller' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  // ─────────────────────────────────────────────
  // crearPerfil (por el propio taller)
  // ─────────────────────────────────────────────
  describe('crearPerfil', () => {
    it('retorna 400 si falta nombre_taller', () => {
      req.body = { direccion: 'Calle Falsa 123' };
      tallerController.crearPerfil(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('nombre del taller') })
      );
    });

    it('retorna 400 si nombre_taller es solo espacios', () => {
      req.body = { nombre_taller: '   ' };
      tallerController.crearPerfil(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si el usuario ya tiene un perfil de taller', () => {
      req.body = { nombre_taller: 'Taller Sur' };
      Taller.buscarPorUsuarioId.mockReturnValue({ id: 1, nombre_taller: 'Taller Sur' });
      tallerController.crearPerfil(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Ya existe') })
      );
    });

    it('crea el perfil de taller y retorna 201', () => {
      req.body = { nombre_taller: 'Taller Sur', direccion: 'Av. Siempre Viva 742' };
      Taller.buscarPorUsuarioId.mockReturnValue(null);
      Taller.crearPerfil.mockReturnValue({ lastInsertRowid: 3 });
      tallerController.crearPerfil(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 3, mensaje: expect.stringContaining('Pendiente') })
      );
    });

    it('siempre crea el perfil con certificado=0 (sin 5.º arg)', () => {
      req.body = { nombre_taller: 'Taller Norte' };
      Taller.buscarPorUsuarioId.mockReturnValue(null);
      Taller.crearPerfil.mockReturnValue({ lastInsertRowid: 4 });
      tallerController.crearPerfil(req, res);
      // El controller llama con 4 argumentos; certificado toma el default 0 del modelo
      expect(Taller.crearPerfil).toHaveBeenCalledWith(2, 'Taller Norte', null, null);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ─────────────────────────────────────────────
  // crearPerfilDesdeAdmin (endpoint POST /talleres/admin/perfil)
  // ─────────────────────────────────────────────
  describe('crearPerfilDesdeAdmin', () => {
    beforeEach(() => {
      req.usuario = { id: 1, rol: 'admin' };
    });

    it('retorna 400 si falta usuario_id', () => {
      req.body = { nombre_taller: 'Taller SRL' };
      tallerController.crearPerfilDesdeAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si falta nombre_taller', () => {
      req.body = { usuario_id: 5 };
      tallerController.crearPerfilDesdeAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 si el usuario no existe', () => {
      req.body = { usuario_id: 99, nombre_taller: 'Taller SRL' };
      Usuario.buscarPorId.mockReturnValue(null);
      tallerController.crearPerfilDesdeAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });

    it('retorna 400 si el usuario no tiene rol taller', () => {
      req.body = { usuario_id: 3, nombre_taller: 'Taller SRL' };
      Usuario.buscarPorId.mockReturnValue({ id: 3, rol: 'dueno' });
      tallerController.crearPerfilDesdeAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('rol taller') })
      );
    });

    it('retorna 400 si el usuario ya tiene perfil de taller', () => {
      req.body = { usuario_id: 5, nombre_taller: 'Taller SRL' };
      Usuario.buscarPorId.mockReturnValue({ id: 5, rol: 'taller' });
      Taller.buscarPorUsuarioId.mockReturnValue({ id: 1 });
      tallerController.crearPerfilDesdeAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('ya tiene un perfil') })
      );
    });

    it('crea perfil sin certificar (certificado=false) y retorna 201', () => {
      req.body = { usuario_id: 5, nombre_taller: 'Taller SRL', certificado: false };
      Usuario.buscarPorId.mockReturnValue({ id: 5, rol: 'taller' });
      Taller.buscarPorUsuarioId.mockReturnValue(null);
      Taller.crearPerfil.mockReturnValue({ lastInsertRowid: 7 });
      tallerController.crearPerfilDesdeAdmin(req, res);
      expect(Taller.crearPerfil).toHaveBeenCalledWith(5, 'Taller SRL', null, null, 0);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, certificado: false, mensaje: expect.stringContaining('Pendiente') })
      );
    });

    it('crea perfil certificado (certificado=true) y retorna 201', () => {
      req.body = {
        usuario_id: 5, nombre_taller: 'Taller SRL',
        direccion: 'Calle 123', telefono: '261000', certificado: true
      };
      Usuario.buscarPorId.mockReturnValue({ id: 5, rol: 'taller' });
      Taller.buscarPorUsuarioId.mockReturnValue(null);
      Taller.crearPerfil.mockReturnValue({ lastInsertRowid: 8 });
      tallerController.crearPerfilDesdeAdmin(req, res);
      expect(Taller.crearPerfil).toHaveBeenCalledWith(5, 'Taller SRL', 'Calle 123', '261000', 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 8, certificado: true })
      );
    });
  });

  // ─────────────────────────────────────────────
  // listar
  // ─────────────────────────────────────────────
  describe('listar', () => {
    it('retorna la lista de todos los talleres', () => {
      const talleres = [{ id: 1, nombre_taller: 'Taller A', certificado: 1 }];
      Taller.listar.mockReturnValue(talleres);
      tallerController.listar(req, res);
      expect(res.json).toHaveBeenCalledWith({ talleres });
    });

    it('retorna lista vacía si no hay talleres', () => {
      Taller.listar.mockReturnValue([]);
      tallerController.listar(req, res);
      expect(res.json).toHaveBeenCalledWith({ talleres: [] });
    });
  });

  // ─────────────────────────────────────────────
  // listarPendientes
  // ─────────────────────────────────────────────
  describe('listarPendientes', () => {
    it('retorna solo talleres con certificado = 0', () => {
      const pendientes = [{ id: 2, nombre_taller: 'Taller B', certificado: 0 }];
      Taller.listarPendientes.mockReturnValue(pendientes);
      tallerController.listarPendientes(req, res);
      expect(res.json).toHaveBeenCalledWith({ talleres: pendientes });
    });
  });

  // ─────────────────────────────────────────────
  // aprobar
  // ─────────────────────────────────────────────
  describe('aprobar', () => {
    it('retorna 404 si no existe perfil de taller para ese usuario', () => {
      req.params = { usuario_id: 99 };
      Taller.buscarPorUsuarioId.mockReturnValue(null);
      tallerController.aprobar(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('perfil') })
      );
    });

    it('aprueba el taller y retorna mensaje de éxito', () => {
      req.params = { usuario_id: 2 };
      Taller.buscarPorUsuarioId.mockReturnValue({ id: 1, usuario_id: 2, certificado: 0 });
      Taller.aprobar.mockReturnValue({ changes: 1 });
      tallerController.aprobar(req, res);
      expect(Taller.aprobar).toHaveBeenCalledWith(2);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ mensaje: expect.stringContaining('certificado') })
      );
    });
  });
});
