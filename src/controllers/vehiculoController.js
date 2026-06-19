const Vehiculo = require('../models/vehiculoModel');
const Taller   = require('../models/tallerModel');
const {
    normalizarPatente,
    esPatenteValida,
    esEnteroNoNegativo,
    esAnioVehiculoValido,
    limpiarTexto,
} = require('../utils/validators');

const vehiculoController = {

    // Crear vehículo
    crear: (req, res) => {
        const { vin, marca, modelo, anio, kilometraje } = req.body;
        const patente  = normalizarPatente(req.body.patente);
        const dueno_id = req.usuario.id;

        if (!patente || !marca || !modelo || anio == null) {
            return res.status(400).json({
                error: 'Patente, marca, modelo y año son obligatorios'
            });
        }

        if (!esPatenteValida(patente)) {
            return res.status(400).json({
                error: 'Formato de patente inválido. Formatos aceptados: ABC123 (viejo) o AB123CD (Mercosur)'
            });
        }

        const marcaLimpia  = limpiarTexto(marca,  100);
        const modeloLimpio = limpiarTexto(modelo, 100);

        if (!marcaLimpia)  return res.status(400).json({ error: 'La marca no puede estar vacía' });
        if (!modeloLimpio) return res.status(400).json({ error: 'El modelo no puede estar vacío' });

        if (!esAnioVehiculoValido(anio)) {
            return res.status(400).json({
                error: `El año debe ser un número entero entre 1900 y ${new Date().getFullYear() + 1}`
            });
        }

        const km = kilometraje != null ? Number(kilometraje) : 0;
        if (!esEnteroNoNegativo(km)) {
            return res.status(400).json({
                error: 'El kilometraje debe ser un número entero mayor o igual a 0'
            });
        }

        const existe = Vehiculo.buscarPorPatente(patente);
        if (existe) {
            return res.status(400).json({ error: 'Ya existe un vehículo con esa patente' });
        }

        const resultado = Vehiculo.crear(
            patente,
            vin ? limpiarTexto(vin, 50) : null,
            marcaLimpia,
            modeloLimpio,
            Number(anio),
            km,
            dueno_id
        );

        res.status(201).json({
            mensaje: 'Vehículo registrado exitosamente ✅',
            id: resultado.lastInsertRowid
        });
    },

    // Obtener mis vehículos
    misvehiculos: (req, res) => {
        const dueno_id = req.usuario.id;
        const vehiculos = Vehiculo.buscarPorDueno(dueno_id);
        res.json({ vehiculos });
    },

    // Buscar por patente con control de privacidad según rol
    buscarPorPatente: (req, res) => {
        const patente = req.params.patente.trim().toUpperCase();
        const vehiculo = Vehiculo.buscarPorPatenteConDueno(patente);

        if (!vehiculo) {
            return res.status(404).json({ error: 'Vehículo no encontrado' });
        }

        const usuario = req.usuario;
        let mostrarNombre = false;
        let mostrarEmail  = false;

        if (usuario.rol === 'admin') {
            mostrarNombre = true;
            mostrarEmail  = true;
        } else if (usuario.rol === 'dueno' && usuario.id === vehiculo.dueno_id) {
            // Dueño propietario ve sus propios datos
            mostrarNombre = true;
            mostrarEmail  = true;
        } else if (usuario.rol === 'taller' && Taller.esCertificado(usuario.id)) {
            // Taller certificado ve nombre pero no email
            mostrarNombre = true;
            mostrarEmail  = false;
        }
        // Taller no certificado y dueño ajeno: null en ambos campos

        res.json({
            vehiculo: {
                id:          vehiculo.id,
                patente:     vehiculo.patente,
                vin:         vehiculo.vin,
                marca:       vehiculo.marca,
                modelo:      vehiculo.modelo,
                anio:        vehiculo.anio,
                kilometraje: vehiculo.kilometraje,
                dueno_id:    vehiculo.dueno_id,
                dueno_nombre: mostrarNombre ? vehiculo.dueno_nombre : null,
                dueno_email:  mostrarEmail  ? vehiculo.dueno_email  : null,
            }
        });
    }
};

module.exports = vehiculoController;
