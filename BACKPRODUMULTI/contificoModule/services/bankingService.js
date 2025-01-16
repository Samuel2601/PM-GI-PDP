// services/bankingService.js

const { makeRequest } = require("../helpers/requests.helper");

// Bank Accounts endpoints
const getBankAccounts = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/banco/cuenta/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching bank accounts: ${error.response?.data || error.message}`
    );
  }
};

// Bank Movements endpoints
const getBankMovements = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/banco/movimiento/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching bank movements: ${error.response?.data || error.message}`
    );
  }
};

module.exports = {
  getBankAccounts,
  getBankMovements,
};
