const express = require('express');
const router = express.Router();
var crypto = require("crypto");
const { User, validateCreate, encriptarContraseña } = require('../models/user');
const { Perro } = require('../models/perro')
const { Servicio } = require('../models/servicio')
const { Turno, modificarEstado } = require('../models/turno')
const _ = require('lodash');
const { sendEmail } = require('../emails');
const { ObjectId } = require('mongoose').Types;
const moment = require('moment');
const { Donacion } = require('../models/donacion');

router.post('/registrar-usuario', async (req, res) => {
  // const { error } = validateCreate(req.body);  Ya no valida porque no está especificado en las hu las microvalidaciones
  // if (error) return res.status(400).render('registro-usuario', { error });

  let user = await User.findOne({ mail: req.body.mail });
  if (user) return res.status(400).render('registro-usuario', { error: 'El mail ya está en uso.' });
  console.log(req.body);
  user = await User.findOne({ dni: req.body.dni });
  if (user) return res.status(400).render('registro-usuario', { error: 'El dni ya está registrado.' });

  user = new User(_.pick(req.body, ['nombre', 'apellido', 'mail', 'telefono', 'dni']));

  const contraRandom = crypto.randomBytes(8).toString('hex');
  // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
  await sendEmail(user.mail, 'OhMyDog - Contraseña predefinida',
    'Bienvenido a OhMyDog, tu cuenta fue creada con exito. Tu contraseña para el primer ingreso va a ser ' + contraRandom + ' es importante que la cambies ni bien accedas por motivos de seguridad, gracias.'
  );
  console.log('Contraseña generada:' + contraRandom);
  user.contraseña = await encriptarContraseña(contraRandom);
  user.contraseñaDefault = user.contraseña;
  await user.save();

  res.send('<script>alert("Se registró al usuario."); window.location.href = "/";</script>');
})

  .post('/modificar-usuario', async (req, res) => {
    const { dato, mail, nombre, apellido, dni, telefono } = req.body;
    let user = await User.findOne({ mail: dato });
    if (!user) return res.status(400).send('No se encontro el usuario');
    let usuarioConMailRegistrado = await User.findOne({ mail: mail });
    if (usuarioConMailRegistrado) {
      if (usuarioConMailRegistrado.mail !== user.mail) return res.status(400).send('<script>alert("Ya hay un usuario con el mail asignado."); window.location.href = "/admin";</script>');
    }
    let usuarioConDNIRegistrado = await User.findOne({ dni: dni });
    if (usuarioConDNIRegistrado) {
      if (usuarioConDNIRegistrado.dni !== user.dni) return res.status(400).send('<script>alert("Ya hay un usuario con el dni asignado."); window.location.href = "/admin";</script>');
    }
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
      return res.send('<script>alert("La modificación se realizó correctamente."); window.location.href = "/admin";</script>');
    } catch (error) {
      return res.send('<script>alert("El usuario no se pudo modificar."); window.location.href = "/admin";</script>');
    }
  })

  .post('/modificar-perro', async (req, res) => {
    const { id, mailUsuario, nombre, sexo, fecha, raza, color, observaciones, foto } = req.body;
    let usuario = await User.findOne({ mail: mailUsuario }).populate('perrosId')
    let perros = usuario.perrosId;
    if (perros.filter(perro => perro.nombre === nombre && perro.id != id).length !== 0) {
      return res.status(400).send('<script>alert("El usuario ya tiene un perro con ese nombre."); window.location.href = "/";</script>');
    }
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
      return res.send('<script>alert("La modificación se realizó correctamente."); window.location.href = "/";</script>');
    } catch (error) {
      return res.send('<script>alert("La modificación no pudo realizarse."); window.location.href = "/";</script>');
    }
  })

