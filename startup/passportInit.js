const passport = require('passport');
require('../passport/local-auth');
const session = require('express-session');
const flash = require('connect-flash');


module.exports = function(app){
    app.use(session({
        secret: 'secretSession',
        resave: false,
        saveUninitialized: false
    }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
}