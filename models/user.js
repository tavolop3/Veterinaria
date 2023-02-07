const mongoose = require('mongoose');
const Joi = require('joi');

const User = mongoose.model('User', new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
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
    }
}));

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