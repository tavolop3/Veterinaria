const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const servicioScheme = new mongoose.Schema({
    nombre:{
        type: String
    },
    apellido:{
        type: String
    },
    tipoServicio:{
        type: String
    },
    zona:{
        type: String
    },
    disponibilidadHoraria:{
        type: String
    },
    mail:{
        type: String
    }
})

const Servicio = mongoose.model('Servicio', servicioScheme);

exports.Servicio = Servicio;