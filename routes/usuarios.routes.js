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

.post('/adopcion/solicitar', async(req,res) => {
  if(req.isAuthenticated()){
      // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
      await sendEmail(req.user.mail,'OhMyDog - Solicitud de adopción enviada',
          'Su solicitud de adopción se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar la adopción.' 
      );
      await sendEmail(req.body.mailPostulante,'OhMyDog - Solicitud de adopción recibida',
          'Ha recibido una solicitud de adopción, contactese con ' + req.user.mail + ' para poder coordinar la adopción.' 
      );
      res.send('<script>alert("Se solicitó el turno, revisa tu mail."); window.location.href = "/";</script>');
  } else {
    res.render('mail-noCliente', { mailPostulante: req.body.mailPostulante });
  }
})

.post('/adopcion/mail-noCliente', async(req,res) => {
  // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
  await sendEmail(req.body.mailSolicitante,'OhMyDog - Solicitud de adopción enviada',
      'Su solicitud de adopción se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar la adopción. Para tener acceso a más funcionalidades acercate a la veterinaria y registrate!' 
  );
  await sendEmail(req.body.mailPostulante,'OhMyDog - Solicitud de adopción recibida',
      'Ha recibido una solicitud de adopción, contactese con ' + req.body.mailSolicitante + ' para poder coordinar la adopción.' 
  );
  res.send('<script>alert("Se solicitó el turno, revisa tu mail."); window.location.href = "/";</script>');
})

module.exports = router;

