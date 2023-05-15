const express = require('express');
const users = require('../routes/users.routes');
const auth = require('../routes/auth.routes');
const error = require('../middleware/error');
const index = require('../routes/index.routes');
const bodyParser = require('body-parser');

module.exports = function(app) {
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/usuarios',users);
    app.use('/login',auth);
    app.use('/',index);
    app.use(error);
}