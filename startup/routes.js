const express = require('express');
const usuarios = require('../routes/usuarios.routes');
const error = require('../middleware/error');
const vistas = require('../routes/vistas.routes');
const bodyParser = require('body-parser');
const admins = require('../routes/admins.routes');
const clientes = require('../routes/clientes.routes');
const autenticado = require('../middleware/autenticado');
const esAdmin = require('../middleware/esAdmin');

module.exports = function (app) {
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/usuarios', usuarios);
    app.use('/', vistas);
    app.use('/admin', [autenticado, esAdmin], admins);
    app.use('/clientes', autenticado, clientes);

    app.use(error);
}