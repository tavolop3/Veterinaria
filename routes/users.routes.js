const bcrypt = require('bcrypt');
const {User, validateCreate, validateLogin} = require('../models/user');
const express = require('express');
const _ = require('lodash');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login'); // Redirige a la página de inicio de sesión si el usuario no está autenticado
  };

router.get('/yo', passport.authenticate("local-signin"), async(req,res) => {
    console.log(req.user);
    res.send(req.user);
})

.post('/login', passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: '/usuarios/login',
    failureFlash: true,
}))

// .post('/registrar', async (req,res) => {
//     const { error } = validateCreate(req.body); 
//     if(error) return res.status(400).render('registro', { error });

//     let user = await User.findOne({ mail: req.body.mail });
//     if(user) return res.status(400).send('User already registered.');

//     user = new User(_.pick(req.body, ['nombre','apellido','mail','telefono','dni']));

//     const salt = await bcrypt.genSalt(10);
//     user.contraseña = await bcrypt.hash('contraRandom', salt);

//     await user.save();    

//     res.send(user);
// })

.post('/registrar', passport.authenticate('local-signup', {
        successRedirect: '/admin',
        failureRedirect: '/usuarios/registrar',
        passReqToCallback: true,
    }), (req, res) => {
        console.log(req.body);
        res.send('a');
        // if (req.user && req.user.isAdmin === true) {
        //     res.redirect('/admin');
        // } else {
        //     res.redirect('/cliente');
        // }

})

// .post('/login', async(req,res) => {
//     const { error } = validateLogin(req.body);  
//     if(error) return res.status(400).send('login', { error });

//     let user = await User.findOne({ email: req.body.mail });
//     if(!user) return res.status(400).render('login',{ error: 'Contraseña o mail invalido' });

//     const validPassword = await bcrypt.compare(req.body.contraseña, user.contraseña);
//     if(!validPassword) return res.status(400).render('login',{ error: 'Contraseña o mail invalido' });

// });

module.exports = router;

