'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProveedorSchema = Schema({
    nombre: {type: String, required: true},
    apellido: {type: String, required: true},
    ruc: {type: String, required: true},
    email: {type: String, required: true},
    direccion: {type: String, required: true},
    telefono: {type: String, required: false},    
    estado:{type: String, default:'Activo', required: false}, 
    createdAt: {type:Date, default: Date.now, require: true}
});

//module.exports =  mongoose.model('estudiante',EstudianteSchema);
module.exports=ProveedorSchema;