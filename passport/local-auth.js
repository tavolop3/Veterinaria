const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {User, validateCreate} = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user._id);
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
    console.log(req.body,mail);
    const { error } = validateCreate(req.body); 
    if(error) done(error);

    let user = await User.findOne({ mail: req.body.mail });
    if(user) return done('Usuario ya registrado en el sistema.');

    const salt = await bcrypt.genSalt(10);
    user.contraseña = await bcrypt.hash('contraseñaRandom', salt);

    user = new User(_.pick(req.body, ['nombre','apellido','mail','contraseña','telefono','dni']));
    await user.save();
    
    done(null, user);
}));
