const mongoose = require('mongoose');
const Joi = require('joi');
const {genreSchema} = require('./genre');

const Movie = mongoose.model('Movie', new mongoose.Schema({
    title:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    genre:{
        type: genreSchema,
        required: true
    },
    numberInStock:{
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    dailyRentalRate:{
        type: Number,
        required: true,
        min:0,
        max: 255
    }
}));

function validateMovie(movie){
    const schema = Joi.object({
        title: Joi.string().min(3).max(50).required(),
        genreId: Joi.string().required(),
        numberInStock: Joi.number().min(0).max(255).required(),
        dailyRentalRate: Joi.number().min(0).max(255).required()
    });
    return schema.validate(movie);
}

exports.Customer = Customer;
exports.validate = validateCustomer;