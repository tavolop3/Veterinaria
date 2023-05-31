const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
    nombre: {
        type: String
    },
    apellido: {
        type: String
    },
    tipoServicio: {
        type: String
    },
    zona: {
        type: String
    },
    disponibilidadHoraria: {
        type: String
    },
    mail: {
        type: String
    }
})
exports.Servicio = servicioSchema;
const Servicio = mongoose.model('Servicio', servicioSchema);