//route for user list
router.get('/listar-usuarios', async (req, res) => {
  try {
    let users = await User.find({ isAdmin: false });
    const lista = users.map(usuario => ({ dni: usuario.dni, mail: usuario.mail, nombre: usuario.nombre, apellido: usuario.apellido, telefono: usuario.telefono }))
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
    let perro = new Perro(_.pick(req.body, ['nombre', 'sexo', 'fechaDeNacimiento', 'raza', 'color', 'observaciones', 'foto', 'mail']));
    //const { error } = validateCreatePerro(perro);
    //if (error) return res.status(400).render('registro-perro', { error });
    console.log(req.body.mail, req.body);
    let user = await User.findOne({ mail: req.body.mail }).populate('perrosId');
    if (!user) {
      return res.status(400).send('<script>alert("El usuario no se encuentra registrado."); window.location.href = "/admin";</script>');
    }
    console.log(user);
    perro = new Perro(_.pick(req.body, ['nombre', 'sexo', 'fechaDeNacimiento', 'raza', 'color', 'observaciones', 'foto', 'mail']));
    perro.userId = user._id;
    console.log(perro);
    const perros = user.perrosId; // Array de perros del usuario
    console.log(perros);
    let perroEncontrado = perros.find(perroId => perroId && perroId.nombre === perro.nombre);
    if (!perroEncontrado) {
      console.log('El perro no se encuentra en la lista del usuario');
      user.perrosId.push(perro._id);
      await user.save();
    } else {
      return res.status(400).send('<script>alert("El perro ya esta en la lista del usuario."); window.location.href = "/admin/";</script>');
    }
    await perro.save();
    return res.status(400).send('<script>alert("Perro registrado exitosamente."); window.location.href = "/admin";</script>');
  } catch (error) {
    console.log('Error al registrar el perro:', error);
    return res.status(500).send('Internal Server Error');
  }
})

  /*  permite visualizar al administrador
      los turnos asignados para el dia
  */
  .get('/turnos-diarios', async (req, res) => {
    try {
      let todosLosTurnos = await Turno.find({});
      let turnos = todosLosTurnos.filter(turno => esHoy(turno.fecha));
      res.render('historialTurnosAdmin', { turnos })
    } catch (error) {
      console.log('Error al obtener los turnos:', error);
      return res.status(400).send('Error al obtener los turnos');
    }
  })

  .post('/mostrar-modificar-turno', (req, res) => {
    res.render('modificar-turno', { id: req.body.id });
  })

  .post('/modificar-turno', async (req, res) => {
    var campos = ['rangoHorario', 'fecha', 'estado'];
    campos = _.pickBy(_.pick(req.body, campos), _.identity)
    campos.estado = 'modificado-pendiente';

    const turno = await Turno.findByIdAndUpdate(req.body.id, campos);
    if (!turno) res.status(400).send('El turno no fue encontrado');

    const user = await User.findOne({ dni: turno.dni });
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    await sendEmail(user.mail, 'OhMyDog - Modificación de turno',
      'Tu turno con fecha ' + moment(turno.fecha).add(1, 'days').format('DD/MM/YYYY') + ' fue modificado por la veterinaria, por favor, revisa en tus turnos.'
    );

    res.send('<script>alert("La modificación se realizó correctamente y se informó via mail al cliente."); window.location.href = "/admin/historial-turnos";</script>');
  })

  .post('/aceptar-turno', async (req, res) => {
    let turno = await modificarEstado(req.body.id, 'aceptado');

    const user = await User.findOne({ dni: turno.dni });
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    await sendEmail(user.mail, 'OhMyDog - Aceptación de turno',
      'Tu turno de la fecha ' + moment(turno.fecha).add(1, 'days').format('DD/MM/YYYY') + ' fue aceptado!'
    );

    res.send('<script>alert("Turno aceptado con exito y notificado al cliente via mail."); window.location.href = "/admin/historial-turnos";</script>');
  })

  .post('/rechazar-turno', async (req, res) => {
    let turno = await modificarEstado(req.body.id, 'rechazado');

    const user = await User.findOne({ dni: turno.dni });
    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    await sendEmail(user.mail, 'OhMyDog - Rechazo de turno',
      'Lamentablemente uno de tu turnos del ' + moment(turno.fecha).add(1, 'days').format('DD/MM/YYYY') + ' fue rechazado por la veterinaria, por favor, revisa en tus turnos.'
    );

    res.send('<script>alert("Turno rechazado con exito y notificado al cliente via mail."); window.location.href = "/admin/historial-turnos";</script>');
  })

  .post('/confirmar-asistencia', async (req, res) => {
    let turno = await modificarEstado(req.body.id, 'asistido');

    if (turno.motivo != 'Vacunacion generica' && turno.motivo != 'Vacunacion antirrabica') return res.send('<script>alert("Turno marcado como asistido."); window.location.href = "/admin/historial-turnos";</script>');

    const user = await User.findOne({ dni: turno.dni }).populate('perrosId');
    user.turnosId.push(turno._id);
    await user.save();

    const perros = user.perrosId;
    const perroEncontrado = perros.find(perro => perro && perro.nombre === turno.nombreDelPerro);

    const fechaDeNacimiento = moment(perroEncontrado.fechaDeNacimiento).format('YYYY-MM-DD');
    const edad = moment().diff(fechaDeNacimiento, 'months');

    fechaDelTurno = moment();
    if (edad > 4) {
      fechaDelTurno = moment(fechaDelTurno).add(1, 'years').toDate();
    } else {
      fechaDelTurno = moment(fechaDelTurno).add(21, 'days').toDate();
    }

    const camposTurno = _.pick(turno, ['nombreDelPerro', 'rangoHorario', 'dni', 'motivo']);
    camposTurno.estado = 'pendiente';
    camposTurno.fecha = fechaDelTurno;
    turno = new Turno(camposTurno);
    await turno.save();

    // Activar para testear un par de veces o en demo para no gastar la cuota de mails (son 100)
    await sendEmail(user.mail, 'OhMyDog - Asignación de nuevo turno',
      'Se asignó un nuevo turno automáticamente para la próxima vacunación para la fecha ' + moment(turno.fecha).add(1, 'days').format('DD/MM/YYYY') + ', por favor, revisa en tus turnos.'
    );

    res.send('<script>alert("Se confirmó la asistencia, nuevo turno asignado con exito y notificado al cliente."); window.location.href = "/admin/historial-turnos";</script>');
  })

  .post('/eliminar-usuario', async (req, res) => {
    try {
      // Obtener el usuario que deseas eliminar
      const usuario = await User.findOne({ mail: req.body.dato });
      if (!usuario) {
        return res.status(400).send('<script>alert("El usuario no se encuentra registrado."); window.location.href = "/admin/listar-usuarios";</script>');
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
      return res.status(400).send('<script>alert("El usuario se elimino exitosamente."); window.location.href = "/admin/listar-usuarios";</script>');
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })

  .post('/listar-perros', async (req, res) => {
    let mailUsuario = req.body.dato
    console.log(mailUsuario);
    const usuario = await User.findOne({ mail: req.body.dato })
      .populate('perrosId')
    const perros = usuario.perrosId;
    res.render('listaPerros', { perros, mailUsuario, admin: true })
  })

  .post('/eliminar-perro', async (req, res) => {
    try {
      const usuario = await User.findOne({ mail: req.body.mail });
      console.log(usuario);
      const index = usuario.perrosId.indexOf(req.body.id);
      if (index !== -1) {
        usuario.perrosId.splice(index, 1); // Elimina 1 elemento en el índice especificado
      }
      console.log(usuario);
      await usuario.save();
      // Obtener el perro a eliminar
      const perro = await Perro.findByIdAndDelete(req.body.id);
      if (!perro) {
        return res.status(400).send('<script>alert("El perro no estaba en el sistema."); window.location.href = "/admin";</script>');
      }
      //console.log('Usuario y sus perros/turnos eliminados exitosamente');
      return res.status(400).send('<script>alert("La baja del perro fue exitosa."); window.location.href = "/admin";</script>');
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })


  .get('/historial-turnos', async (req, res) => {
    try {
      let turnos = await Turno.find({});
      if (turnos.length === 0) {
        res.render('historialTurnosAdmin', { turnos: turnos })
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


      turno = await Turno.findByIdAndDelete(turno.id);
      if (!turno) {
        return res.status(400).send('El turno no estaba en el sistema.');
      }


      res.send('Eliminacion del turno confirmada.');
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })



  .post('/listar-perros', async (req, res) => {
    const usuario = await User.findOne({ mail: req.body.dato })
      .populate('perrosId')
    const perros = usuario.perrosId;
    let mail = usuario.mail;
    res.render('listaPerros', { perros, admin: true, mail })
  })


  .post('/cargar-servicio', async (req, res) => {
    let nuevoServicio = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      tipoServicio: req.body.tipoServicio,
      zona: req.body.zona,
      disponibilidadHoraria: req.body.disponibilidadHoraria,
      mail: req.body.mail
    }
    let servicio = await Servicio.findOne({ mail: nuevoServicio.mail, tipoServicio: nuevoServicio.tipoServicio });
    if (servicio) return res.status(400).send('<script>alert("El mail ya se encuentra asignado"); window.location.href = "/admin";</script>');
    try {
      let servicio = new Servicio(nuevoServicio);
      await servicio.save();
      return res.send('<script>alert("La carga se realizo correctamente"); window.location.href = "/admin";</script>');
    } catch (error) {
      return res.send('<script>alert("La carga no pudo realizarse"); window.location.href = "/admin";</script>');
    }
  })

  .post('/modificar-servicio', async (req, res) => {
    const { id, nombre, apellido, tiposervicio, zona, disponibilidadHoraria, mail } = req.body;

    const servicioExistente = await Servicio.findOne({ mail: mail, tipoServicio: tiposervicio });
    const servicioModificar = await Servicio.findById(id);
    if (servicioExistente && servicioExistente._id.toString() !== servicioModificar._id.toString()) {
      return res.status(400).send('<script>alert("El mail se encuentra registrado."); window.location.href = "/admin/visualizar-tablon-servicios";</script>');
    }

    try {
      await Servicio.updateOne({ _id: id }, {
        $set: {
          nombre: nombre,
          apellido: apellido,
          tipoServicio: tiposervicio,
          zona: zona,
          disponibilidadHoraria: disponibilidadHoraria,
          mail: mail
        }
      });
      return res.send('<script>alert("La modificacion del servicio se realizo correctamente"); window.location.href = "/admin/visualizar-tablon-servicios";</script>');
    } catch (error) {
      return res.send('<script>alert("La modificacion del servicio no pudo realizarse"); window.location.href = "/admin/visualizar-tablon-servicios";</script>');
    }
  })

  .get('/visualizar-tablon-servicios', async (req, res) => {
    try {
      let servicios = await Servicio.find({});
      if (!servicios) {
        res.render('tablonServiciosAdmin', { error: 'La lista esta vacia' })
      }
      else {
        res.render('tablonServiciosAdmin', { servicios: servicios });
      }
    } catch (error) {
      console.log('Error al obtener los servicios:', error);
      return res.status(400).send('Error al obtener los servicios');
    }
  })

  .get('/ver-donaciones', async (req, res) => {
    try {
      let donaciones = await Donacion.find({});
      if (!donaciones) {
        res.render('tablonDonaciones', { error: 'Aun no hay donaciones.' })
      }
      else {
        res.render('tablonDonaciones', { donaciones: donaciones });
      }
    } catch (error) {
      console.log('Error al obtener las donaciones:', error);
      return res.status(400).send('Error al obtener los servicios');
    }
  })

  .post('/eliminar-servicio', async (req, res) => {
    try {
      let servicio = await Servicio.findByIdAndDelete(req.body.id);
      res.send('<script>alert("Eliminacion del paseador/cuidador confirmada."); window.location.href = "/admin/visualizar-tablon-servicios";</script>');
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })

  .post('/eliminar-donacion', async (req, res) => {
    try {
      let donacion = await Donacion.findByIdAndDelete(req.body.id);
      res.send('<script>alert("Eliminacion de la donacion confirmada."); window.location.href = "/admin/ver-adopciones";</script>');
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  })

  .post('/cargar-donacion', async (req, res) => {
    let nuevaDonacion = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      montoObjetivo: req.body.monto,
      montoRecaudado: 0
    }
    let donacion = await Donacion.findOne({ nombre: nuevaDonacion.nombre });
    if (donacion) return res.status(400).send('<script>alert("El nombre ya se encuentra asignado a una donacion"); window.location.href = "/admin";</script>');
    try {
      let donacion = new Donacion(nuevaDonacion);
      await donacion.save();
      return res.send('<script>alert("La carga se realizo correctamente"); window.location.href = "/admin";</script>');
    } catch (error) {
      return res.send('<script>alert("La carga no pudo realizarse"); window.location.href = "/admin";</script>');
    }
  })

  /*
    .post('/modificar-usuario', async (req, res) => {
      const { dato, mail, nombre, apellido, dni, telefono } = req.body;
      let user = await User.findOne({ mail: dato });
      if (!user) return res.status(400).send('No se encontro el usuario');
      let usuarioConMailRegistrado = await User.findOne({ mail: mail });
      if (usuarioConMailRegistrado) {
        if (usuarioConMailRegistrado.mail !== user.mail) return res.status(400).send('<script>alert("Ya hay un usuario con el mail asignado."); window.location.href = "/admin";</script>');
      }
  */

  .post('/modificar-donacion', async (req, res) => {
    const { id, nombre, montoObjetivo, montoRecaudado, descripcion } = req.body;
    //const cruzaModificar = await Cruza.findById(id);
    console.log("Pinga");
    try {
      await Donacion.updateOne({ _id: id }, {
        $set: {
          nombre: nombre,
          montoObjetivo: montoObjetivo,
          montoRecaudado: montoRecaudado,
          descripcion: descripcion,
        }
      });
      return res.send('<script>alert("La modificacion de la campaña se realizo correctamente"); window.location.href = "/admin/ver-donaciones";</script>');
    } catch (error) {
      console.log(error);
      return res.send('<script>alert("La modificacion de la campaña no pudo realizarse"); window.location.href = "/clientes/listar-cruza";</script>');
    }
  })


function compararFechas(a, b) {

  const fechaA = new Date(a.fecha);
  const fechaB = new Date(b.fecha);
  return fechaA - fechaB;
}

function esHoy(fecha1) {
  let fechaFormateada = String(fecha1.getUTCDate()).padStart(2, '0') + '-' + String(fecha1.getUTCMonth() + 1).padStart(2, '0') + '-' + fecha1.getUTCFullYear();
  let hoy = moment().format('DD-MM-YYYY');
  return (fechaFormateada == hoy)
}

module.exports = router;