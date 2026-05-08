const express = require('express');
const router = express.Router();
const { registrar, login, listar } = require('../controllers/usuarioController');

router.post('/registro', registrar);
router.post('/login', login);
router.get('/', listar);

module.exports = router;
