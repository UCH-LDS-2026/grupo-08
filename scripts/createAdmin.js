/**
 * Script para crear el primer usuario administrador.
 *
 * Uso:
 *   ADMIN_NAME="Admin" ADMIN_EMAIL="admin@test.com" ADMIN_PASSWORD="admin123" npm run create:admin
 *
 * Las variables también pueden definirse en el archivo .env antes de ejecutar.
 */

require('dotenv').config();
const bcrypt   = require('bcryptjs');
const Database = require('better-sqlite3');
const path     = require('path');
const { normalizarEmail, esEmailValido, validarPassword } = require('../src/utils/validators');

const ADMIN_NAME     = process.env.ADMIN_NAME;
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Validar que las tres variables existan
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Error: ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD son requeridos.');
    console.error('Uso: ADMIN_NAME="Admin" ADMIN_EMAIL="admin@test.com" ADMIN_PASSWORD="admin123" npm run create:admin');
    process.exit(1);
}

const emailNormalizado = normalizarEmail(ADMIN_EMAIL);

if (!esEmailValido(emailNormalizado)) {
    console.error(`Error: El email "${emailNormalizado}" no tiene un formato válido.`);
    process.exit(1);
}

if (!validarPassword(ADMIN_PASSWORD)) {
    console.error('Error: La contraseña debe tener al menos 6 caracteres.');
    process.exit(1);
}

const db = new Database(path.join(__dirname, '../historycar.db'));
db.pragma('foreign_keys = ON');

const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(emailNormalizado);
if (existe) {
    console.error(`Error: El email "${emailNormalizado}" ya está registrado.`);
    db.close();
    process.exit(1);
}

const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

const resultado = db.prepare(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)'
).run(ADMIN_NAME.trim(), emailNormalizado, passwordHash, 'admin');

console.log('Administrador creado exitosamente.');
console.log(`  ID:    ${resultado.lastInsertRowid}`);
console.log(`  Nombre: ${ADMIN_NAME.trim()}`);
console.log(`  Email:  ${emailNormalizado}`);
console.log(`  Rol:    admin`);

db.close();
