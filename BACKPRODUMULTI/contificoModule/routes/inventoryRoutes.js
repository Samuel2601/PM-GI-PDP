// routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const inventoryService = require("../services/inventoryService");

// Middleware for handling async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Category routes
router.get(
  "/categoria",
  asyncHandler(async (req, res) => {
    const categories = await inventoryService.getCategories();
    res.json(categories);
  })
);

router.get(
  "/categoria/:id",
  asyncHandler(async (req, res) => {
    const category = await inventoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  })
);

// Warehouse (Bodega) routes
router.get(
  "/bodega",
  asyncHandler(async (req, res) => {
    const warehouses = await inventoryService.getWarehouses();
    res.json(warehouses);
  })
);

router.get(
  "/bodega/:id",
  asyncHandler(async (req, res) => {
    const warehouse = await inventoryService.getWarehouseById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json(warehouse);
  })
);

// Variant routes
router.get(
  "/variante",
  asyncHandler(async (req, res) => {
    const variants = await inventoryService.getVariants();
    res.json(variants);
  })
);

router.get(
  "/variante/:id",
  asyncHandler(async (req, res) => {
    const variant = await inventoryService.getVariantById(req.params.id);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    res.json(variant);
  })
);

// Product routes
router.get(
  "/producto",
  asyncHandler(async (req, res) => {
    const products = await inventoryService.getProducts();
    res.json(products);
  })
);

router.get(
  "/producto/:id",
  asyncHandler(async (req, res) => {
    const product = await inventoryService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  })
);

router.post(
  "/producto",
  asyncHandler(async (req, res) => {
    const product = await inventoryService.createProduct(req.body);
    res.status(201).json(product);
  })
);

router.patch(
  "/producto/:id",
  asyncHandler(async (req, res) => {
    const product = await inventoryService.updateProduct(
      req.params.id,
      req.body
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  })
);

router.get(
  "/producto/:id/stock",
  asyncHandler(async (req, res) => {
    const stock = await inventoryService.getProductStock(req.params.id);
    if (!stock) {
      return res.status(404).json({ message: "Product stock not found" });
    }
    res.json(stock);
  })
);

// Inventory Movement routes
router.get(
  "/movimiento-inventario",
  asyncHandler(async (req, res) => {
    const movements = await inventoryService.getInventoryMovements();
    res.json(movements);
  })
);

router.get(
  "/movimiento-inventario/:id",
  asyncHandler(async (req, res) => {
    const movement = await inventoryService.getInventoryMovementById(
      req.params.id
    );
    if (!movement) {
      return res.status(404).json({ message: "Inventory movement not found" });
    }
    res.json(movement);
  })
);

router.post(
  "/movimiento-inventario",
  asyncHandler(async (req, res) => {
    const movement = await inventoryService.createInventoryMovement(req.body);
    res.status(201).json(movement);
  })
);

// Shipping Guide routes
router.get(
  "/inventario/guia",
  asyncHandler(async (req, res) => {
    const guides = await inventoryService.getShippingGuides();
    res.json(guides);
  })
);

router.post(
  "/inventario/guia",
  asyncHandler(async (req, res) => {
    const guide = await inventoryService.createShippingGuide(req.body);
    res.status(201).json(guide);
  })
);

// Brand routes
router.get(
  "/marca",
  asyncHandler(async (req, res) => {
    const brands = await inventoryService.getBrands();
    res.json(brands);
  })
);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error("Error in inventory routes:", error);
  res.status(500).json({
    message: "Internal server error",
    error: error.message,
  });
});

module.exports = router;

// In your main app.js or index.js:
/*
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/', inventoryRoutes);  // Since the paths already include their base routes
*/
