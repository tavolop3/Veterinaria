const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
    nombreDelPerro: {
        type: String
    },
    rangoHorario: {
        type: String
    },
    dni: {
        type: String
    },
    motivo: {
        type: String
    },
    estado: {
        type: String
    },
    fecha: {
        type: Date
    }
})

const Turno = mongoose.model('Turno', turnoSchema);

async function modificarEstado(id,estado) {
    await Turno.findByIdAndUpdate(id,{ estado });
}

exports.Turno = Turno;
exports.modificarEstado = modificarEstado;