const express = require('express');
const router = express.Router();
var crypto = require("crypto");
const { User, validateCreate, encriptarContraseña } = require('../models/user');
const { Perro } = require('../models/perro')
const { Turno, modificarEstado } = require('../models/turno')
const _ = require('lodash');
const { sendEmail } = require('../emails');
const { ObjectId } = require('mongoose').Types;
const moment = require('moment');

router.post('/registrar-usuario', async (req, res) => {
  // const { error } = validateCreate(req.body);  Ya no valida porque no está especificado en las hu las microvalidaciones
  // if (error) return res.status(400).render('registro-usuario', { error });

  let user = await User.findOne({ mail: req.body.mail });
  if (user) return res.status(400).render('registro-usuario', { error: 'El mail ya está en uso.' }); // TODO Popup

  user = await User.findOne({ dni: req.body.dni });
  if (user) return res.status(400).render('registro-usuario', { error: 'El dni ya está registrado.' });

  user = new User(_.pick(req.body, ['nombre', 'apellido', 'mail', 'telefono', 'dni']));

  const contraRandom = crypto.randomBytes(8).toString('hex');
  // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
  // await sendEmail(user.mail,'OhMyDog - Contraseña predefinida',
  //     'Bienvenido a OhMyDog, tu cuenta fue creada con exito. Tu contraseña para el primer ingreso va a ser '+ contraRandom + ' es importante que la cambies ni bien accedas por motivos de seguridad, gracias.'
  // );
  console.log('Contraseña generada:' + contraRandom);
  user.contraseña = await encriptarContraseña(contraRandom);
  user.contraseñaDefault = user.contraseña;
  await user.save();

  res.redirect('/'); // TODO Enviar mensaje con confirmación de creación 
})

  .post('/modificar-usuario', async (req, res) => {
    const { dato, mail, nombre, apellido, dni, telefono } = req.body;
    let user = await User.findOne({ mail: dato });
    if (!user) return res.status(400).send('No se encontro el usuario');
    try {
      await User.updateOne({ mail: dato }, {
        $set: {
          mail: mail,
          nombre: nombre,
          apellido: apellido,
          dni: dni,
          telefono, telefono
        }
      });
      return res.redirect('/admin');
    } catch (error) {
      return res.json({
        resultado: false,
        msg: 'El usuario no se pudo modificar',
        error
      });
    }
  })

  .post('/modificar-perro', async (req, res) => {
    const { id, nombre, sexo, fecha, raza, color, observaciones, foto } = req.body;
    try {
      await Perro.updateOne({ _id: id }, {
        $set: {
          nombre: nombre,
          sexo: sexo,
          fecha: fecha,
          raza: raza,
          color: color,
          observaciones: observaciones,
          foto: foto
        }
      });
      return res.redirect('/admin');
    } catch (error) {
      return res.json({
        resultado: false,
        msg: 'El perro no se pudo modificar',
        error
      });
    }
  })

