jest.mock('../../src/models/vehiculoModel');
jest.mock('../../src/models/tallerModel');

const Vehiculo  = require('../../src/models/vehiculoModel');
const Taller    = require('../../src/models/tallerModel');
const vehiculoController = require('../../src/controllers/vehiculoController');

describe('vehiculoController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, usuario: { id: 1, rol: 'dueno' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  // ─── crear ─────────────────────────────────────────
  describe('crear', () => {
    it('retorna 400 si falta la patente', () => {
      req.body = { marca: 'Toyota', modelo: 'Corolla', anio: 2020 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si la patente tiene formato inválido', () => {
      req.body = { patente: 'XXXXXXX', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si el año es menor a 1900', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 1800 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si el kilometraje es negativo', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 2020, kilometraje: -100 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si la patente ya existe', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      Vehiculo.buscarPorPatente.mockReturnValue({ id: 1 });
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 201 en creación exitosa', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      Vehiculo.crear.mockReturnValue({ lastInsertRowid: 5 });
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('acepta formato Mercosur AB123CD', () => {
      req.body = { patente: 'AB123CD', marca: 'Ford', modelo: 'Focus', anio: 2021 };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      Vehiculo.crear.mockReturnValue({ lastInsertRowid: 2 });
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('normaliza la patente a mayúsculas', () => {
      req.body = { patente: '  abc123  ', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      Vehiculo.crear.mockReturnValue({ lastInsertRowid: 1 });
      vehiculoController.crear(req, res);
      expect(Vehiculo.buscarPorPatente).toHaveBeenCalledWith('ABC123');
    });
  });

  // ─── misvehiculos ──────────────────────────────────
  describe('misvehiculos', () => {
    it('retorna la lista de vehículos del usuario', () => {
      Vehiculo.buscarPorDueno.mockReturnValue([{ id: 1 }, { id: 2 }]);
      vehiculoController.misvehiculos(req, res);
      expect(Vehiculo.buscarPorDueno).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ vehiculos: expect.any(Array) });
    });
  });

  // ─── buscarPorPatente con privacidad y restricción dueño ──
  describe('buscarPorPatente', () => {
    const vehiculoMock = {
      id: 1, patente: 'ABC123', vin: null, marca: 'Ford', modelo: 'Focus',
      anio: 2019, kilometraje: 50000, dueno_id: 99,
      dueno_nombre: 'Juan Pérez', dueno_email: 'juan@test.com'
    };

    it('retorna 404 si el vehículo no existe', () => {
      req.params = { patente: 'NOEXISTE' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(null);
      vehiculoController.buscarPorPatente(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('dueño propietario (id === dueno_id) ve todos los datos', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 99, rol: 'dueno' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      vehiculoController.buscarPorPatente(req, res);
      const { vehiculo } = res.json.mock.calls[0][0];
      expect(vehiculo.dueno_nombre).toBe('Juan Pérez');
      expect(vehiculo.dueno_email).toBe('juan@test.com');
      expect(vehiculo.dueno_id).toBe(99);
    });

    it('dueño ajeno (id !== dueno_id) recibe 403', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 55, rol: 'dueno' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      vehiculoController.buscarPorPatente(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('permiso') }));
    });

    it('admin ve todos los datos', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 1, rol: 'admin' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      vehiculoController.buscarPorPatente(req, res);
      const { vehiculo } = res.json.mock.calls[0][0];
      expect(vehiculo.dueno_nombre).toBe('Juan Pérez');
      expect(vehiculo.dueno_email).toBe('juan@test.com');
    });

    it('mecánico ve nombre pero no email', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 2, rol: 'mecanico', taller_id: 1 };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      vehiculoController.buscarPorPatente(req, res);
      const { vehiculo } = res.json.mock.calls[0][0];
      expect(vehiculo.dueno_nombre).toBe('Juan Pérez');
      expect(vehiculo.dueno_email).toBeNull();
    });
  });
});
