'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VentaSchema = Schema({
    estudiante: {type: Schema.ObjectId, ref: 'estudiante', required: true},
    
    nombres_factura: {type: String, required: false},
    dni_factura: {type: String, required: false},

    total_pagar: {type: Number, require: true},
    transaccion: {type: String, require: true},
    tipo_tarifa:{type: Number, default:0, required: true},
    tipo_producto:{type: String, default:'S', required: true},
    tipo_documento:{type: String, default:'34', required: true},
    encargado:{type: Schema.ObjectId, ref: 'admin', required: true},
    estado: {type: String, require: true},
    nota: {type: String, require: false},
    
    anio_lectivo:{type: String, required: false},
    createdAt: {type:Date, default: Date.now, require: true}
});

//module.exports =  mongoose.model('pago',VentaSchema);
module.exports=VentaSchema;