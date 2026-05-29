/* ==========================================================
   ARCHIVO: tests/auth.test.js
   ROL: Tests unitarios para la lógica de autenticación.
         Testea bcrypt y JWT de forma aislada, sin necesidad
         de levantar el servidor ni conectarse a la base de datos.
   CÓMO CORRER: npm test
   ========================================================== */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const SECRET_TEST = 'clave-de-prueba-1234';

// ----------------------------------------------------------
// Tests de hash de contraseñas (bcrypt)
// ----------------------------------------------------------
describe('Hash de contraseñas (bcrypt)', () => {

    test('genera un hash diferente a la contraseña original', () => {
        const plain = 'miContraseña123';
        const hash  = bcrypt.hashSync(plain, 10);
        assert.notEqual(hash, plain);
    });

    test('verifica correctamente la contraseña contra su hash', () => {
        const plain = 'miContraseña123';
        const hash  = bcrypt.hashSync(plain, 10);
        assert.ok(bcrypt.compareSync(plain, hash), 'La contraseña correcta debe verificarse');
    });

    test('rechaza una contraseña incorrecta', () => {
        const hash = bcrypt.hashSync('contraseñaCorrecta', 10);
        assert.ok(!bcrypt.compareSync('contraseñaIncorrecta', hash), 'Una contraseña incorrecta debe fallar');
    });

    test('dos hashes del mismo texto son diferentes (salt aleatorio)', () => {
        const plain  = 'mismaClave';
        const hash1  = bcrypt.hashSync(plain, 10);
        const hash2  = bcrypt.hashSync(plain, 10);
        // El salt aleatorio garantiza hashes distintos
        assert.notEqual(hash1, hash2);
        // Pero ambos verifican correctamente
        assert.ok(bcrypt.compareSync(plain, hash1));
        assert.ok(bcrypt.compareSync(plain, hash2));
    });
});

// ----------------------------------------------------------
// Tests de tokens JWT
// ----------------------------------------------------------
describe('Tokens JWT', () => {

    test('genera un token con el payload correcto', () => {
        const payload = { id: 1, rol: 'dueno' };
        const token   = jwt.sign(payload, SECRET_TEST, { expiresIn: '1h' });
        const decoded = jwt.verify(token, SECRET_TEST);

        assert.equal(decoded.id,  1);
        assert.equal(decoded.rol, 'dueno');
    });

    test('verifica token con id y rol de taller', () => {
        const token   = jwt.sign({ id: 5, rol: 'taller' }, SECRET_TEST, { expiresIn: '1h' });
        const decoded = jwt.verify(token, SECRET_TEST);
        assert.equal(decoded.id,  5);
        assert.equal(decoded.rol, 'taller');
    });

    test('rechaza un token con firma incorrecta', () => {
        const token = jwt.sign({ id: 1 }, SECRET_TEST);
        assert.throws(
            () => jwt.verify(token, 'clave-incorrecta'),
            { name: 'JsonWebTokenError' }
        );
    });

    test('rechaza un token expirado', () => {
        // expiresIn negativo genera un token ya expirado
        const token = jwt.sign({ id: 1 }, SECRET_TEST, { expiresIn: '-1s' });
        assert.throws(
            () => jwt.verify(token, SECRET_TEST),
            { name: 'TokenExpiredError' }
        );
    });

    test('rechaza un string que no es un token JWT válido', () => {
        assert.throws(
            () => jwt.verify('esto.no.es.un.token', SECRET_TEST),
            { name: 'JsonWebTokenError' }
        );
    });
});

// ----------------------------------------------------------
// Tests de normalización de email
// ----------------------------------------------------------
describe('Normalización de email', () => {

    test('convierte a minúsculas y elimina espacios', () => {
        const normalizar = (email) => email.trim().toLowerCase();

        assert.equal(normalizar('  Juan@GMAIL.COM  '), 'juan@gmail.com');
        assert.equal(normalizar('ADMIN@HISTORYCAR.COM'), 'admin@historycar.com');
        assert.equal(normalizar('taller@empresa.com'), 'taller@empresa.com');
    });
});
