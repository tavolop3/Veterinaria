const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const adopcionSchema = new mongoose.Schema({
    nombre: {
        type: String
    },
    edad: {
        type: Number
    },
    sexo: {
        type: String
    },
    color: {
        type: String
    },
    tamaño: {
        type: String
    },
    origen: {
        type: String
    },
    confirmado: {
        type: Boolean
    },
    mail: {
        type: String
    }
})
const Adopcion = mongoose.model('Adopcion', adopcionSchema);

exports.Adopcion = Adopcion;