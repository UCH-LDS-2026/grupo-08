jest.mock('../../src/models/tallerModel');

const Taller = require('../../src/models/tallerModel');
const tallerController = require('../../src/controllers/tallerController');

describe('tallerController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, usuario: { id: 1, rol: 'admin' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  // ─── crear ────────────────────────────────────────────
  describe('crear', () => {
    it('retorna 400 si falta nombre_taller', () => {
      req.body = { direccion: 'Calle 1' };
      tallerController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('nombre') }));
    });

    it('retorna 400 si falta direccion', () => {
      req.body = { nombre_taller: 'Taller A' };
      tallerController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('dirección') }));
    });

    it('crea el taller y retorna 201', () => {
      req.body = { nombre_taller: 'Taller A', direccion: 'Av. 1', telefono: '2610', certificado: true };
      Taller.crear.mockReturnValue({ lastInsertRowid: 3 });
      tallerController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }));
    });

    it('crea con certificado=0 cuando se pasa false', () => {
      req.body = { nombre_taller: 'Taller B', direccion: 'Calle 2', certificado: false };
      Taller.crear.mockReturnValue({ lastInsertRowid: 4 });
      tallerController.crear(req, res);
      expect(Taller.crear).toHaveBeenCalledWith('Taller B', 'Calle 2', null, 0);
    });

    it('crea sin telefono (null)', () => {
      req.body = { nombre_taller: 'Taller C', direccion: 'Calle 3' };
      Taller.crear.mockReturnValue({ lastInsertRowid: 5 });
      tallerController.crear(req, res);
      const args = Taller.crear.mock.calls[0];
      expect(args[2]).toBeNull(); // telefono
    });
  });

  // ─── listar ───────────────────────────────────────────
  describe('listar', () => {
    it('retorna lista de talleres', () => {
      const talleres = [{ id: 1, nombre_taller: 'Taller A', cantidad_mecanicos: 2 }];
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

  // ─── obtenerPorId ─────────────────────────────────────
  describe('obtenerPorId', () => {
    it('retorna 404 si no existe', () => {
      req.params = { id: 99 };
      Taller.buscarPorId.mockReturnValue(null);
      tallerController.obtenerPorId(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna el taller', () => {
      req.params = { id: 1 };
      const taller = { id: 1, nombre_taller: 'Taller A', direccion: 'Calle 1' };
      Taller.buscarPorId.mockReturnValue(taller);
      tallerController.obtenerPorId(req, res);
      expect(res.json).toHaveBeenCalledWith({ taller });
    });
  });
});
