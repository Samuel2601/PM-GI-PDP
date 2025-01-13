// routes/accountingRoutes.js
const express = require("express");
const router = express.Router();
const accountingService = require("../services/accountingService");

// Middleware for handling async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all cost centers
router.get(
  "/centro-costo",
  asyncHandler(async (req, res) => {
    const costCenters = await accountingService.getCostCenters();
    res.json(costCenters);
  })
);

// Get all accounting accounts
router.get(
  "/cuenta-contable",
  asyncHandler(async (req, res) => {
    const accounts = await accountingService.getAccountingAccounts();
    res.json(accounts);
  })
);

// Create a new journal entry
router.post(
  "/asiento",
  asyncHandler(async (req, res) => {
    const journalEntry = await accountingService.createJournalEntry(req.body);
    res.status(201).json(journalEntry);
  })
);

// Get journal entry by ID
router.get(
  "/asiento/:id",
  asyncHandler(async (req, res) => {
    const journalEntry = await accountingService.getJournalEntryById(
      req.params.id
    );
    if (!journalEntry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    res.json(journalEntry);
  })
);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error("Error in accounting routes:", error);
  res.status(500).json({
    message: "Internal server error",
    error: error.message,
  });
});

module.exports = router;

// In your main app.js or index.js:
/*
const accountingRoutes = require('./routes/accountingRoutes');
app.use('/contabilidad', accountingRoutes);
*/
