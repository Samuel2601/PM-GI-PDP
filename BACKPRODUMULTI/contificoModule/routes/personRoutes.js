// routes/personRoutes.js
const express = require("express");
const router = express.Router();
const personService = require("../services/personService");
const { auth } = require("../../middlewares/authenticate");
const {
  loadInstitutionConfig,
} = require("../../middlewares/institutionConfig.js");

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
    // Obtener personas desde el servicio
    const persons = await personService.getPersons(req);
    // Responder con los datos sanitizados
    res.json(persons);
  })
);

router.get(
  "/cedula/:cedula",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { cedula } = req.params;
    const persons = await personService.getPersonsCedula(req, cedula);
    res.json(persons);
  })
);

// Obtener una persona por ID
router.get(
  "/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const person = await personService.getPersonById(req, id);

    if (!person) {
      return res.status(404).json({ message: "Persona no encontrada." });
    }

    res.json(person);
  })
);

// Crear una nueva persona
router.post(
  "/",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    console.log("CREANDO PERSONA", req.institutionConfig);
    const personData = req.body;
    const newPerson = await personService.createPerson(req, personData);
    res.status(201).json(newPerson);
  })
);

// Actualizar una persona existente
router.put(
  "/:id",
  auth,
  loadInstitutionConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const personData = req.body;

    const updatedPerson = await personService.updatePerson(req, id, personData);

    if (!updatedPerson) {
      return res.status(404).json({ message: "Persona no encontrada." });
    }

    res.json(updatedPerson);
  })
);

module.exports = router;
