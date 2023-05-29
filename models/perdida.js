const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const perdidaScheme = new mongoose.Scheme({
    nombre:{
        type: String
    },
    sexo:{
        type: String
    },
    foto:{
        type: String
    },
    raza:{
        type: String
    },
    color:{
        type: String
    },
    mail:{
        type: String
    },
    confirmado:{
        type: Boolean
    }
})

const Perdida = mongoose.model('Perdida', perdidaScheme);