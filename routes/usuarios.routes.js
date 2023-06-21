const express = require('express');
const router = express.Router();
const passport = require('passport');
const { Cruza } = require('../models/cruza')
const autenticado = require('../middleware/autenticado');
const { User, encriptarContraseña, compararContraseñas } = require('../models/user');
const { sendEmail } = require('../emails');
const { Perdida } = require('../models/perdida');

// Para ver el usuario actual
router.get('/yo', autenticado, async (req, res) => {
  res.send(req.user);
})

  .post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.render('login', { error: req.flash('signinMessage') });
      }
      req.login(user, async loginErr => {
        if (loginErr) {
          return next(loginErr);
        } else {
          if (user.contraseña === user.contraseñaDefault) {
            res.render('modificar-pass', { error: 'Debe modificar su contraseña por seguridad.' })
          } else {
            res.redirect('/');
          }
        }
      });
    })(req, res, next);
  })

  .get('/cerrar-sesion', function (req, res) {
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  })

  //Cambiar contraseña para el primer login, no está en cliente porque no debe estar totalmente autenticado
  .post('/primer-login-pass', async (req, res) => {
    if (req.isAuthenticated()) {
      let { contraseña1, contraseña2 } = req.body;
      let user = await User.findById(req.user.id);

      let contraseñaValida = await compararContraseñas(contraseña1, user.contraseña);
      if (!contraseñaValida) return res.status(400).render('modificar-pass', { error: 'La contraseña ingresada no es correcta' });

      contraseñaValida = contraseña2.length > 3 && contraseña2.length < 255
      if (!contraseñaValida) return res.status(400).render('modificar-pass', { error: 'La contraseña nueva debe ser mayor a 3 caracteres y menor a 255 caracteres' });

      user.contraseña = await encriptarContraseña(contraseña2);
      await user.save();

      return res.redirect('/');
    }
  })

  .post('/paseador-cuidador/solicitar', async (req, res) => {
    if (req.isAuthenticated()) {
      // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
      await sendEmail(req.user.mail, 'OhMyDog - Solicitud de paseo/cuidado fue enviada',
        'Su solicitud de paseo/cuidado se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar.'
      );

      await sendEmail(req.body.mailPostulante, 'OhMyDog - Solicitud de paseo/cuidado recibida',
        'Ha recibido una solicitud de paseo/cuidado, contactese con ' + req.user.mail + ' para poder coordinar.'
      );
      res.send('<script>alert("Se solicitó exitosamente, revisa tu mail."); window.location.href = "/";</script>');
    } else {
      res.render('mail-noCliente', { mailPostulante: req.body.mailPostulante });
    }
  })

  .post('/paseador-cuidador/mail-noCliente', async (req, res) => {
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    /* await sendEmail(req.body.mailSolicitante,'OhMyDog - Solicitud de paseo/cuidado enviada',
        'Su solicitud de adopción se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar la adopción. Para tener acceso a más funcionalidades acercate a la veterinaria y registrate!' 
    );
    */
    /* await sendEmail(req.body.mailPostulante,'OhMyDog - Solicitud de paseo/cuidado recibida',
        'Ha recibido una solicitud de adopción, contactese con ' + req.body.mailSolicitante + ' para poder coordinar la adopción.' 
    );
    */
    res.send('<script>alert("Se solicitó exitosamente no cliente borrar, revisa tu mail."); window.location.href = "/";</script>');
  })


  .post('/cruza/solicitar', async (req, res) => {
    if (req.isAuthenticated()) {
      // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
      await sendEmail(req.user.mail, 'OhMyDog - Solicitud de cruza fue enviada',
        'Su solicitud de cruza se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar.'
      );

      await sendEmail(req.body.mailPostulante, 'OhMyDog - Solicitud de cruza recibida',
        'Ha recibido una solicitud de cruza, contactese con ' + req.user.mail + ' para poder coordinar.'
      );
      res.send('<script>alert("Se solicitó exitosamente, revisa tu mail."); window.location.href = "/";</script>');
    } else {
      res.render('mail-noCliente-cruza', { mailPostulante: req.body.mailPostulante });
    }
  })

  .post('/cruza/mail-noCliente', async (req, res) => {
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    await sendEmail(req.body.mailSolicitante, 'OhMyDog - Solicitud de cruza enviada',
      'Su solicitud de cruza se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar la adopción. Para tener acceso a más funcionalidades acercate a la veterinaria y registrate!'
    );
    await sendEmail(req.body.mailPostulante, 'OhMyDog - Solicitud de cruza recibida',
      'Ha recibido una solicitud de cruza, contactese con ' + req.body.mailSolicitante + ' para poder coordinar la adopción.'
    );// TODO agregarle algun contexto, como el nombre del perro 
    res.send('<script>alert("Se solicitó exitosamente, revisa tu mail."); window.location.href = "/";</script>');
  })

  .post('/adopcion/solicitar', async (req, res) => {
    if (req.isAuthenticated()) {
      // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
      await sendEmail(req.user.mail, 'OhMyDog - Solicitud de adopción enviada',
        'Su solicitud de adopción se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar la adopción.'
      );

      await sendEmail(req.body.mailPostulante, 'OhMyDog - Solicitud de adopción recibida',
        'Ha recibido una solicitud de adopción, contactese con ' + req.user.mail + ' para poder coordinar la adopción.'
      );

      res.send('<script>alert("Se solicitó la adopción, revisa tu mail."); window.location.href = "/";</script>');
    } else {
      res.render('mail-noCliente', { mailPostulante: req.body.mailPostulante });
    }
  })

  .post('/adopcion/mail-noCliente', async (req, res) => {
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    /* await sendEmail(req.body.mailSolicitante,'OhMyDog - Solicitud de adopción enviada',
        'Su solicitud de adopción se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar la adopción. Para tener acceso a más funcionalidades acercate a la veterinaria y registrate!' 
    );
    */
    /*
    await sendEmail(req.body.mailPostulante,'OhMyDog - Solicitud de adopción recibida',
        'Ha recibido una solicitud de adopción, contactese con ' + req.body.mailSolicitante + ' para poder coordinar la adopción.' 
    );
    */
    res.send('<script>alert("Se solicitó la adopción, revisa tu mail."); window.location.href = "/";</script>');
  })
  .post('/adopcion/mail-noCliente', async (req, res) => {
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    await sendEmail(req.body.mailSolicitante, 'OhMyDog - Solicitud de adopción enviada',
      'Su solicitud de adopción se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar la adopción. Para tener acceso a más funcionalidades acercate a la veterinaria y registrate!'
    );

    await sendEmail(req.body.mailPostulante, 'OhMyDog - Solicitud de adopción recibida',
      'Ha recibido una solicitud de adopción, contactese con ' + req.body.mailSolicitante + ' para poder coordinar la adopción.'
    );

    res.send('<script>alert("Se solicitó la adopción, revisa tu mail."); window.location.href = "/";</script>');
  })

  .post('/visualizar-tablon-cruza', async (req, res) => {
    let { raza, sexo, fecha, edad } = req.body;
    try {
      let mail = "";
      if (req.isAuthenticated())
        mail = req.user.mail;
      let cruzas = (await Cruza.find({})).filter(cruza => cruza.mail !== mail);
      if (raza !== "Cualquiera")
        cruzas = cruzas.filter(cruza => cruza.raza === raza);
      if (sexo !== "Cualquiera")
        cruzas = cruzas.filter(cruza => cruza.sexo === sexo);
      if (fecha) {
        let fechaSeleccionada = new Date(fecha);
        let fechaLimiteAntes = new Date(fechaSeleccionada.getTime());
        fechaLimiteAntes.setDate(fechaSeleccionada.getDate() - 5);
        let fechaLimiteDespues = new Date(fechaSeleccionada.getTime());
        fechaLimiteDespues.setDate(fechaSeleccionada.getDate() + 5);
        cruzas = cruzas.filter(cruza => {
          const fechaCruza = new Date(cruza.fechaDeCelo);
          return fechaCruza >= fechaLimiteAntes && fechaCruza <= fechaLimiteDespues;
        });
      }
      if (edad !== "") {
        let hoy = new Date();
        cruzas = cruzas.filter(cruza => {
          const edadCruza = hoy.getUTCFullYear() - cruza.fechaDeNacimiento.getUTCFullYear();
          return edadCruza === Number(edad);
        });
      }
      res.render('tablonCruza', { cruzas: cruzas, usuarioActual: mail });
    } catch (error) {
      console.log('Error al obtener las cruzas:', error);
      return res.status(400).send('Error al obtener las cruzas');
    }
  })

  .post('/visualizar-tablon-perdida', async (req, res) => {
    let { nombre, sexo, foto, raza, color, mail, confirmado } = req.body;
    try {
      let mail = "";
      if (req.isAuthenticated())
        mail = req.user.mail;
      let perdidas = (await Perdida.find({})).filter(perdida => perdida.mail !== mail);

      res.render('tablonPerdida', { perdidas: perdidas, usuarioActual: mail });
    } catch (error) {
      console.log('Error al obtener las busquedas/perdidas:', error);
      return res.status(400).send('Error al obtener las busquedas/perdidas');
    }
  })


