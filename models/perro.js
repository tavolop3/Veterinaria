const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const perroSchema = new mongoose.Schema({
    nombre: {
        type: String
    },
    sexo: {
        type: String
    },
    fechaDeNacimiento: {
        type: Date
    },
    raza: {
        type: String
    },
    color: {
        type: String
    },
    observaciones: {
        type: String
    },
    foto: {
        type: String
    }
})

const Perro = mongoose.model('Perro', perroSchema);

function validateCreatePerro(perro) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).max(15).required(),
        sexo: Joi.string().min(1).max(1).required(),
        fechaDeNacimiento: Joi.date().required(),
        raza: Joi.string().min(3).max(30).required(),
        color: Joi.string().min(3).max(20).required(),
        observaciones: Joi.string(),
        foto: Joi.string().min(3).required()
    });
    return schema.validate(perro);
}

exports.Perro = Perro;
exports.validateCreatePerro = validateCreatePerro;