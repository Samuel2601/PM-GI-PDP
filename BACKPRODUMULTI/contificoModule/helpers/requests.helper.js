const { sanitizer } = require("../interceptors/satinizador.interceptor.js");
const { logTimeElapsed } = require("../loggers/timer.logger.js");
const httpClient = require("../services/httpClient.js");
// Helper function para manejar las requests HTTP
const makeRequest = async (req, { path, method, data = null }, id) => {
  const startTime = process.hrtime();

  try {
    // Agregar el token a la URL si el método no es GET
    let url = `${req.institutionConfig.baseURL}${path}${
      method !== "get" ? `?pos=${req.institutionConfig.apitoken}` : ""
    }`;
    if (id) {
      url = `${url}/${id}`;
    }
    const config = {
      url,
      method,
      headers: {
        Authorization: req.institutionConfig.apiKey,
      },
      ...(data && { data }),
    };

    console.log("URL completa:", config.url);
    console.log("Method:", config.method);
    console.log("Headers de la solicitud:", config.headers);

    const response = await httpClient.request(config);
    logTimeElapsed(startTime, "de respuesta");

    return sanitizer(response.data);
  } catch (error) {
    logTimeElapsed(startTime, "hasta el error");
    console.error(
      `Error en la operación: ${error.response?.data || error.message}`
    );
    throw error;
  }
};

module.exports = {
  makeRequest,
};
