const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATENTE_VIEJA     = /^[A-Z]{3}\d{3}$/;        // ABC123
const PATENTE_MERCOSUR  = /^[A-Z]{2}\d{3}[A-Z]{2}$/; // AB123CD
const TIPOS_SERVICIO = ['service', 'reparacion', 'inspeccion', 'siniestro'];
const ANIO_MIN = 1900;

function normalizarEmail(email) {
    return String(email ?? '').trim().toLowerCase();
}

function esEmailValido(email) {
    return EMAIL_REGEX.test(String(email ?? ''));
}

function validarPassword(password, minLen = 6) {
    return typeof password === 'string' && password.length >= minLen;
}

function normalizarPatente(patente) {
    return String(patente ?? '').trim().toUpperCase();
}

function esPatenteValida(patente) {
    return PATENTE_VIEJA.test(patente) || PATENTE_MERCOSUR.test(patente);
}

function esEnteroNoNegativo(valor) {
    const n = Number(valor);
    return Number.isInteger(n) && n >= 0;
}

function esEnteroPositivo(valor) {
    const n = Number(valor);
    return Number.isInteger(n) && n > 0;
}

function esAnioVehiculoValido(anio) {
    const n = Number(anio);
    const tope = new Date().getFullYear() + 1;
    return Number.isInteger(n) && n >= ANIO_MIN && n <= tope;
}

function esFechaValida(fecha) {
    if (!fecha) return false;
    const d = new Date(fecha);
    return !isNaN(d.getTime());
}

function esFechaNoFutura(fecha) {
    if (!esFechaValida(fecha)) return false;
    // Comparación a nivel de día para tolerar zonas horarias
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    return new Date(fecha) <= hoy;
}

function esTipoServicioValido(tipo) {
    return TIPOS_SERVICIO.includes(tipo);
}

function limpiarTexto(texto, maxLength = 1000) {
    if (texto == null) return null;
    const t = String(texto).trim();
    return t.length > 0 ? t.slice(0, maxLength) : null;
}

module.exports = {
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
    TIPOS_SERVICIO,
};
