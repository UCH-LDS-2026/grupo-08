jest.mock('../../src/models/historialModel');
jest.mock('../../src/models/vehiculoModel');
jest.mock('../../src/models/tallerModel');

const Historial = require('../../src/models/historialModel');
const Vehiculo  = require('../../src/models/vehiculoModel');
const Taller    = require('../../src/models/tallerModel');
const historialController = require('../../src/controllers/historialController');

describe('historialController', () => {
  let req, res;

  const vehiculoMock = {
    id: 1, patente: 'ABC123', marca: 'Ford', modelo: 'Focus',
    anio: 2019, kilometraje: 50000, dueno_id: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, usuario: { id: 2, rol: 'taller' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    // Por defecto el taller está certificado (se puede sobreescribir por test)
    Taller.esCertificado.mockReturnValue(true);
  });

  // ─────────────────────────────────────────────
  // agregar
  // ─────────────────────────────────────────────
  describe('agregar', () => {
    it('retorna 403 si el taller no está certificado', () => {
      Taller.esCertificado.mockReturnValue(false);
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('certificado') })
      );
    });

    it('admin puede cargar historial sin necesidad de ser taller certificado', () => {
      req.usuario = { id: 1, rol: 'admin' };
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', kilometraje_servicio: 5000, fecha_servicio: '2025-01-01' };
      Vehiculo.buscarPorId.mockReturnValue(vehiculoMock);
      Historial.crear.mockReturnValue({ lastInsertRowid: 1 });
      historialController.agregar(req, res);
      expect(Taller.esCertificado).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('retorna 400 si falta vehiculo_id', () => {
      req.body = { tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si vehiculo_id es 0 (no es un ID válido)', () => {
      req.body = { vehiculo_id: 0, tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si vehiculo_id es negativo', () => {
      req.body = { vehiculo_id: -1, tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si falta tipo_servicio', () => {
      req.body = { vehiculo_id: 1, kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si falta fecha_servicio', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', kilometraje_servicio: 50000 };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('acepta kilometraje_servicio = 0 (fix: no debe tratarse como campo faltante)', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', kilometraje_servicio: 0, fecha_servicio: '2025-01-01' };
      Vehiculo.buscarPorId.mockReturnValue(vehiculoMock);
      Historial.crear.mockReturnValue({ lastInsertRowid: 1 });
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('retorna 400 si el tipo_servicio no es válido', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'lavado', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('tipo_servicio') })
      );
    });

    it('retorna 400 si el kilometraje_servicio es negativo', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', kilometraje_servicio: -100, fecha_servicio: '2025-01-01' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si la fecha_servicio no es válida', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: 'no-es-fecha' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si la fecha_servicio es futura', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2099-12-31' };
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('futura') })
      );
    });

    it('retorna 404 si el vehículo no existe', () => {
      req.body = { vehiculo_id: 99, tipo_servicio: 'service', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      Vehiculo.buscarPorId.mockReturnValue(null);
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 201 con el id del registro en agregar exitoso', () => {
      req.body = { vehiculo_id: 1, tipo_servicio: 'reparacion', descripcion: 'Cambio de frenos', kilometraje_servicio: 50000, fecha_servicio: '2025-01-01' };
      Vehiculo.buscarPorId.mockReturnValue(vehiculoMock);
      Historial.crear.mockReturnValue({ lastInsertRowid: 8 });
      historialController.agregar(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 8 }));
    });

    it('usa req.usuario.id como taller_id', () => {
      req.usuario = { id: 5, rol: 'taller' };
      req.body = { vehiculo_id: 1, tipo_servicio: 'inspeccion', kilometraje_servicio: 60000, fecha_servicio: '2025-01-01' };
      Vehiculo.buscarPorId.mockReturnValue(vehiculoMock);
      Historial.crear.mockReturnValue({ lastInsertRowid: 1 });
      historialController.agregar(req, res);
      expect(Historial.crear).toHaveBeenCalledWith(
        1, 5, 'inspeccion', null, 60000, '2025-01-01'
      );
    });
  });

  // ─────────────────────────────────────────────
  // obtenerPorVehiculo (público — vehiculo saneado)
  // ─────────────────────────────────────────────
  describe('obtenerPorVehiculo', () => {
    it('retorna 404 si el vehículo no existe', () => {
      req.params = { vehiculo_id: 99 };
      Vehiculo.buscarPorId.mockReturnValue(null);
      historialController.obtenerPorVehiculo(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna vehículo saneado (sin dueno_id) e historial', () => {
      req.params = { vehiculo_id: 1 };
      const historial = [{ id: 1, tipo_servicio: 'service' }];
      Vehiculo.buscarPorId.mockReturnValue(vehiculoMock);
      Historial.buscarPorVehiculo.mockReturnValue(historial);
      historialController.obtenerPorVehiculo(req, res);
      const respuesta = res.json.mock.calls[0][0];
      expect(respuesta.vehiculo.patente).toBe('ABC123');
      expect(respuesta.vehiculo).not.toHaveProperty('dueno_id');
      expect(respuesta.historial).toEqual(historial);
    });

    it('retorna historial vacío si el vehículo no tiene servicios', () => {
      req.params = { vehiculo_id: 1 };
      Vehiculo.buscarPorId.mockReturnValue(vehiculoMock);
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorVehiculo(req, res);
      expect(res.json.mock.calls[0][0].historial).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // obtenerPorPatente (público — vehiculo saneado)
  // ─────────────────────────────────────────────
  describe('obtenerPorPatente', () => {
    it('retorna 404 si el vehículo no existe por patente', () => {
      req.params = { patente: 'NOEXISTE' };
      Vehiculo.buscarPorPatente.mockReturnValue(null);
      historialController.obtenerPorPatente(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('normaliza la patente del parámetro a mayúsculas', () => {
      req.params = { patente: '  abc123  ' };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoMock);
      Historial.buscarPorVehiculo.mockReturnValue([]);
      historialController.obtenerPorPatente(req, res);
      expect(Vehiculo.buscarPorPatente).toHaveBeenCalledWith('ABC123');
    });

    it('retorna vehículo saneado (sin dueno_id) e historial por patente', () => {
      const historial = [{ id: 2, tipo_servicio: 'inspeccion' }];
      req.params = { patente: 'ABC123' };
      Vehiculo.buscarPorPatente.mockReturnValue(vehiculoMock);
      Historial.buscarPorVehiculo.mockReturnValue(historial);
      historialController.obtenerPorPatente(req, res);
      const respuesta = res.json.mock.calls[0][0];
      expect(respuesta.vehiculo).not.toHaveProperty('dueno_id');
      expect(respuesta.historial).toEqual(historial);
    });
  });
});
