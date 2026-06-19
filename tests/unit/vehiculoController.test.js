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

  // ─────────────────────────────────────────────
  // crear
  // ─────────────────────────────────────────────
  describe('crear', () => {
    it('retorna 400 si falta la patente', () => {
      req.body = { marca: 'Toyota', modelo: 'Corolla', anio: 2020 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si falta el modelo', () => {
      req.body = { patente: 'ABC123', marca: 'Toyota', anio: 2020 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si la patente tiene formato inválido', () => {
      req.body = { patente: 'XXXXXXX', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('patente') })
      );
    });

    it('retorna 400 si el año es menor a 1900', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 1800 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('año') })
      );
    });

    it('retorna 400 si el año es demasiado futuro', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 2099 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si el kilometraje es negativo', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 2020, kilometraje: -100 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('kilometraje') })
      );
    });

    it('retorna 400 si la patente ya existe', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      Vehiculo.buscarPorPatente.mockReturnValue({ id: 1 });
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ya existe un vehículo con esa patente' });
    });

    it('retorna 201 con el id en creación exitosa', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      Vehiculo.crear.mockReturnValue({ lastInsertRowid: 5 });
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 5 }));
    });

    it('acepta patente Mercosur AB123CD', () => {
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

    it('usa 0 como kilometraje por defecto si no se proporciona', () => {
      req.body = { patente: 'ABC123', marca: 'Honda', modelo: 'Civic', anio: 2022 };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      Vehiculo.crear.mockReturnValue({ lastInsertRowid: 2 });
      vehiculoController.crear(req, res);
      const args = Vehiculo.crear.mock.calls[0];
      expect(args[5]).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  // misvehiculos
  // ─────────────────────────────────────────────
  describe('misvehiculos', () => {
    it('retorna los vehículos del usuario autenticado', () => {
      const lista = [{ id: 1 }, { id: 2 }];
      Vehiculo.buscarPorDueno.mockReturnValue(lista);
      vehiculoController.misvehiculos(req, res);
      expect(Vehiculo.buscarPorDueno).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ vehiculos: lista });
    });

    it('retorna lista vacía si no hay vehículos', () => {
      Vehiculo.buscarPorDueno.mockReturnValue([]);
      vehiculoController.misvehiculos(req, res);
      expect(res.json).toHaveBeenCalledWith({ vehiculos: [] });
    });
  });

  // ─────────────────────────────────────────────
  // buscarPorPatente — control de privacidad
  // ─────────────────────────────────────────────
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

    it('admin ve nombre y email del dueño', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 1, rol: 'admin' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      vehiculoController.buscarPorPatente(req, res);
      const { vehiculo } = res.json.mock.calls[0][0];
      expect(vehiculo.dueno_nombre).toBe('Juan Pérez');
      expect(vehiculo.dueno_email).toBe('juan@test.com');
    });

    it('dueño propietario ve sus propios datos', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 99, rol: 'dueno' }; // mismo id que dueno_id
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      vehiculoController.buscarPorPatente(req, res);
      const { vehiculo } = res.json.mock.calls[0][0];
      expect(vehiculo.dueno_nombre).toBe('Juan Pérez');
      expect(vehiculo.dueno_email).toBe('juan@test.com');
    });

    it('dueño ajeno no ve datos personales', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 55, rol: 'dueno' }; // diferente al dueno_id (99)
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      vehiculoController.buscarPorPatente(req, res);
      const { vehiculo } = res.json.mock.calls[0][0];
      expect(vehiculo.dueno_nombre).toBeNull();
      expect(vehiculo.dueno_email).toBeNull();
    });

    it('taller certificado ve nombre pero no email', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 2, rol: 'taller' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      Taller.esCertificado.mockReturnValue(true);
      vehiculoController.buscarPorPatente(req, res);
      const { vehiculo } = res.json.mock.calls[0][0];
      expect(vehiculo.dueno_nombre).toBe('Juan Pérez');
      expect(vehiculo.dueno_email).toBeNull();
    });

    it('taller no certificado no ve datos personales', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 2, rol: 'taller' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      Taller.esCertificado.mockReturnValue(false);
      vehiculoController.buscarPorPatente(req, res);
      const { vehiculo } = res.json.mock.calls[0][0];
      expect(vehiculo.dueno_nombre).toBeNull();
      expect(vehiculo.dueno_email).toBeNull();
    });

    it('normaliza la patente del parámetro a mayúsculas', () => {
      req.params = { patente: '  abc123  ' };
      req.usuario = { id: 1, rol: 'admin' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculoMock);
      vehiculoController.buscarPorPatente(req, res);
      expect(Vehiculo.buscarPorPatenteConDueno).toHaveBeenCalledWith('ABC123');
    });
  });
});
