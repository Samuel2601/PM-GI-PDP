// services/personService.js

const { makeRequest } = require("../helpers/requests.helper");

// Funciones principales simplificadas
const getPersons = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/persona/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching persons: ${error.response?.data || error.mensaje}`
    );
  }
};

const getPersonsCedula = async (req, cedula) => {
  try {
    const personas = await makeRequest(req, {
      path: "/persona/",
      method: "get",
    });
    return (
      personas.filter(
        (persona) => persona.cedula === cedula || persona.ruc === cedula
      )[0] || {}
    );
  } catch (error) {
    throw new Error(
      `Error fetching persons: ${error.response?.data || error.mensaje}`
    );
  }
};

const getPersonById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/persona/${id}/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching person with ID ${id}: ${
        error.response?.data || error.mensaje
      }`
    );
  }
};

const createPerson = async (req, personData) => {
  try {
    return await makeRequest(req, {
      path: "/persona/",
      method: "post",
      data: personData,
    });
  } catch (error) {
    // Reenviar el mensaje de error tal como lo envía la API
    if (error.response?.data) {
      // Lanza el error directamente con el mensaje y código de la API
      throw error.response.data;
    }
    // En caso de un error desconocido, lanza un mensaje genérico
    throw new Error(error.mensaje || "Error desconocido al crear la persona");
  }
};

const updatePerson = async (req, id, personData) => {
  try {
    return await makeRequest(
      req,
      {
        path: "/persona/",
        method: "put",
        data: personData,
      },
      id
    );
  } catch (error) {
    throw new Error(
      `Error updating person: ${error.response?.data || error.mensaje}`
    );
  }
};

module.exports = {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
  getPersonsCedula,
};
