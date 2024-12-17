"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var DocumentoSchema = Schema({
  documento: { type: String, required: true, unique: true },
  cuenta: { type: String, required: true },
  valor: { type: Number, required: true },
  contenido: { type: String, required: true },
  f_deposito: { type: String, required: true },
  npagos: { type: Number, default: 0, required: true },
  createdAt: { type: Date, default: Date.now, require: true },
});

//module.exports =  mongoose.model('document',DocumentoSchema);
module.exports = DocumentoSchema;
