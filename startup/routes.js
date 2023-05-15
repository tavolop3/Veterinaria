const express = require('express');
const users = require('../routes/users.routes');
const auth = require('../routes/auth.routes');
const error = require('../middleware/error');

module.exports = function(app) {
    app.use(express.json());
    app.use('/usuarios',users);
    app.use('/login',auth);
    app.use(error);
}