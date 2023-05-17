const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const perroSchema = new mongoose.Schema({
    id:{
        type: ObjectId
    },
    nombre:{
        type: String
    },
    sexo:{
        type: String
    },
    fechaDeNacimiento:{
        type: Date
    },
    raza:{
        type: String
    },
    color:{
        type: String
    },
    observaciones:{
        type: String
    },
    foto:{
        type: Buffer
    }
})

const Perro = mongoose.model('Perro', perroSchema);