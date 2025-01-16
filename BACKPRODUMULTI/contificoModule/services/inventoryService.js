// services/inventoryService.js

const { makeRequest } = require("../helpers/requests.helper");

// Category endpoints
const getCategories = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/categoria/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching categories: ${error.response?.data || error.message}`
    );
  }
};

const getCategoryById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/categoria/${id}/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching category with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Warehouse (Bodega) endpoints
const getWarehouses = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/bodega/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching warehouses: ${error.response?.data || error.message}`
    );
  }
};

const getWarehouseById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/bodega/${id}/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching warehouse with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Variant endpoints
const getVariants = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/variante/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching variants: ${error.response?.data || error.message}`
    );
  }
};

const getVariantById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/variante/${id}/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching variant with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Product endpoints
const getProducts = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/producto/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching products: ${error.response?.data || error.message}`
    );
  }
};

const getProductById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/producto/${id}/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching product with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

const createProduct = async (req, productData) => {
  try {
    return await makeRequest(req, {
      path: "/producto/",
      method: "post",
      data: productData,
    });
  } catch (error) {
    throw new Error(
      `Error creating product: ${error.response?.data || error.message}`
    );
  }
};

const updateProduct = async (req, id, productData) => {
  try {
    return await makeRequest(req, {
      path: `/producto/${id}/`,
      method: "patch",
      data: productData,
    });
  } catch (error) {
    throw new Error(
      `Error updating product with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

const getProductStock = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/producto/${id}/stock/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching stock for product ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Inventory Movement endpoints
const getInventoryMovements = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/movimiento-inventario/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching inventory movements: ${
        error.response?.data || error.message
      }`
    );
  }
};

const getInventoryMovementById = async (req, id) => {
  try {
    return await makeRequest(req, {
      path: `/movimiento-inventario/${id}/`,
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching inventory movement with ID ${id}: ${
        error.response?.data || error.message
      }`
    );
  }
};

const createInventoryMovement = async (req, movementData) => {
  try {
    return await makeRequest(req, {
      path: "/movimiento-inventario/",
      method: "post",
      data: movementData,
    });
  } catch (error) {
    throw new Error(
      `Error creating inventory movement: ${
        error.response?.data || error.message
      }`
    );
  }
};

// Shipping Guide endpoints
const getShippingGuides = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/inventario/guia/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching shipping guides: ${error.response?.data || error.message}`
    );
  }
};

const createShippingGuide = async (req, guideData) => {
  try {
    return await makeRequest(req, {
      path: "/inventario/guia/",
      method: "post",
      data: guideData,
    });
  } catch (error) {
    throw new Error(
      `Error creating shipping guide: ${error.response?.data || error.message}`
    );
  }
};

// Brand endpoints
const getBrands = async (req) => {
  try {
    return await makeRequest(req, {
      path: "/marca/",
      method: "get",
    });
  } catch (error) {
    throw new Error(
      `Error fetching brands: ${error.response?.data || error.message}`
    );
  }
};

module.exports = {
  // Categories
  getCategories,
  getCategoryById,

  // Warehouses
  getWarehouses,
  getWarehouseById,

  // Variants
  getVariants,
  getVariantById,

  // Products
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  getProductStock,

  // Inventory Movements
  getInventoryMovements,
  getInventoryMovementById,
  createInventoryMovement,

  // Shipping Guides
  getShippingGuides,
  createShippingGuide,

  // Brands
  getBrands,
};
