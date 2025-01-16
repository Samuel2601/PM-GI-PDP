// services/accountingService.js

const { makeRequest } = require("../helpers/requests.helper");

// Cost Centers endpoints
const getCostCenters = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/contabilidad/centro-costo/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching cost centers: ${error.response?.data || error.message}`
    );
  }
};

// Accounting Account endpoints
const getAccountingAccounts = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/contabilidad/cuenta-contable/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching accounting accounts: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Journal Entry endpoints
const createJournalEntry = async (req, entryData) => {
  try {
    return await makeRequest(req, {
      path: "/contabilidad/asiento/",
      method: "post",
      data: entryData,
    });
  } catch (error) {
    throw new Error(
      `Error creating journal entry: ${error.response?.data || error.message}`
    );
  }
};

const getJournalEntryById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/contabilidad/asiento/${id}/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching journal entry with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

module.exports = {
  // Cost Centers
  getCostCenters,

  // Accounting Accounts
  getAccountingAccounts,

  // Journal Entries
  createJournalEntry,
  getJournalEntryById,
};
