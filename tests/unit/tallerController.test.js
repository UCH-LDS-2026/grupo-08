jest.mock('../../src/models/tallerModel');

const Taller = require('../../src/models/tallerModel');
const tallerController = require('../../src/controllers/tallerController');

describe('tallerController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, usuario: { id: 2, rol: 'taller' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  // ─────────────────────────────────────────────
  // crearPerfil
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

    it('crea el perfil sin campos opcionales (sin direccion ni telefono)', () => {
      req.body = { nombre_taller: 'Taller Norte' };
      Taller.buscarPorUsuarioId.mockReturnValue(null);
      Taller.crearPerfil.mockReturnValue({ lastInsertRowid: 4 });
      tallerController.crearPerfil(req, res);
      expect(Taller.crearPerfil).toHaveBeenCalledWith(2, 'Taller Norte', null, null);
      expect(res.status).toHaveBeenCalledWith(201);
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
