jest.mock('../../src/models/vehiculoModel');

const Vehiculo = require('../../src/models/vehiculoModel');
const vehiculoController = require('../../src/controllers/vehiculoController');

describe('vehiculoController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, usuario: { id: 1, rol: 'dueno' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // ─────────────────────────────────────────────
  // crear
  // ─────────────────────────────────────────────
  describe('crear', () => {
    it('retorna 400 si falta la patente', () => {
      req.body = { marca: 'Toyota', modelo: 'Corolla', anio: 2020 };
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('obligatorios') })
      );
    });

    it('retorna 400 si falta marca, modelo o año', () => {
      req.body = { patente: 'ABC123', marca: 'Toyota', anio: 2020 }; // sin modelo
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si la patente ya existe', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      Vehiculo.buscarPorPatente.mockReturnValue({ id: 1, patente: 'ABC123' });
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ya existe un vehículo con esa patente' });
    });

    it('retorna 201 con el id del vehículo creado', () => {
      req.body = { patente: 'ABC123', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      Vehiculo.crear.mockReturnValue({ lastInsertRowid: 5 });
      vehiculoController.crear(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 5 }));
    });

    it('normaliza la patente a mayúsculas y sin espacios', () => {
      req.body = { patente: '  abc123  ', marca: 'Ford', modelo: 'Focus', anio: 2019 };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      Vehiculo.crear.mockReturnValue({ lastInsertRowid: 1 });
      vehiculoController.crear(req, res);
      expect(Vehiculo.buscarPorPatente).toHaveBeenCalledWith('ABC123');
      expect(Vehiculo.crear).toHaveBeenCalledWith('ABC123', undefined, 'Ford', 'Focus', 2019, 0, 1);
    });

    it('usa 0 como kilometraje por defecto si no se proporciona', () => {
      req.body = { patente: 'XYZ999', marca: 'Honda', modelo: 'Civic', anio: 2022 };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      Vehiculo.crear.mockReturnValue({ lastInsertRowid: 2 });
      vehiculoController.crear(req, res);
      const args = Vehiculo.crear.mock.calls[0];
      expect(args[5]).toBe(0); // kilómetros por defecto
    });
  });

  // ─────────────────────────────────────────────
  // misvehiculos
  // ─────────────────────────────────────────────
  describe('misvehiculos', () => {
    it('retorna la lista de vehículos del usuario autenticado', () => {
      const lista = [
        { id: 1, patente: 'ABC123' },
        { id: 2, patente: 'XYZ789' }
      ];
      Vehiculo.buscarPorDueno.mockReturnValue(lista);
      vehiculoController.misvehiculos(req, res);
      expect(Vehiculo.buscarPorDueno).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ vehiculos: lista });
    });

    it('retorna lista vacía si el usuario no tiene vehículos', () => {
      Vehiculo.buscarPorDueno.mockReturnValue([]);
      vehiculoController.misvehiculos(req, res);
      expect(res.json).toHaveBeenCalledWith({ vehiculos: [] });
    });
  });

  // ─────────────────────────────────────────────
  // buscarPorPatente
  // ─────────────────────────────────────────────
  describe('buscarPorPatente', () => {
    it('retorna 404 si el vehículo no existe', () => {
      req.params = { patente: 'NOEXISTE' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(null);
      vehiculoController.buscarPorPatente(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Vehículo no encontrado' });
    });

    it('retorna el vehículo con datos del dueño', () => {
      const vehiculo = { id: 1, patente: 'ABC123', dueno_nombre: 'Juan', dueno_email: 'j@test.com' };
      req.params = { patente: 'ABC123' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue(vehiculo);
      vehiculoController.buscarPorPatente(req, res);
      expect(res.json).toHaveBeenCalledWith({ vehiculo });
    });

    it('normaliza la patente del parámetro a mayúsculas', () => {
      req.params = { patente: '  abc123  ' };
      Vehiculo.buscarPorPatenteConDueno.mockReturnValue({ id: 1 });
      vehiculoController.buscarPorPatente(req, res);
      expect(Vehiculo.buscarPorPatenteConDueno).toHaveBeenCalledWith('ABC123');
    });
  });
});
