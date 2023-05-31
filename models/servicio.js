const mongoose = require('mongoose');

const servicioScheme = new mongoose.Scheme({
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
exports.Servicio = Servicio;
const Servicio = mongoose.model('Servicio', servicioScheme);