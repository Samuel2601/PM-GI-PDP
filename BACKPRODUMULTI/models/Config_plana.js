'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ParaleloSchema = new Schema({
    nombre: { type: String, required: true }
    // Otros campos relacionados con el curso, según sea necesario
});


// Subdocumento para representar información sobre los cursos
var CursoSchema = new Schema({
    nombre: { type: String, required: true },
    paralelos: [ParaleloSchema],
    // Otros campos relacionados con el curso, según sea necesario
});

// Subdocumento para representar información sobre los módulos únicos
var ModuloUnicoSchema = new Schema({
    nombre: { type: String, required: true },
    // Otros campos relacionados con el módulo único, según sea necesario
});

// Subdocumento para representar la información de conexión con otros sistemas
var ConexionSistemasSchema = new Schema({
    url: { type: String, required: true },
    // Otros campos de conexión, según sea necesario
});

// Subdocumento para representar la configuración del servicio SMTP
var ConfigSMTPSchema = new Schema({
    correo: { type: String, required: true },
    token: { type: String, required: true },
    // Otros campos de configuración SMTP, según sea necesario
});

// Subdocumento para representar la configuración del encabezado y pie de página
var ConfigEncabezadoPieSchema = new Schema({
    encabezado: { type: String },
    piePagina: { type: String },
    // Otros campos relacionados con la configuración del encabezado y pie de página, según sea necesario
});

var ConfigPSchema = Schema({
    cursos: [CursoSchema],  // Lista de cursos
    modulosUnicos: [ModuloUnicoSchema],  // Lista de módulos únicos sin paralelos
    conexionSistemas: ConexionSistemasSchema,  // Información de conexión con otros sistemas
    configSMTP: ConfigSMTPSchema,  // Configuración del servicio SMTP
    configEncabezadoPie: ConfigEncabezadoPieSchema,  // Configuración del encabezado y pie de página
    createdAt: { type: Date, default: Date.now, require: true }
});

module.exports = ConfigPSchema;
