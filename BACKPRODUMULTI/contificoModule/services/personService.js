// services/personService.js
const httpClient = require('./httpClient');

// Person endpoints
const getPersons = async () => {
  try {
    const response = await httpClient.get('/persona/');
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching persons: ${error.response?.data || error.message}`);
  }
};

const getPersonById = async (id) => {
  try {
    const response = await httpClient.get(`/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching person with ID ${id}: ${error.response?.data || error.message}`);
  }
};

const createPerson = async (personData) => {
  try {
    const response = await httpClient.post('/persona/', personData);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating person: ${error.response?.data || error.message}`);
  }
};

const updatePerson = async (personData) => {
  try {
    const response = await httpClient.put('/persona/', personData);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating person: ${error.response?.data || error.message}`);
  }
};

module.exports = {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
};