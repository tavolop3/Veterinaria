const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const cruzaSchema = new mongoose.Schema({
    id:{
        type: ObjectId
    },
    raza:{
        type: String
    },
    sexo:{
        type: String
    },
    fechaDeCeloInicio:{
        type: Date
    },
    fechaDeCeloFin:{
        type: Date
    },
    edad:{
        type: Number
    },
    mial:{
        type: String
    }
})

const Cruza = mongoose.model('Cruza', cruzaSchema);