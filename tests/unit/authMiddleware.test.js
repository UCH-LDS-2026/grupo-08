const jwt = require('jsonwebtoken');
const { verificarToken, verificarRoles } = require('../../src/middlewares/authMiddleware');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req  = { headers: {} };
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  // ─────────────────────────────────────────────
  // verificarToken
  // ─────────────────────────────────────────────
  describe('verificarToken', () => {
    it('retorna 401 si no hay header Authorization', () => {
      verificarToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado, token requerido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 si el header no empieza con "Bearer "', () => {
      req.headers['authorization'] = 'SoloToken';
      verificarToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 con esquema Basic (no Bearer)', () => {
      req.headers['authorization'] = 'Basic dXNlcjpwYXNz';
      verificarToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado, token requerido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 si el header es "Bearer" sin token', () => {
      req.headers['authorization'] = 'Bearer ';
      verificarToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 si el token es inválido o expirado', () => {
      req.headers['authorization'] = 'Bearer token_invalido';
      jwt.verify.mockImplementation(() => { throw new Error('jwt malformed'); });
      verificarToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('llama a next() y asigna req.usuario si el token es válido', () => {
      const payload = { id: 1, rol: 'dueno' };
      req.headers['authorization'] = 'Bearer token_valido';
      jwt.verify.mockReturnValue(payload);
      verificarToken(req, res, next);
      expect(req.usuario).toEqual(payload);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // verificarRoles
  // ─────────────────────────────────────────────
  describe('verificarRoles', () => {
    beforeEach(() => { req.usuario = { id: 1, rol: 'dueno' }; });

    it('llama a next() si el rol está en la lista permitida', () => {
      const middleware = verificarRoles(['dueno', 'admin']);
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('retorna 403 si el rol no está permitido', () => {
      req.usuario.rol = 'taller';
      const middleware = verificarRoles(['dueno', 'admin']);
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('dueno o admin') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 403 para un rol completamente desconocido', () => {
      req.usuario.rol = 'superusuario';
      const middleware = verificarRoles(['dueno', 'taller', 'admin']);
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
