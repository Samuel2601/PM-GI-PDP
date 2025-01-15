// services/personService.js
const { API_CONFIG } = require("../config/apiConfig");
const httpClient = require("./httpClient");

const getPersons = async (req) => {
  // Iniciar el cronómetro
  const startTime = process.hrtime();

  try {
    // Preparar configuración de la solicitud
    const config = {
      url: `${req.institutionConfig.base}/persona/`,
      method: "get",
      headers: {
        Authorization: req.institutionConfig.apiKey,
      },
    };

    // Imprimir la URL y los headers
    console.log("URL completa:", config.url);
    console.log("Headers de la solicitud:", config.headers);

    // Realizar la solicitud
    const response = await httpClient.request(config);

    // Calcular el tiempo transcurrido
    const endTime = process.hrtime(startTime);
    const timeInMs = endTime[0] * 1000 + endTime[1] / 1000000;
    const timeInSeconds = timeInMs / 1000;
    const timeInMinutes = timeInSeconds / 60;

    console.log(`Tiempo de respuesta:`);
    console.log(`  - Milisegundos: ${timeInMs.toFixed(2)}ms`);
    console.log(`  - Segundos: ${timeInSeconds.toFixed(2)}s`);
    console.log(`  - Minutos: ${timeInMinutes.toFixed(2)}min`);

    return response.data;
  } catch (error) {
    // También medimos el tiempo en caso de error
    const endTime = process.hrtime(startTime);
    const timeInMs = endTime[0] * 1000 + endTime[1] / 1000000;
    const timeInSeconds = timeInMs / 1000;
    const timeInMinutes = timeInSeconds / 60;

    console.log(`Tiempo hasta el error:`);
    console.log(`  - Milisegundos: ${timeInMs.toFixed(2)}ms`);
    console.log(`  - Segundos: ${timeInSeconds.toFixed(2)}s`);
    console.log(`  - Minutos: ${timeInMinutes.toFixed(2)}min`);

    console.error(
      `Error fetching persons: ${error.response?.data || error.message}`
    );
    throw new Error(
      `Error fetching persons: ${error.response?.data || error.message}`
    );
  }
};

const getPersonById = async (id) => {
  try {
    const response = await httpClient.get(`/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching person with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

const createPerson = async (personData) => {
  try {
    const response = await httpClient.post("/persona/", personData);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error creating person: ${error.response?.data || error.message}`
    );
  }
};

const updatePerson = async (personData) => {
  try {
    const response = await httpClient.put("/persona/", personData);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error updating person: ${error.response?.data || error.message}`
    );
  }
};

module.exports = {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
};
