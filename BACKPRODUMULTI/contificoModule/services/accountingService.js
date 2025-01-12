// services/accountingService.js
const httpClient = require("./httpClient");

// Cost Centers endpoints
const getCostCenters = async () => {
  try {
    const response = await httpClient.get("/contabilidad/centro-costo/");
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching cost centers: ${error.response?.data || error.message}`
    );
  }
};

// Accounting Account endpoints
const getAccountingAccounts = async () => {
  try {
    const response = await httpClient.get("/contabilidad/cuenta-contable/");
    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching accounting accounts: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Journal Entry endpoints
const createJournalEntry = async (entryData) => {
  try {
    const response = await httpClient.post("/contabilidad/asiento/", entryData);
    return response.data;
  } catch (error) {
    throw new Error(
      `Error creating journal entry: ${error.response?.data || error.message}`
    );
  }
};

const getJournalEntryById = async (id) => {
  try {
    const response = await httpClient.get(`/contabilidad/asiento/${id}/`);
    return response.data;
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
