const express = require('express');
const usuarios = require('../routes/usuarios.routes');
const error = require('../middleware/error');
const vistas = require('../routes/vistas.routes');
const bodyParser = require('body-parser');
const admins = require('../routes/admins.routes');
const clientes = require('../routes/clientes.routes');

module.exports = function(app) {
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.use('/usuarios',usuarios);
    app.use('/',vistas);
    app.use('/admin',admins);
    app.use('/clientes',clientes);
    
    app.use(error);
}