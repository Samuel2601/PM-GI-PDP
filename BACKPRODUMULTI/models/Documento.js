"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const DocumentoSchema = new Schema({
  documento: { type: String, required: true, unique: true },
  cuenta: { type: String, required: true },
  valor: { type: Number, required: true },
  valor_origen: { type: Number }, // Se establece en el middleware
  contenido: { type: String, required: false, default: "" },
  f_deposito: { type: String, required: true },
  npagos: { type: Number, default: 0, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

// Middleware para establecer valor_origen al crear el documento
DocumentoSchema.pre("save", function (next) {
  if (this.isNew && this.valor !== undefined) {
    this.valor_origen = this.valor;
  }
  next();
});

module.exports = DocumentoSchema;

//module.exports =  mongoose.model('document',DocumentoSchema);
