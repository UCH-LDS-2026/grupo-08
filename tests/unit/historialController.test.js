jest.mock('../../src/models/historialModel');
jest.mock('../../src/models/vehiculoModel');

const Historial = require('../../src/models/historialModel');
const Vehiculo = require('../../src/models/vehiculoModel');
const historialController = require('../../src/controllers/historialController');

describe('historialController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, usuario: { id: 2, rol: 'taller' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // ─────────────────────────────────────────────
  // agregar
  // ─────────────────────────────────────────────
  describe('agregar', () => {
    it('retorna 400 si falta vehiculo_id', () => {
      req.body = { tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2026-06-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('obligatorios') })
      );
    });

    it('retorna 400 si falta tipo_servicio', () => {
      req.body = { vehiculo_id: 1, kilometraje_servicio: 50000, fecha_servicio: '2026-06-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si falta kilometraje_servicio', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', fecha_servicio: '2026-06-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si falta fecha_servicio', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', kilometraje_servicio: 50000 };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 si el vehículo no existe', () => {
      req.body = { vehiculo_id: 99, tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2026-06-01' };
      Vehiculo.buscarPorId.mockReturnValue(null);
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Vehículo no encontrado' });
    });

    it('retorna 201 con el id del registro creado', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', descripcion: 'Aceite y filtros', kilometraje_servicio: 50000, fecha_servicio: '2026-06-01' };
      Vehiculo.buscarPorId.mockReturnValue({ id: 1, patente: 'ABC123' });
      Historial.crear.mockReturnValue({ lastInsertRowid: 8 });
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 8 }));
    });

    it('usa req.usuario.id como taller_id', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'reparacion', kilometraje_servicio: 60000, fecha_servicio: '2026-06-10' };
      req.usuario = { id: 5, rol: 'taller' };
      Vehiculo.buscarPorId.mockReturnValue({ id: 1 });
      Historial.crear.mockReturnValue({ lastInsertRowid: 1 });
      historialController.agregar(req, res);
      expect(Historial.crear).toHaveBeenCalledWith(
        1, 5, 'reparacion', undefined, 60000, '2026-06-10'
      );
    });
  });

  // ─────────────────────────────────────────────
  // obtenerPorVehiculo
  // ─────────────────────────────────────────────
  describe('obtenerPorVehiculo', () => {
    it('retorna 404 si el vehículo no existe', () => {
      req.params = { vehiculo_id: 99 };
      Vehiculo.buscarPorId.mockReturnValue(null);
      historialController.obtenerPorVehiculo(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Vehículo no encontrado' });
    });

    it('retorna vehículo e historial del vehículo', () => {
      const vehiculo = { id: 1, patente: 'ABC123' };
      const historial = [
        { id: 1, tipo_servicio: 'service', nombre_taller: 'Taller Sur' },
        { id: 2, tipo_servicio: 'reparacion', nombre_taller: 'Taller Sur' }
      ];
      req.params = { vehiculo_id: 1 };
      Vehiculo.buscarPorId.mockReturnValue(vehiculo);
      Historial.buscarPorVehiculo.mockReturnValue(historial);
      historialController.obtenerPorVehiculo(req, res);
      expect(Historial.buscarPorVehiculo).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ vehiculo, historial });
    });

    it('retorna historial vacío si el vehículo existe pero no tiene servicios', () => {
      req.params = { vehiculo_id: 2 };
      Vehiculo.buscarPorId.mockReturnValue({ id: 2, patente: 'XYZ789' });
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorVehiculo(req, res);
      const respuesta = res.json.mock.calls[0][0];
      expect(respuesta.historial).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // obtenerPorPatente
  // ─────────────────────────────────────────────
  describe('obtenerPorPatente', () => {
    it('retorna 404 si no existe ningún vehículo con esa patente', () => {
      req.params = { patente: 'NOEXISTE' };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      historialController.obtenerPorPatente(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Vehículo no encontrado' });
    });

    it('normaliza la patente del parámetro a mayúsculas', () => {
      req.params = { patente: '  abc123  ' };
      Vehiculo.buscarPorPatente.mockReturnValue({ id: 1, patente: 'ABC123' });
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorPatente(req, res);
      expect(Vehiculo.buscarPorPatente).toHaveBeenCalledWith('ABC123');
    });

    it('retorna vehículo e historial por patente', () => {
      const vehiculo = { id: 3, patente: 'ABC123' };
      const historial = [{ id: 1, tipo_servicio: 'inspeccion' }];
      req.params = { patente: 'ABC123' };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculo);
      Historial.buscarPorVehiculo.mockReturnValue(historial);
      historialController.obtenerPorPatente(req, res);
      expect(Historial.buscarPorVehiculo).toHaveBeenCalledWith(3);
      expect(res.json).toHaveBeenCalledWith({ vehiculo, historial });
    });
  });
});
