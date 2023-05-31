const mongoose = require('mongoose');

const adopcionSchema = new mongoose.Schema({
    nombre: {
        type: String
    },
    edad: {
        type: Number
    },
    sexo: {
        type: String
    },
    color: {
        type: String
    },
    tamaño: {
        type: String
    },
    origen: {
        type: String
    },
    confirmado: {
        type: Boolean,
        default: false
    },
    mail: {
        type: String
    }
})
const Adopcion = mongoose.model('Adopcion', adopcionSchema);

exports.Adopcion = Adopcion;