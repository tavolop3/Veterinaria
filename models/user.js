const mongoose = require('mongoose');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
    },
    apellido: {
        type: String,
    },
    dni: {
        type: String,
        unique: true,
    },
    telefono: {
        type: String,
        required: true,
    },
    mail: {
        type: String,
        unique: true,
    },
    contraseña: {
        type: String,
    },
    contraseñaDefault: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    montoDescuento: Number,
    perrosId: [{ type : ObjectId, ref: 'Perro' }],
    turnosId: [{ type : ObjectId, ref: 'Turno' }]
});

const User = mongoose.model('User', userSchema);

//actualizar, esto es para validar del lado del backend lo que te llega del front, no de la bd
function validateCreate(user) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).max(15).required(),
        apellido: Joi.string().min(3).max(15).required(),
        mail: Joi.string().min(3).max(50).required().email(),
        dni: Joi.string().min(8).max(8).required(),
        telefono: Joi.string().min(6).max(50).required()
    });
    return schema.validate(user);
}

function validateLogin(user) {
    const schema = Joi.object({
        mail: Joi.string().min(3).max(50).required().email(),
        contraseña: Joi.string().min(3).max(255).required(),
    });
    return schema.validate(user);
}

async function encriptarContraseña(contraseña) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contraseña, salt);
}

function compararContraseñas(contraseña1, contraseña2) {
    return bcrypt.compare(contraseña1, contraseña2);
}

exports.User = User;
exports.validateCreate = validateCreate;
exports.validateLogin = validateLogin;
exports.encriptarContraseña = encriptarContraseña;
exports.compararContraseñas = compararContraseñas;