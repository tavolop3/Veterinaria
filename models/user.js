const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    lastName:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    dni:{
        type: String,
        required: true,
        minlength: 8,
        maxlength: 8
    },
    phone:{
        type: String,
        required: true,
        minlength: 6,
        maxlength: 50
    },
    email:{
        type: String,
        unique: true,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    password:{
        type: String,
        required: true,
        min:3,
        max:255
    },
    isAdmin: Boolean,
    montoDescuento: Number,
    perrosId: [ObjectId]
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model('User', userSchema);

//actualizar, esto es para validar del lado del backend lo que te llega del front, no de la bd
function validateUser(user){
    const schema = Joi.object({
        name: Joi.string().min(3).max(15).required(),
        email: Joi.string().min(3).max(50).required().email(),
        password: Joi.string().min(3).max(255).required()
    });
    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;