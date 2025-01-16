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
      `Error fetching persons: ${error.response?.data || error.message}`
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
      `Error fetching persons: ${error.response?.data || error.message}`
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
        error.response?.data || error.message
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
    throw new Error(
      `Error creating person: ${error.response?.data || error.message}`
    );
  }
};

const updatePerson = async (req, personData) => {
  try {
    return await makeRequest(req, {
      path: "/persona/",
      method: "put",
      data: personData,
    });
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
  getPersonsCedula,
};
