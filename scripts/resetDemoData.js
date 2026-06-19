/**
 * Reinicia la base de datos local con datos mínimos para demo/pruebas académicas.
 * Usa la conexión central del proyecto (src/config/database) para garantizar
 * que las tablas existan antes de operar.
 *
 * ADVERTENCIA: elimina TODOS los datos locales. No usar en producción.
 *
 * Uso:
 *   npm run reset:demo
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/database'); // crea tablas si no existen

console.log('\n⚠️  ADVERTENCIA: este script elimina todos los datos locales y crea una cuenta demo. No usar en producción.\n');

// Limpiar datos en orden inverso a las FK para evitar errores de integridad
db.prepare('DELETE FROM historial').run();
db.prepare('DELETE FROM deudas').run();
db.prepare('DELETE FROM talleres').run();
db.prepare('DELETE FROM vehiculos').run();
db.prepare('DELETE FROM usuarios').run();

// Resetear contadores AUTOINCREMENT
// sqlite_sequence solo existe si alguna tabla con AUTOINCREMENT recibió inserciones previas
try {
    db.prepare(
        "DELETE FROM sqlite_sequence WHERE name IN ('historial','deudas','talleres','vehiculos','usuarios')"
    ).run();
} catch (_) {
    // La tabla sqlite_sequence no existe todavía: no hay nada que resetear
}

// Crear usuario administrador demo
// NOTA: la contraseña 'admin' (5 chars) es una excepción local.
// La validación general del sistema sigue exigiendo mínimo 6 caracteres.
const passwordHash = bcrypt.hashSync('admin', 10);
db.prepare(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)'
).run('Administrador', 'admin@gmail.com', passwordHash, 'admin');

console.log('✅ Datos demo reiniciados correctamente.');
console.log('   Usuario administrador:');
console.log('   Email:    admin@gmail.com');
console.log('   Password: admin');
console.log('\nIniciá el servidor con:  npm start');
console.log('Luego abrí:              http://localhost:3000\n');
