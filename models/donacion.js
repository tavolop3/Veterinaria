const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const donacionScheme = new mongoose.Schema({
    montoObjetivo:{
        type: Number
    },
    montoRecaudado:{
        type: Number
    },
    descripcion:{
        type: String
    }
})

const Donacion = mongoose.model('Donacion', donacionSchema);