'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = Schema({
   // idadmin: {type: Schema.ObjectId, ref: 'admininstituto', required: true},
    nombres: {type: String, required: true},
    apellidos: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    telefono: {type: String, required: true},
    dni: {type: String, required: true},
    rol: {type: String, required: true},
    estado: {type: String, required: true},
    portada: {type: String, required: true},
    base:{type: String, required: true},
});

//module.exports =  mongoose.model('admin',AdminSchema);
module.exports = AdminSchema;