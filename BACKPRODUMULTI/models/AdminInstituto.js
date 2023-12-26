'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminInstitutoSchema = Schema({
    nombres: {type: String, required: true},
    apellidos: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    telefono: {type: String, required: true},
    dni: {type: String, required: true},
    rol: {type: String, required: true},
    estado: {type: String, required: true},
    base:{type: String, required: true},
    portada: {type: String, required: true},
});

//module.exports =  mongoose.model('admininstituto',AdminInstitutoSchema);
module.exports = AdminInstitutoSchema;
