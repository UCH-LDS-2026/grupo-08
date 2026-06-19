jest.mock('../../src/models/historialModel');
jest.mock('../../src/models/vehiculoModel');

const Historial = require('../../src/models/historialModel');
const Vehiculo  = require('../../src/models/vehiculoModel');
const historialController = require('../../src/controllers/historialController');

describe('historialController', () => {
  let req, res;

  const vehiculoPropio = {
    id: 1, patente: 'ABC123', marca: 'Ford', modelo: 'Focus',
    anio: 2019, kilometraje: 50000, dueno_id: 5
  };
  const vehiculoAjeno = {
    id: 2, patente: 'XYZ999', marca: 'Toyota', modelo: 'Corolla',
    anio: 2020, kilometraje: 30000, dueno_id: 99
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, usuario: { id: 2, rol: 'mecanico', taller_id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  // ─── agregar (usa PATENTE) ────────────────────────────
  describe('agregar', () => {
    it('retorna 403 si mecánico no tiene taller_id', () => {
      req.usuario = { id: 2, rol: 'mecanico', taller_id: null };
      req.body = { patente: 'ABC123', tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('admin puede registrar sin taller_id', () => {
      req.usuario = { id: 1, rol: 'admin', taller_id: null };
      req.body = { patente: 'ABC123', tipo_servicio: 'service', kilometraje_servicio: 5000, fecha_servicio: '2025-01-01' };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoPropio);
      Historial.crear.mockReturnValue({ lastInsertRowid: 1 });
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('retorna 400 si falta la patente', () => {
      req.body = { tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('patente') }));
    });

    it('retorna 400 si patente tiene formato inválido', () => {
      req.body = { patente: 'XXXXXXX', tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('acepta kilometraje_servicio = 0', () => {
      req.body = { patente: 'ABC123', tipo_servicio: 'service', kilometraje_servicio: 0, fecha_servicio: '2025-01-01' };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoPropio);
      Historial.crear.mockReturnValue({ lastInsertRowid: 1 });
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('retorna 400 si tipo_servicio inválido', () => {
      req.body = { patente: 'ABC123', tipo_servicio: 'lavado', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si fecha futura', () => {
      req.body = { patente: 'ABC123', tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2099-12-31' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 si el vehículo no existe por la patente', () => {
      req.body = { patente: 'ZZZ999', tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('registra historial exitosamente con mecanico_id y taller_id', () => {
      req.body = { patente: 'ABC123', tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoPropio);
      Historial.crear.mockReturnValue({ lastInsertRowid: 8 });
      historialController.agregar(req, res);
      expect(Historial.crear).toHaveBeenCalledWith(1, 2, 1, 'service', null, 50000, '2025-01-01');
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ─── obtenerPorVehiculo — con permisos ───────────────
  describe('obtenerPorVehiculo', () => {
    it('retorna 404 si el vehículo no existe', () => {
      req.params = { vehiculo_id: 99 };
      req.usuario = { id: 1, rol: 'admin' };
      Vehiculo.buscarPorId.mockReturnValue(null);
      historialController.obtenerPorVehiculo(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('admin ve cualquier historial', () => {
      req.params = { vehiculo_id: 2 };
      req.usuario = { id: 1, rol: 'admin' };
      Vehiculo.buscarPorId.mockReturnValue(vehiculoAjeno);
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorVehiculo(req, res);
      expect(res.json).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('mecanico ve cualquier historial', () => {
      req.params = { vehiculo_id: 2 };
      req.usuario = { id: 3, rol: 'mecanico', taller_id: 1 };
      Vehiculo.buscarPorId.mockReturnValue(vehiculoAjeno);
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorVehiculo(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('dueño propietario ve su propio historial', () => {
      req.params = { vehiculo_id: 1 };
      req.usuario = { id: 5, rol: 'dueno' }; // dueno_id = 5
      Vehiculo.buscarPorId.mockReturnValue(vehiculoPropio);
      Historial.buscarPorVehiculo.mockReturnValue([{ id: 1 }]);
      historialController.obtenerPorVehiculo(req, res);
      expect(res.json).toHaveBeenCalled();
      const resp = res.json.mock.calls[0][0];
      expect(resp.vehiculo).not.toHaveProperty('dueno_id');
    });

    it('dueño NO puede ver historial de vehículo ajeno → 403', () => {
      req.params = { vehiculo_id: 2 };
      req.usuario = { id: 5, rol: 'dueno' }; // dueno_id del vehículo es 99
      Vehiculo.buscarPorId.mockReturnValue(vehiculoAjeno);
      historialController.obtenerPorVehiculo(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('permiso') }));
    });
  });

  // ─── obtenerPorPatente — con permisos ────────────────
  describe('obtenerPorPatente', () => {
    it('retorna 404 si no existe el vehículo', () => {
      req.params = { patente: 'NOEXISTE' };
      req.usuario = { id: 1, rol: 'admin' };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      historialController.obtenerPorPatente(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('admin ve historial por patente', () => {
      req.params = { patente: 'XYZ999' };
      req.usuario = { id: 1, rol: 'admin' };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoAjeno);
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorPatente(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('mecanico ve historial por patente', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 2, rol: 'mecanico', taller_id: 1 };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoPropio);
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorPatente(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('dueño propietario ve historial de su vehículo', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 5, rol: 'dueno' }; // dueno_id = 5
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoPropio);
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorPatente(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('dueño NO puede ver historial de vehículo ajeno → 403', () => {
      req.params = { patente: 'XYZ999' };
      req.usuario = { id: 5, rol: 'dueno' }; // dueno_id del vehículo es 99
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoAjeno);
      historialController.obtenerPorPatente(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('normaliza la patente a mayúsculas', () => {
      req.params = { patente: 'abc123' };
      req.usuario = { id: 5, rol: 'dueno' };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoPropio);
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorPatente(req, res);
      expect(Vehiculo.buscarPorPatente).toHaveBeenCalledWith('ABC123');
    });

    it('vehículo saneado no incluye dueno_id', () => {
      req.params = { patente: 'ABC123' };
      req.usuario = { id: 5, rol: 'dueno' };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoPropio);
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorPatente(req, res);
      const resp = res.json.mock.calls[0][0];
      expect(resp.vehiculo).not.toHaveProperty('dueno_id');
    });
  });
});
