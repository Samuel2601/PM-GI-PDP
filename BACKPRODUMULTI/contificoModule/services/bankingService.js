// services/bankingService.js
const httpClient = require('./httpClient');

// Bank Accounts endpoints
const getBankAccounts = async () => {
  try {
    const response = await httpClient.get('/banco/cuenta/');
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching bank accounts: ${error.response?.data || error.message}`);
  }
};

// Bank Movements endpoints
const getBankMovements = async () => {
  try {
    const response = await httpClient.get('/banco/movimiento/');
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching bank movements: ${error.response?.data || error.message}`);
  }
};

module.exports = {
  getBankAccounts,
  getBankMovements,
};