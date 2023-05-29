const express = require('express');
const router = express.Router();
const passport = require('passport');
const autenticado = require('../middleware/autenticado');
const { User, encriptarContraseña, compararContraseñas } = require('../models/user');
const { sendEmail } = require('../emails');

// Para ver el usuario actual
router.get('/yo', autenticado, async(req,res) => {
    res.send(req.user);
})

.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err); 
    }
    if (!user) {
      return res.render('login', { error: req.flash('signinMessage')});
    }
    req.login(user, async loginErr => {
      if (loginErr) {
        return next(loginErr);
      } else {
        if(user.contraseña === user.contraseñaDefault) {
          res.render('modificar-pass', { error : 'Debe modificar su contraseña por seguridad.' })
        } else {
          res.redirect('/');
        }     
      }
    });      
  })(req, res, next);
})

.get('/cerrar-sesion', function(req, res){
  req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
  });
})

//Cambiar contraseña para el primer login, no está en cliente porque no debe estar totalmente autenticado
.post('/primer-login-pass', async(req,res) => {
  if(req.isAuthenticated()){
    let { contraseña1, contraseña2 } = req.body;
    let user = await User.findById(req.user.id);
    
    let contraseñaValida = await compararContraseñas(contraseña1, user.contraseña);
    if (!contraseñaValida) return res.status(400).render('modificar-pass', { error: 'La contraseña ingresada no es correcta' });

    contraseñaValida = contraseña2.length > 3 && contraseña2.length < 255
    if(!contraseñaValida) return res.status(400).render('modificar-pass', { error: 'La contraseña nueva debe ser mayor a 3 caracteres y menor a 255 caracteres' }); 
    
    user.contraseña = await encriptarContraseña(contraseña2);
    await user.save();

    return res.redirect('/');
  }
})

.post('/adopcion/solicitar', (req,res) => {
  //en realidad seria un endpoint que vea si 
  // es cliente -> manda el mail
  //  sino -> lo manda a un formulario para ingresar su mail (si es un popup mejor)
  //    hay que hacer otro endpoint acá para recibir el mail y mandarselo al propietario de la adopcion

  // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
  // await sendEmail(req.body.mailSolicitante,'OhMyDog - Solicitud de adpopción enviada',
  //     'Su solicitud de adopción se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar la adopción. Para tener acceso a más funcionalidades acercate a la veterinaria y registrate!' 
  // );

  res.send('La solicitud fue enviada.');
})

module.exports = router;

