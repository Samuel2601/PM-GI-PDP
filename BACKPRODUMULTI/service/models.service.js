// models-service.js
"use strict";

const mongoose = require("mongoose");
const ConfigSchema = require("../models/Config");
const DocumentoSchema = require("../models/Documento");
const DpagoSchema = require("../models/Dpago");
const EstudianteSchema = require("../models/Estudiante");
const VentaSchema = require("../models/Pago");
const PensionSchema = require("../models/Pension");
const Pension_becaSchema = require("../models/Pension_Beca");
const RegistroSchema = require("../models/Registro");
const AdminSchema = require("../models/Admin");
const InstitucionSchema = require("../models/Institucion");
const AdminInstitutoSchema = require("../models/AdminInstituto");

// Importar todos los esquemas

// Caché global para almacenar modelos por base de datos
const modelsCache = {};

// Lista de bases de datos que comparten estos esquemas
const databasesList = [
  "CRISTOREY",
  "Sample",
  "MADRESALVADOR",
  "NUEVOECUADOR",
  "ESTRELLAMAR",
  "DANIELCOMBONI",
];

/**
 * Inicializa los modelos para una base de datos específica
 * @param {string} dbName - Nombre de la base de datos
 * @returns {Object} Objeto con los modelos inicializados
 */
function initModelsForDatabase(dbName) {
  try {
    let models = {};
    if (!modelsCache["Instituciones"] || dbName === "Instituciones") {
      const conn = mongoose.connection.useDb("Instituciones");
      const Institucion = conn.model("Instituto", InstitucionSchema);
      const AdminInstituto = mongoose.model(
        "AdminInstituto",
        AdminInstitutoSchema
      );
      /*modelsCache["Instituciones"] = {
        
        lastUsed: Date.now(),
      };*/
      models = {
        Instituto: Institucion,
        AdminInstituto: AdminInstituto,
      };
      return models;
    }

    const conn = mongoose.connection.useDb(dbName);

    // Definir todos los modelos para esta base de datos
    models = {
      Admin: conn.model("admin", AdminSchema),
      Config: conn.model("config", ConfigSchema),
      Documento: conn.model("document", DocumentoSchema),
      Dpago: conn.model("dpago", DpagoSchema),
      Estudiante: conn.model("estudiante", EstudianteSchema),
      Pago: conn.model("pago", VentaSchema),
      Pension: conn.model("pension", PensionSchema),
      Pension_Beca: conn.model("pension_beca", Pension_becaSchema),
      Registro: conn.model("registro", RegistroSchema),
    };

    console.log(`Modelos inicializados para la base de datos: ${dbName}`);
    return models;
  } catch (error) {
    console.error(`Error al inicializar modelos para ${dbName}:`, error);
    return null;
  }
}

/**
 * Inicializa los modelos para todas las bases de datos conocidas
 */
async function initializeAllDatabases() {
  console.log("Iniciando carga de modelos para todas las bases de datos...");

  for (const dbName of databasesList) {
    // Corregido: Guardar con la estructura correcta
    const models = initModelsForDatabase(dbName);
    modelsCache[dbName] = {
      models: models,
      lastUsed: Date.now(),
    };
  }

  console.log("Carga de modelos completada para todas las bases de datos");

  console.log("Carga de modelos de Instituciones completada");
}

/**
 * Obtiene los modelos para una base de datos específica.
 * Si no están cargados, los inicializa.
 * @param {string} dbName - Nombre de la base de datos
 * @returns {Object} Objeto con los modelos
 */
function getModels(dbName) {
  if (!modelsCache[dbName]) {
    console.log(
      `Inicializando modelos para base de datos no precargada: ${dbName}`
    );
    const models = initModelsForDatabase(dbName);
    if (models) {
      modelsCache[dbName] = {
        models: models,
        lastUsed: Date.now(),
      };
    } else {
      return null; // Si no se pudo inicializar, retornar null
    }
  } else {
    // Actualizar el timestamp de último uso
    modelsCache[dbName].lastUsed = Date.now();
  }

  return modelsCache[dbName].models;
}

/**
 * Limpia los modelos que no se han utilizado en un tiempo específico
 */
function cleanupUnusedModels() {
  const currentTime = Date.now();
  let cleaned = 0;

  for (const dbName in modelsCache) {
    if (modelsCache[dbName]) {
      const lastUsed = modelsCache[dbName].lastUsed;
      // Si no se ha usado en la última hora (3600000 ms)
      if (currentTime - lastUsed > 3600000) {
        console.log(
          `Limpiando modelos no utilizados para ${dbName} (último uso: ${new Date(
            lastUsed
          ).toISOString()})`
        );
        delete modelsCache[dbName];
        cleaned++;
      }
    }
  }

  if (cleaned > 0) {
    console.log(`Se limpiaron modelos para ${cleaned} base(s) de datos`);
    // Solicitar recolección de basura si está disponible
    if (global.gc) {
      global.gc();
    }
  }
}

// Función para depuración - permite ver el estado actual de la caché
function getModelsCacheStatus() {
  const status = {};
  for (const dbName in modelsCache) {
    status[dbName] = {
      initialized: !!modelsCache[dbName].models,
      lastUsed: new Date(modelsCache[dbName].lastUsed).toISOString(),
    };
  }
  return status;
}

module.exports = {
  initializeAllDatabases,
  getModels,
  cleanupUnusedModels,
  getModelsCacheStatus, // Añadido para depuración
};
