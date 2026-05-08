const express = require('express');
const router = express.Router();
const { listar, buscarPorPatente, crear, actualizarKilometraje } = require('../controllers/vehiculoController');

router.get('/', listar);
router.get('/:patente', buscarPorPatente);
router.post('/', crear);
router.put('/:patente/kilometraje', actualizarKilometraje);

module.exports = router;
