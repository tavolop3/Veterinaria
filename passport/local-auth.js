const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {User, compararContraseñas} = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use(new LocalStrategy({
    usernameField: 'mail',
    passwordField: 'contraseña',
    passReqToCallback: true
  }, async (req, email, password, done) => {
    // const { error } = validateLogin({ mail: email, contraseña: password}); Ya no valida porque no está especificado en la hu
    // if(error) return done(null, false, req.flash('signinMessage', error));
    
    let user = await User.findOne({ mail: email });
    if(!user) return done(null, false, req.flash('signinMessage', 'Contraseña o mail invalido'));

    const validPassword = await compararContraseñas(password, user.contraseña);
    if(!validPassword) return done(null, false, req.flash('signinMessage', 'Contraseña o mail invalido'));

    return done(null, user);
}));