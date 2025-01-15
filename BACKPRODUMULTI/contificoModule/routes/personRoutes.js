// routes/personRoutes.js
const express = require("express");
const router = express.Router();
const personService = require("../services/personService");
const { auth } = require("../../middlewares/authenticate");
const {
  loadInstitutionConfig,
} = require("../../middlewares/institutionConfig");

// Middleware para manejar errores asíncronos
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Obtener todas las personas
router.get(
  "/",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    try {
      // Obtener personas desde el servicio
      const persons = await personService.getPersons(req);

      // Eliminar referencias circulares antes de enviar la respuesta
      const sanitizedPersons = JSON.parse(JSON.stringify(persons, (key, value) => {
        // Excluir propiedades que puedan causar referencias circulares
        if (key === 'req' || key === 'res' || key === '_req' || key === '_res') {
          return undefined;
        }
        return value;
      }));

      // Responder con los datos sanitizados
      res.json(sanitizedPersons);
    } catch (error) {
      console.error("Error en getPersons:", error);
      res.status(500).json({ message: "Error al obtener las personas." });
    }
  })
);

// Obtener una persona por ID
router.get(
  "/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const person = await personService.getPersonById(id);
    res.json(person);
  })
);

// Crear una nueva persona
router.post(
  "/",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const personData = req.body;
    const newPerson = await personService.createPerson(personData);
    res.status(201).json(newPerson);
  })
);

// Actualizar una persona existente
router.put(
  "/",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const personData = req.body;
    const updatedPerson = await personService.updatePerson(personData);
    res.json(updatedPerson);
  })
);

// Middleware para manejo de errores
router.use((error, req, res, next) => {
  console.error("Error en las rutas de personas:", error);
  res.status(500).json({
    message: "Error interno del servidor",
    error: error.message,
  });
});

module.exports = router;
