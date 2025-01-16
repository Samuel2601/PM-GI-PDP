const mongoose = require("mongoose");
const InstitucionSchema = require("../models/Institucion");
const { setAPIConfig } = require("../contificoModule/config/apiConfig");

// Middleware para configurar dinámicamente la institución
exports.loadInstitutionConfig = async function (req, res, next) {
  try {
    // Elimina este console.log ya que puede causar problemas de memoria
    // console.log("loadInstitutionConfig", req);

    // Verifica el usuario y la base
    if (!req.user || !req.user.base) {
      console.log("No hay usuario o base");
      return res.status(400).json({
        message: "Usuario no asociado a ninguna institución.",
      });
    }

    // Agrega más logs para debug
    console.log("Base de usuario:", req.user.base);

    const conn = mongoose.connection.useDb("Instituciones");
    const Institucion = conn.model("instituto", InstitucionSchema);

    const institution = await Institucion.findOne({ base: req.user.base });
    console.log("Institución encontrada:", institution ? "Sí" : "No");

    if (!institution) {
      return res.status(404).json({
        message: "Institución no encontrada.",
      });
    }

    // Configura la API
    setAPIConfig({
      BASE_URL: "https://api.contifico.com/sistema/api/v1",
      API_KEY: institution.apiKey || process.env.CONTIFICO_API_KEY,
    });

    req.institutionConfig = {
      apiKey: institution.apiKey || process.env.CONTIFICO_API_KEY,
      base: "https://api.contifico.com/sistema/api/v1",
    };

    console.log("Configuración cargada exitosamente");
    next();
  } catch (error) {
    console.error("Error específico:", error.message);
    return res.status(500).json({
      message: "Error interno al cargar la configuración de la institución.",
      error: error.message,
    });
  }
};
