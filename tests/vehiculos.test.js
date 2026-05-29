/* ==========================================================
   ARCHIVO: tests/vehiculos.test.js
   ROL: Tests unitarios para la lógica de validación de vehículos.
         Testea las reglas de negocio de forma aislada (sin DB).
   CÓMO CORRER: npm test
   ========================================================== */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

/* ==========================================================
   Funciones de validación
   Estas funciones replican la lógica de validación del backend.
   Si modificás las reglas en los controllers, actualizá estos tests.
   ========================================================== */

// Normaliza la patente (igual que en vehiculoController.js)
function normalizarPatente(patente) {
    return (patente || '').trim().toUpperCase();
}

// Valida que el año sea razonable (mismo rango que el form del frontend)
function validarAnio(anio) {
    const n = parseInt(anio);
    return !isNaN(n) && n >= 1900 && n <= new Date().getFullYear() + 1;
}

// Valida que el kilometraje sea un número no negativo
function validarKilometraje(km) {
    const n = Number(km);
    return !isNaN(n) && n >= 0;
}

// Valida los tipos de servicio del historial (igual que el select del frontend)
const TIPOS_SERVICIO = ['service', 'reparacion', 'inspeccion', 'siniestro'];
function validarTipoServicio(tipo) {
    return TIPOS_SERVICIO.includes(tipo);
}

// Valida los tipos de deuda (igual que el CHECK constraint de la DB)
const TIPOS_DEUDA = ['multa', 'patente', 'otro'];
function validarTipoDeuda(tipo) {
    return TIPOS_DEUDA.includes(tipo);
}

// ----------------------------------------------------------
// Tests de normalización de patente
// ----------------------------------------------------------
describe('Normalización de patente', () => {

    test('convierte a mayúsculas', () => {
        assert.equal(normalizarPatente('abc123'), 'ABC123');
        assert.equal(normalizarPatente('ab123cd'), 'AB123CD');
    });

    test('elimina espacios al inicio y al final', () => {
        assert.equal(normalizarPatente('  ABC123  '), 'ABC123');
    });

    test('maneja entrada vacía o null', () => {
        assert.equal(normalizarPatente(''),   '');
        assert.equal(normalizarPatente(null), '');
    });
});

// ----------------------------------------------------------
// Tests de validación de año
// ----------------------------------------------------------
describe('Validación de año de vehículo', () => {

    test('acepta años razonables', () => {
        assert.ok(validarAnio(2020));
        assert.ok(validarAnio(1985));
        assert.ok(validarAnio(2000));
    });

    test('acepta año como string numérico', () => {
        assert.ok(validarAnio('2018'));
    });

    test('rechaza años anteriores a 1900', () => {
        assert.ok(!validarAnio(1800));
        assert.ok(!validarAnio(1899));
    });

    test('rechaza textos no numéricos', () => {
        assert.ok(!validarAnio('abc'));
        assert.ok(!validarAnio(''));
        assert.ok(!validarAnio(null));
    });
});

// ----------------------------------------------------------
// Tests de validación de kilometraje
// ----------------------------------------------------------
describe('Validación de kilometraje', () => {

    test('acepta 0 (vehículo nuevo)', () => {
        // Este test documenta que 0 es un valor válido.
        // Bug corregido: el backend usaba !kilometraje que fallaba con 0.
        assert.ok(validarKilometraje(0));
    });

    test('acepta valores positivos', () => {
        assert.ok(validarKilometraje(50000));
        assert.ok(validarKilometraje(1));
    });

    test('rechaza valores negativos', () => {
        assert.ok(!validarKilometraje(-1));
        assert.ok(!validarKilometraje(-100));
    });

    test('rechaza texto no numérico', () => {
        assert.ok(!validarKilometraje('abc'));
        assert.ok(!validarKilometraje(NaN));
    });
});

// ----------------------------------------------------------
// Tests de tipos de servicio
// ----------------------------------------------------------
describe('Tipos de servicio del historial', () => {

    test('acepta los tipos válidos', () => {
        TIPOS_SERVICIO.forEach(tipo => {
            assert.ok(validarTipoServicio(tipo), `"${tipo}" debe ser válido`);
        });
    });

    test('rechaza tipos no reconocidos', () => {
        assert.ok(!validarTipoServicio('aceite'));
        assert.ok(!validarTipoServicio(''));
        assert.ok(!validarTipoServicio('SERVICE')); // case-sensitive
    });
});

// ----------------------------------------------------------
// Tests de tipos de deuda
// ----------------------------------------------------------
describe('Tipos de deuda', () => {

    test('acepta los tipos válidos', () => {
        TIPOS_DEUDA.forEach(tipo => {
            assert.ok(validarTipoDeuda(tipo), `"${tipo}" debe ser válido`);
        });
    });

    test('rechaza tipos no reconocidos', () => {
        assert.ok(!validarTipoDeuda('infraccion'));
        assert.ok(!validarTipoDeuda('MULTA')); // case-sensitive
        assert.ok(!validarTipoDeuda(''));
    });
});
