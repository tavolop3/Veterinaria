const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
    nombreDelPerro:{
        type: String
    },
    rangoHorario:{
        type: String
    },
    dni:{
        type: String
    },
    motivo:{
        type: String
    },
    estado:{
        type: String
    },
    fecha:{
        type: Date
    }
})

const Turno = mongoose.model('Turno', turnoSchema);

exports.Turno = Turno;