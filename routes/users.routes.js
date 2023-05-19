const bcrypt = require('bcrypt');
const {User, validateCreate, validateLogin} = require('../models/user');
const express = require('express');
const _ = require('lodash');
const router = express.Router();
const passport = require('passport');
const { default: mongoose } = require('mongoose');
const { func } = require('joi');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    // Redirige a la página de inicio de sesión si el usuario no está autenticado
    res.render('login', { error: 'Se debe autenticar '}); 
  };

router.get('/yo', isAuthenticated, async(req,res) => {
    res.send(req.user);
})

.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuarios/login',
    failureFlash: true,
}))

.post('/registrar', async (req,res) => {
    const { error } = validateCreate(req.body); 
    if(error) return res.status(400).render('registro', { error });

    let user = await User.findOne({ mail: req.body.mail });
    if(user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['nombre','apellido','mail','telefono','dni']));

    const salt = await bcrypt.genSalt(10);
    user.contraseña = await bcrypt.hash('contraRandom', salt);

    await user.save();    

    req.login(user, function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });

    // res.send(user);
})

/*  el metodo permite que un usuari
    realize la modificacion
    de su mail o contraseña
*/
.post('/modificar-datos', async (req, res) => {
  const { mail1, mail2, contraseña1, contraseña2 } = req.body;
  let user = await User.findOne({ mail: mail1 });
  if (!user) return res.status(400).send('El mail ingresado no pertenece a ningun usuario en el sistema');
  if (user.contraseña != contraseña1) return res.status(400).send('La contraseña ingresada no es correcta');
  if (mail2 === "") mail2 = mail1;
  if (contraseña2 === "") contraseña2 = contraseña1;
  const updatedFields = {};
  if (mail2 !== "") updatedFields.mail = mail2;
  if (contraseña2 !== "") updatedFields.contraseña = contraseña2;
  try {
    await User.updateOne({ mail: mail1 }, { $set: updatedFields });
    return res.redirect('/');
  } catch (error) {
    return res.json({
      resultado: false,
      msg: 'El usuario no se pudo modificar',
      error
    });
  }
})

module.exports = router;

