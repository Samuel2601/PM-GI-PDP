// routes/accountingRoutes.js
const express = require("express");
const router = express.Router();
const accountingService = require("../services/accountingService");
const { auth } = require("../../middlewares/authenticate");
const {
  loadInstitutionConfig,
} = require("../../middlewares/institutionConfig");

// Middleware for handling async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all cost centers
router.get(
  "/centro-costo",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const costCenters = await accountingService.getCostCenters(req);
    res.json(costCenters);
  })
);

// Get all accounting accounts
router.get(
  "/cuenta-contable",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const accounts = await accountingService.getAccountingAccounts(req);
    res.json(accounts);
  })
);

// Create a new journal entry
router.post(
  "/asiento",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const journalEntry = await accountingService.createJournalEntry(req.body);
    res.status(201).json(journalEntry);
  })
);

// Get journal entry by ID
router.get(
  "/asiento/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const journalEntry = await accountingService.getJournalEntryById(req,
      req.params.id
    );
    if (!journalEntry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    res.json(journalEntry);
  })
);

module.exports = router;

// In your main app.js or index.js:
/*
const accountingRoutes = require('./routes/accountingRoutes');
app.use('/contabilidad', accountingRoutes);
*/
