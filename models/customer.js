const mongoose = require('mongoose');
const Joi = require('joi');

const Customer = mongoose.model('Customer', new mongoose.Schema({
    isGold:{
        type: Boolean,
        default: false
    },
    name:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    phone:{
        type: String,
        min:3,
        max:15
    }
}));

function validateCustomer(customer){
    const schema = Joi.object({
        name: Joi.string().min(3).max(15).required(),
        phone: Joi.string().min(3).max(15),
        isGold: Joi.boolean()
    });
    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;