const mongoose = require('mongoose');

const cruzaSchema = new mongoose.Schema({
    raza: {
        type: String
    },
    sexo: {
        type: String
    },
    fechaDeCeloInicio: {
        type: Date
    },
    fechaDeCeloFin: {
        type: Date
    },
    edad: {
        type: Number
    },
    mail: {
        type: String
    }
})

const Cruza = mongoose.model('Cruza', cruzaSchema);

exports.Cruza = Cruza;