'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PensionSchema = Schema({
    idestudiante: {type: Schema.ObjectId, ref: 'estudiante', required: true},

    matricula: {type: Number,default: 0, min: 0, max: 1, required: true},
    paga_mat: {type: Number,default: 0, min: 0, max: 1, required: true},
    meses: {type: Number, default: 0, min: 0, max: 10, required: true},
    anio_lectivo: {type: String, required: true},

    idanio_lectivo: {type: Schema.ObjectId, ref: 'config', required: true},

    condicion_beca:{type:String, default:'No',require:true},
    desc_beca:{type: Number, min: 0, max: 100, required: false},
    val_beca:{type:Number, required: false},
    num_mes_beca:{type:Number, required: false},
    num_mes_res:{type:Number, required: false},
    
    curso:{type:String,require:true},
    paralelo:{type:String,require:true},

    extrapagos:{type:String,require:false},
    
    createdAt: {type:Date, default: Date.now, require: true}
});

//module.exports =  mongoose.model('pension',PensionSchema);
module.exports=PensionSchema