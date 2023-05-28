const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const turnoSchema = new mongoose.Schema({
    id:{
        type: ObjectId
    },
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