//route for user list
router.get('/listar-usuarios', async (req, res) => {
  try {
    let users = await User.find({ isAdmin: false });
    const lista = users.map(usuario => ({ dni: usuario.dni, mail: usuario.mail, nombre: usuario.nombre, apellido: usuario.apellido }))
    if (lista.length === 0) {
      res.render('listaUsuarios', { error: 'La lista esta vacia' });
    } else {
      res.render('listaUsuarios', { usuarios: lista });
    }
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/registrar-perro', async (req, res) => {
  try {
    const perro = new Perro(_.pick(req.body, ['nombre', 'sexo', 'fechaDeNacimiento', 'raza', 'color', 'observaciones', 'foto', 'mail']));
    //const { error } = validateCreatePerro(perro);
    //if (error) return res.status(400).render('registro-perro', { error });
    let user = await User.findOne({ mail: req.body.mail });
    if (!user) {
      return res.status(400).send('User not registered.');
    }

    console.log(user);

    perro = new Perro(_.pick(req.body, ['nombre', 'sexo', 'fechaDeNacimiento', 'raza', 'color', 'observaciones', 'foto']));

    console.log(perro);

    const perros = user.perrosId; // Array de perros del usuario

    console.log(perros);

    let perroEncontrado = perros.find(perroId => perroId && perroId.toString() === perro._id.toString());

    if (!perroEncontrado) {
      console.log('El perro no se encuentra en la lista del usuario');
      user.perrosId.push(perro._id);
      await user.save();
      console.log("Perro agregado al usuario");
    } else {
      console.log('El perro ya está en la lista del usuario');
      return res.status(400).send('Perro already registered.');
    }

    await perro.save();

    res.redirect('/admin');
  } catch (error) {
    console.log('Error al registrar el perro:', error);
    return res.status(500).send('Internal Server Error');
  }
})

  /*  permite visualizar al administrador
      los turnos asignados para el dia
  */
  .get('/turnos-diarios', async (req, res) => {
    let hoy = new Date();
    try {
      let turnos = await Turno.find({});
      let turnosDiarios = turnos.filter(turno => turno.fecha.getDate() === hoy.getDate());
      res.render('turnos-hoy', { turnosDiarios })
    } catch (error) {
      console.log('Error al obtener los turnos:', error);
      return res.status(400).send('Error al obtener los turnos');
    }
  })

  .post('/admin/mostrar-modificar-turno', (req, res) => {
    res.render('modificar-turno', { turno: req.body.turno });
  })

  .post('/modificar-turno', async (req, res) => {
    var campos = ['rangoHorario', 'fecha', 'estado'];
    campos = _.pickBy(_.pick(req.body, campos), _.identity)
    campos.estado = 'modificado-pendiente';

    const turno = await Turno.findByIdAndUpdate(req.body.id, campos);
    if (!turno) res.status(400).send('El turno no fue encontrado');

    const user = await User.findOne({ dni: turno.dni });
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    // await sendEmail(user.mail,'OhMyDog - Modificación de turno',
    //     'Uno de tus turnos fue modificado por la veterinaria, por favor, revisa en tus turnos.'
    // );

    res.redirect('/'); // TODO Mostrar mensaje con confirmación de modificación 
  })

  .get('/aceptar-turno', async (req, res) => { // TODO testear todos los de turnos 
    modificarEstado(req.body.turno.id, 'aceptado');

    const user = await User.findOne({ dni: req.body.turno.dni });
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    // await sendEmail(user.mail,'OhMyDog - Aceptación de turno',
    //     'Tu turno fue aceptado!'
    // );

    res.send('Turno aceptado con exito y notificado al cliente.');
  })

  .get('/rechazar-turno', async (req, res) => {
    modificarEstado(req.body.turno.id, 'rechazado');

    const user = await User.findOne({ dni: req.body.turno.dni });
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    // await sendEmail(user.mail,'OhMyDog - Rechazo de turno',
    //     'Lamentablemente uno de tus turnos fue rechazado por la veterinaria, por favor, revisa en tus turnos.'
    // );

    res.send('Turno rechazado con exito y notificado al cliente.');
  })

  .get('/confirmar-asistencia', async (req, res) => {
    let turno = req.body.turno;
    await modificarEstado(turno.id, 'asistido');

    if (turno.estado != 'Vacunacion generica') return res.send('Turno marcado como asistido.');

    const perros = await User.findOne({ dni: turno.dni }).populate('perrosId')
    const perro = perros.find(perroId => perroId && perroId.toString() === perro._id.toString()); // funciona?

    const fechaDeNacimiento = moment(perro.fechaDeNacimiento).format('YYYY-MM-DD');
    const edad = moment().diff(fechaDeNacimiento, 'months');

    fechaDelTurno = moment();
    if (edad > 4) {
      fechaDelTurno = moment(fechaDelTurno).add(1, 'years');
    } else {
      fechaDelTurno = moment(fechaDelTurno).add(21, 'days');
    }
    //la fecha llega a modificarse antes de que se cree el turno? 

    turno = new Turno(_.pick(turno, ['nombreDelPerro', 'rangoHorario', 'dni', 'motivo', 'estado', fechaDelTurno.toDate()]));
    await turno.save();

    const user = await User.findOne({ dni: turno.dni });
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    // await sendEmail(user.mail,'OhMyDog - Asignación de nuevo turno',
    //     'Se asignó un nuevo turno automáticamente para la próxima vacunación, por favor, revisa en tus turnos.'
    // );

    res.send('Se confirmó la asistencia, nuevo turno asignado con exito y notificado al cliente.');
  })

  .post('/eliminar-usuario', async (req, res) => {
    try {
      // Obtener el usuario que deseas eliminar
      const usuario = await User.findOne({ mail: req.body.dato });
      if (!usuario) {
        return res.status(400).send('User not registered.');
      }

      // Recopilar los IDs de los perros y turnos asociados al usuario
      const idPerros = usuario.perrosId.map(perro => ObjectId(perro));
      const idTurnos = usuario.turnosId.map(turno => ObjectId(turno));

      // Eliminar los perros asociados al usuario
      await Perro.deleteMany({ _id: { $in: idPerros.map(id => new ObjectId(id)) } });
      // Eliminar los turnos asociados al usuario
      await Turno.deleteMany({ _id: { $in: idTurnos } });

      // Eliminar el usuario
      await User.deleteOne({ mail: req.body.dato });
      //console.log('Usuario y sus perros/turnos eliminados exitosamente');
      res.send('El usuario se elimino exitosamente');
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })

  .post('/listar-perros', async (req, res) => {
    const usuario = await User.findOne({ mail: req.body.dato })
      .populate('perrosId')
    const perros = usuario.perrosId;
    res.render('listaPerros', { perros, admin: true })
  })

  .post('/eliminar-perro', async (req, res) => {
    try {
      const usuario = await User.findOne({ mail: req.body.mail });
      console.log(req.body);
      console.log(usuario);
      const index = usuario.perrosId.indexOf(req.body.id);
      if (index !== -1) {
        usuario.perrosId.splice(index, 1); // Elimina 1 elemento en el índice especificado
      }
      await usuario.save();
      // Obtener el perro a eliminar
      const perro = await Perro.findByIdAndDelete(req.body.id);
      if (!perro) {
        return res.status(400).send('El perro no estaba en el sistema.');
      }
      //console.log('Usuario y sus perros/turnos eliminados exitosamente');

      res.send('Eliminacion del perro confirmada.');
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })


  .get('/historial-turnos', async (req, res) => {
    try {
      let turnos = await Turno.find({});
      if (turnos.length === 0) {
        res.render('historialTurnosAdmin', { error: 'La lista esta vacia' })
      }
      else {
        turnos.sort(compararFechas);
        res.render('historialTurnosAdmin', { turnos: turnos });
      }
    } catch (error) {
      console.log('Error al obtener los turnos:', error);
      return res.status(400).send('Error al obtener los turnos');
    }
  })

  .post('/eliminar-turno', async (req, res) => {
    try {
      let turno = await Turno.findById(req.body.id);
      const usuario = await User.findOne({ dni: turno.dni });
      console.log(turno);
      if (!(usuario === null)) {
        const index = usuario.turnosId.indexOf(turno.id);
        if (index !== -1) {
          usuario.turnosId.splice(index, 1); // Elimina 1 elemento en el índice especificado
        }
        await usuario.save();
      }

      // Obtener el perro a eliminar
      turno = await Turno.findByIdAndDelete(turno.id);
      if (!turno) {
        return res.status(400).send('El turno no estaba en el sistema.');
      }
      //console.log('Usuario y sus perros/turnos eliminados exitosamente');

      res.send('Eliminacion del turno confirmada.');
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })



  //Por alguna razon , esta funcion tiene que estar abajo de todo, sino te tira error.  




  .post('/listar-perros', async (req, res) => {
    const usuario = await User.findOne({ mail: req.body.dato })
      .populate('perrosId')
    const perros = usuario.perrosId;
    let mail = usuario.mail;
    res.render('listaPerros', { perros, admin: true, mail })
  })

function compararFechas(a, b) {

  const fechaA = new Date(a.fecha);
  const fechaB = new Date(b.fecha);
  return fechaA - fechaB;

}
module.exports = router;