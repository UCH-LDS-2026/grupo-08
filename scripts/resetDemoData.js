/**
 * Reinicia la base de datos local con datos demo.
 * Maneja automáticamente la migración desde esquemas anteriores.
 *
 * ADVERTENCIA: elimina TODOS los datos locales. No usar en producción.
 *
 * Uso:  npm run reset:demo
 */

require('dotenv').config();
const bcrypt   = require('bcryptjs');
const Database = require('better-sqlite3');
const path     = require('path');

console.log('\n⚠️  ADVERTENCIA: este script elimina todos los datos locales. No usar en producción.\n');

const dbPath = path.join(__dirname, '../historycar.db');

// ── Paso 1: migrar esquema anterior si es necesario ──────────
// Se abre la DB directamente (sin pasar por database.js) para poder
// detectar y corregir el esquema antes de que database.js lo rechace.
{
    const rawDb = new Database(dbPath);
    const usuariosSchema = rawDb.prepare(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='usuarios'"
    ).get();

    const esquemaDesactualizado = usuariosSchema && (
        usuariosSchema.sql.includes("'taller'") ||
        usuariosSchema.sql.includes('"taller"')
    );

    if (esquemaDesactualizado) {
        console.log('Esquema anterior detectado. Migrando...');
        rawDb.pragma('foreign_keys = OFF');
        rawDb.exec(`
            DROP TABLE IF EXISTS historial;
            DROP TABLE IF EXISTS deudas;
            DROP TABLE IF EXISTS talleres;
            DROP TABLE IF EXISTS vehiculos;
            DROP TABLE IF EXISTS usuarios;
        `);
        rawDb.pragma('foreign_keys = ON');
        console.log('Migración completada. Creando nuevo esquema...\n');
    }

    rawDb.close();
}

// ── Paso 2: cargar database.js (crea nuevo esquema si no existe) ──
const db = require('../src/config/database');

// ── Paso 3: limpiar datos existentes en orden FK-safe ────────
db.pragma('foreign_keys = OFF');
db.prepare('DELETE FROM historial').run();
db.prepare('DELETE FROM deudas').run();
db.prepare('DELETE FROM vehiculos').run();
db.prepare('DELETE FROM usuarios').run();
db.prepare('DELETE FROM talleres').run();

try {
    db.prepare(
        "DELETE FROM sqlite_sequence WHERE name IN ('historial','deudas','vehiculos','usuarios','talleres')"
    ).run();
} catch (_) { /* sqlite_sequence no existe todavía */ }

db.pragma('foreign_keys = ON');

// ── Paso 4: crear datos demo ─────────────────────────────────

// Taller demo
const tallerDemo = db.prepare(
    'INSERT INTO talleres (nombre_taller, direccion, telefono, certificado) VALUES (?, ?, ?, ?)'
).run('Taller Demo SRL', 'Calle 123', '2610000000', 1);
const TALLER_DEMO_ID = tallerDemo.lastInsertRowid;

// Admin demo — contraseña 'admin' (5 chars) es excepción local
const hashAdmin = bcrypt.hashSync('admin', 10);
db.prepare('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)')
  .run('Administrador', 'admin@gmail.com', hashAdmin, 'admin');

// Dueño demo
const hashDueno = bcrypt.hashSync('dueno123', 10);
db.prepare('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)')
  .run('Dueño Demo', 'dueno@test.com', hashDueno, 'dueno');
const DUENO_ID = db.prepare("SELECT last_insert_rowid() as id").get().id;

// Mecánico demo — asociado al Taller Demo SRL
const hashMecanico = bcrypt.hashSync('mecanico123', 10);
db.prepare('INSERT INTO usuarios (nombre, email, password, rol, taller_id) VALUES (?, ?, ?, ?, ?)')
  .run('Mecánico Demo', 'mecanico@test.com', hashMecanico, 'mecanico', TALLER_DEMO_ID);

// Vehículo demo asociado al dueño
db.prepare(
    'INSERT INTO vehiculos (patente, marca, modelo, anio, kilometraje, dueno_id) VALUES (?, ?, ?, ?, ?, ?)'
).run('ABC123', 'Toyota', 'Corolla', 2020, 50000, DUENO_ID);

console.log('✅ Datos demo reiniciados correctamente.');
console.log('');
console.log('   Cuentas disponibles:');
console.log('   ─────────────────────────────────────────');
console.log('   Admin:     admin@gmail.com     / admin');
console.log('   Dueño:     dueno@test.com      / dueno123');
console.log('   Mecánico:  mecanico@test.com   / mecanico123');
console.log('   ─────────────────────────────────────────');
console.log('   Taller demo: Taller Demo SRL (ID:', TALLER_DEMO_ID, ')');
console.log('   Vehículo demo: ABC123 (Toyota Corolla 2020)');
console.log('');
console.log('   Iniciá el servidor con:  npm start');
console.log('   Luego abrí:              http://localhost:3000\n');
