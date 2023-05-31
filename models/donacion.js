const mongoose = require('mongoose');

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