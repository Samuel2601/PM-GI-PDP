// config/apiConfig.js
let API_CONFIG = {
  BASE_URL:
    process.env.CONTIFICO_API_URL || "https://api.contifico.com/sistema/api/v1",
  API_KEY: process.env.CONTIFICO_API_KEY, // Valor por defecto
};

// Permite actualizar la configuración dinámicamente
const setAPIConfig = (newConfig) => {
  API_CONFIG = { ...API_CONFIG, ...newConfig };
};

// Exporta la configuración y el método para modificarla
module.exports = { API_CONFIG, setAPIConfig };
