const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const puntoUrgenciaScheme = new mongoose.Scheme({
    direccion:{
        type: String
    },
    horarios:{
        type: String
    },
    infoContacto:{
        type: String
    }
})

const PuntoUrgencia = mongoose.model('PuntoUrgencia', puntoUrgenciaScheme);