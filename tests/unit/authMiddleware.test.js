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

  describe('verificarToken', () => {
    it('retorna 401 sin header Authorization', () => {
      verificarToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 con esquema Basic (no Bearer)', () => {
      req.headers['authorization'] = 'Basic dXNlcjpwYXNz';
      verificarToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 con "Bearer " sin token', () => {
      req.headers['authorization'] = 'Bearer ';
      verificarToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 si el token es inválido', () => {
      req.headers['authorization'] = 'Bearer token_invalido';
      jwt.verify.mockImplementation(() => { throw new Error('jwt malformed'); });
      verificarToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('llama a next() y asigna req.usuario si el token es válido', () => {
      const payload = { id: 1, rol: 'mecanico', taller_id: 2 };
      req.headers['authorization'] = 'Bearer token_valido';
      jwt.verify.mockReturnValue(payload);
      verificarToken(req, res, next);
      expect(req.usuario).toEqual(payload);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('verificarRoles', () => {
    beforeEach(() => { req.usuario = { id: 1, rol: 'mecanico' }; });

    it('llama a next() si el rol está permitido', () => {
      const middleware = verificarRoles(['mecanico', 'admin']);
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('retorna 403 si el rol no está permitido', () => {
      req.usuario.rol = 'dueno';
      const middleware = verificarRoles(['mecanico', 'admin']);
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
