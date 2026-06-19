const {
  normalizarEmail,
  esEmailValido,
  validarPassword,
  normalizarPatente,
  esPatenteValida,
  esEnteroNoNegativo,
  esEnteroPositivo,
  esAnioVehiculoValido,
  esFechaValida,
  esFechaNoFutura,
  esTipoServicioValido,
  limpiarTexto,
} = require('../../src/utils/validators');

describe('validators', () => {

  describe('normalizarEmail', () => {
    it('convierte a minúsculas y elimina espacios', () => {
      expect(normalizarEmail('  JUAN@TEST.COM  ')).toBe('juan@test.com');
    });
    it('devuelve cadena vacía para null o undefined', () => {
      expect(normalizarEmail(null)).toBe('');
      expect(normalizarEmail(undefined)).toBe('');
    });
  });

  describe('esEmailValido', () => {
    it('acepta email con formato correcto', () => {
      expect(esEmailValido('juan@test.com')).toBe(true);
      expect(esEmailValido('a@b.io')).toBe(true);
    });
    it('rechaza email sin @', () => {
      expect(esEmailValido('juantest.com')).toBe(false);
    });
    it('rechaza email sin dominio', () => {
      expect(esEmailValido('juan@')).toBe(false);
    });
    it('rechaza cadena vacía', () => {
      expect(esEmailValido('')).toBe(false);
    });
    it('rechaza null', () => {
      expect(esEmailValido(null)).toBe(false);
    });
  });

  describe('validarPassword', () => {
    it('acepta contraseña de exactamente 6 caracteres', () => {
      expect(validarPassword('abc123')).toBe(true);
    });
    it('acepta contraseña de más de 6 caracteres', () => {
      expect(validarPassword('contraseña_larga')).toBe(true);
    });
    it('rechaza contraseña de menos de 6 caracteres', () => {
      expect(validarPassword('abc')).toBe(false);
    });
    it('rechaza cadena vacía', () => {
      expect(validarPassword('')).toBe(false);
    });
  });

  describe('normalizarPatente', () => {
    it('convierte a mayúsculas y elimina espacios', () => {
      expect(normalizarPatente('  abc123  ')).toBe('ABC123');
    });
    it('devuelve cadena vacía para null', () => {
      expect(normalizarPatente(null)).toBe('');
    });
  });

  describe('esPatenteValida', () => {
    it('acepta formato viejo argentino ABC123', () => {
      expect(esPatenteValida('ABC123')).toBe(true);
    });
    it('acepta formato Mercosur AB123CD', () => {
      expect(esPatenteValida('AB123CD')).toBe(true);
    });
    it('rechaza formato incompleto', () => {
      expect(esPatenteValida('AB12')).toBe(false);
    });
    it('rechaza formato mixto inválido', () => {
      expect(esPatenteValida('123ABC')).toBe(false);
    });
    it('rechaza cadena vacía', () => {
      expect(esPatenteValida('')).toBe(false);
    });
  });

  describe('esEnteroNoNegativo', () => {
    it('acepta 0', () => { expect(esEnteroNoNegativo(0)).toBe(true); });
    it('acepta entero positivo', () => { expect(esEnteroNoNegativo(100)).toBe(true); });
    it('rechaza número negativo', () => { expect(esEnteroNoNegativo(-1)).toBe(false); });
    it('rechaza decimal', () => { expect(esEnteroNoNegativo(1.5)).toBe(false); });
    it('rechaza string no numérico', () => { expect(esEnteroNoNegativo('abc')).toBe(false); });
  });

  describe('esEnteroPositivo', () => {
    it('acepta entero positivo', () => { expect(esEnteroPositivo(1)).toBe(true); });
    it('rechaza 0', () => { expect(esEnteroPositivo(0)).toBe(false); });
    it('rechaza negativo', () => { expect(esEnteroPositivo(-5)).toBe(false); });
  });

  describe('esAnioVehiculoValido', () => {
    const anioActual = new Date().getFullYear();
    it('acepta 1900', () => { expect(esAnioVehiculoValido(1900)).toBe(true); });
    it('acepta año actual', () => { expect(esAnioVehiculoValido(anioActual)).toBe(true); });
    it('acepta año actual + 1', () => { expect(esAnioVehiculoValido(anioActual + 1)).toBe(true); });
    it('rechaza 1899', () => { expect(esAnioVehiculoValido(1899)).toBe(false); });
    it('rechaza año actual + 2', () => { expect(esAnioVehiculoValido(anioActual + 2)).toBe(false); });
    it('rechaza decimal', () => { expect(esAnioVehiculoValido(2020.5)).toBe(false); });
  });

  describe('esFechaValida', () => {
    it('acepta fecha válida ISO', () => { expect(esFechaValida('2024-06-01')).toBe(true); });
    it('rechaza texto arbitrario', () => { expect(esFechaValida('not-a-date')).toBe(false); });
    it('rechaza vacío', () => { expect(esFechaValida('')).toBe(false); });
    it('rechaza null', () => { expect(esFechaValida(null)).toBe(false); });
  });

  describe('esFechaNoFutura', () => {
    it('acepta fecha del pasado', () => {
      expect(esFechaNoFutura('2000-01-01')).toBe(true);
    });
    it('acepta la fecha de hoy', () => {
      const hoy = new Date().toISOString().split('T')[0];
      expect(esFechaNoFutura(hoy)).toBe(true);
    });
    it('rechaza fecha futura', () => {
      expect(esFechaNoFutura('2099-12-31')).toBe(false);
    });
    it('rechaza fecha inválida', () => {
      expect(esFechaNoFutura('invalida')).toBe(false);
    });
  });

  describe('esTipoServicioValido', () => {
    it('acepta service', () => { expect(esTipoServicioValido('service')).toBe(true); });
    it('acepta reparacion', () => { expect(esTipoServicioValido('reparacion')).toBe(true); });
    it('acepta inspeccion', () => { expect(esTipoServicioValido('inspeccion')).toBe(true); });
    it('acepta siniestro', () => { expect(esTipoServicioValido('siniestro')).toBe(true); });
    it('rechaza valor arbitrario', () => { expect(esTipoServicioValido('lavado')).toBe(false); });
    it('rechaza cadena vacía', () => { expect(esTipoServicioValido('')).toBe(false); });
  });

  describe('limpiarTexto', () => {
    it('elimina espacios al inicio y al final', () => {
      expect(limpiarTexto('  hola  ')).toBe('hola');
    });
    it('recorta al maxLength indicado', () => {
      expect(limpiarTexto('abcdef', 3)).toBe('abc');
    });
    it('devuelve null para null', () => {
      expect(limpiarTexto(null)).toBeNull();
    });
    it('devuelve null para cadena solo espacios', () => {
      expect(limpiarTexto('   ')).toBeNull();
    });
  });
});
