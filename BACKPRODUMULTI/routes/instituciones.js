"use strict";

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const modelsService = require("../service/models.service");

const models = modelsService.getModels("Instituciones");
if (!models) {
  throw new Error(`No se pudieron cargar los modelos para la base ${dbName}`);
}
const { Instituto, AdminInstituto } = models;

// Ruta para obtener el tipo de escuela
router.get("/instituciones/tipo-escuela", async (req, res) => {
  try {
    const { base } = req.query;

    if (!base) {
      return res
        .status(400)
        .json({ message: "El parámetro base es requerido." });
    }

    // Buscar el administrador por base de la institución
    const admin = await AdminInstituto.findOne({ base });
    if (!admin) {
      return res.status(404).json({ message: "Administrador no encontrado." });
    }

    // Buscar la institución asociada al administrador
    const institucion = await Instituto.findOne({ idadmin: admin._id });
    if (!institucion) {
      return res.status(404).json({ message: "Institución no encontrada." });
    }

    // Devolver el tipo de escuela
    res.status(200).json({ type_school: institucion.type_school });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

router.get("/instituciones/api-key", async (req, res) => {
  try {
    const { base } = req.query;

    if (!base) {
      return res
        .status(400)
        .json({ message: "El parámetro base es requerido." });
    }

    // Buscar el administrador por base
    const admin = await AdminInstituto.findOne({ base });
    if (!admin) {
      return res.status(404).json({ message: "Administrador no encontrado." });
    }

    // Buscar la institución asociada al administrador
    const institucion = await Instituto.findOne({ idadmin: admin._id });
    if (!institucion) {
      return res.status(404).json({ message: "Institución no encontrada." });
    }

    // Devolver la clave de API
    res.status(200).json({ apiKey: institucion.apiKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

module.exports = router;
