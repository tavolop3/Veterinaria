const mongoose = require('mongoose');

const donacionSchema = new mongoose.Schema({
    nombre:{
        type: String
    },
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

exports.Donacion = Donacion;