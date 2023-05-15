const express = require('express');
const passport = require('passport');
const router = express.Router();
require('../passport/local-auth');
const session = require('express-session');

module.exports = function(app){
    app.use(passport.initialize());
    app.use(session({
        secret: 'secretSession',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.session());
}