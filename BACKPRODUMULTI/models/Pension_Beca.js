'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pension_becaSchema = Schema({
    idpension:{type: Schema.ObjectId, ref: 'pension', required: true},
    etiqueta:  {type: String, required: true},
    titulo:{type:String, require: true},
    usado:{type:Number,default: 0, require: true},
    createdAt: {type:Date, default: Date.now, require: true}
});
//module.exports =  mongoose.model('pension_beca',Pension_becaSchema);
module.exports = Pension_becaSchema