.post('/anuncio/contactar', async (req, res) => {
  if (req.isAuthenticated()) {
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    await sendEmail(req.user.mail, 'OhMyDog - Solicitud de contacto enviada',
      'Su información de contacto se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar.'
    );

    await sendEmail(req.body.mailPostulante, 'OhMyDog - Solicitud de contacto recibida',
      'Ha recibido una solicitud de contacto por su anuncio, contactese con ' + req.user.mail + ' para poder coordinar.'
    );
    res.send('<script>alert("Se solicitó exitosamente, revisa tu mail."); window.location.href = "/";</script>');
  } else {
    res.render('mail-noCliente-anuncio', { mailPostulante: req.body.mailPostulante });
  }
})

.post('/anuncio/mail-noCliente', async (req, res) => {
  // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
  await sendEmail(req.body.mailSolicitante, 'OhMyDog - Solicitud de contacto enviada',
    'Su información de contacto se ha enviado, contactese con ' + req.body.mailPostulante + ' para poder coordinar. Para tener acceso a más funcionalidades acercate a la veterinaria y registrate!'
  );
  await sendEmail(req.body.mailPostulante, 'OhMyDog - Solicitud de contacto recibida',
    'Ha recibido una solicitud de contacto por su anuncio, contactese con ' + req.body.mailSolicitante + ' para poder coordinar.'
  ); 
  res.send('<script>alert("Se solicitó exitosamente, revisa tu mail."); window.location.href = "/";</script>');
})

module.exports = router;

