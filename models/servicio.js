const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const servicioScheme = new mongoose.Scheme({
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