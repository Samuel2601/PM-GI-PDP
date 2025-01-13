const mongoose = require("mongoose");
const InstitucionSchema = require("../models/Institucion");
const { setAPIConfig } = require("../contificoModule/config/apiConfig");

// Middleware para configurar dinámicamente la institución
const loadInstitutionConfig = async (req, res, next) => {
  try {
    // Verifica si el usuario está autenticado
    if (!req.user || !req.user.base) {
      return res
        .status(400)
        .json({ message: "Usuario no asociado a ninguna institución." });
    }

    // Conexión a la base de datos correspondiente
    const conn = mongoose.connection.useDb("Instituciones");
    const Institucion = conn.model("instituto", InstitucionSchema);

    // Busca la institución del usuario
    const institution = await Institucion.findOne({ base: req.user.base });

    if (!institution) {
      return res.status(404).json({ message: "Institución no encontrada." });
    }

    // Modifica la configuración de la API según la institución
    setAPIConfig({
      BASE_URL: institution.base || "https://api.contifico.com/sistema/api/v1",
      API_KEY: institution.apiKey || process.env.CONTIFICO_API_KEY,
    });

    // Configura dinámicamente la información de la institución
    req.institutionConfig = {
      apiKey: institution.apiKey,
    };

    next();
  } catch (error) {
    console.error("Error al cargar la configuración de la institución:", error);
    res.status(500).json({
      message: "Error interno al cargar la configuración de la institución.",
    });
  }
};

module.exports = loadInstitutionConfig;
