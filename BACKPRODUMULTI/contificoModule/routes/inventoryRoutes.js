// routes/inventoryRoutes.js
const express = require("express");
const inventoryService = require("../services/inventoryService");

const router = express.Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await inventoryService.getCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/categories/:id", async (req, res) => {
  try {
    const category = await inventoryService.getCategoryById(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
