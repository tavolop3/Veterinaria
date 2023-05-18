const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {User, validateCreate, validateLogin} = require('../models/user');
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => {
  console.log(user);  
  done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use('local-signup', new LocalStrategy({
        usernameField: 'mail',
        passwordField: 'contraseña',
        passReqToCallback: true
}, async(req, mail, done) => {
    console.log(req,mail);
    const { error } = validateCreate(req); 
    if(error) done(error);

    let user = await User.findOne({ mail: req.body.mail });
    if(user) return done('Usuario ya registrado en el sistema.');

    const salt = await bcrypt.genSalt(10);
    user.contraseña = await bcrypt.hash('contraseñaRandom', salt);

    user = new User(_.pick(req.body, ['nombre','apellido','mail','contraseña','telefono','dni']));
    await user.save();
    
    done(null, user);
}));

passport.use('local-signin', new LocalStrategy({
    usernameField: 'mail',
    passwordField: 'contraseña',
    passReqToCallback: true
  }, async (req, email, password, done) => {
    const { error } = validateLogin({ mail: email, contraseña: password});  
    if(error) return done(null, false, req.flash('signinMessage', error));
    
    let user = await User.findOne({ mail: email });
    if(!user) return done(null, false, req.flash('signinMessage', 'Contraseña o mail invalido'));

    const validPassword = await bcrypt.compare(password, user.contraseña);
    if(!validPassword) return done(null, false, req.flash('signinMessage', 'Contraseña o mail invalido'));

    return done(null, user);
  }));