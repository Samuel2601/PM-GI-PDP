const axios = require("axios");
const mongoose = require("mongoose");
const EstudianteSchema = require("../../models/Estudiante");
const InstitucionSchema = require("../../models/Institucion");
const { getDatabaseConnection } = require("./dbConnection");
const { makeRequest } = require("../helpers/requests.helper");

const crossData = async () => {
  try {
    // 1. Obtener instituciones con base y apiKey
    const dbinstitu = await getDatabaseConnection("Instituciones");
    const Institucion = dbinstitu.model("institutos", InstitucionSchema);

    const instituciones = await Institucion.find({
      base: { $exists: true },
      apiKey: { $exists: true },
    });
    console.log(`Se encontraron ${instituciones.length} instituciones`);
    // 2. Procesar cada institución
    await Promise.all(
      instituciones.map(async (institucion) => {
        try {
          const { base, apiKey } = institucion;

          if (!apiKey || !base) {
            console.log(
              `No se encontró la API o la base para la institución: ${institucion.titulo}`
            );
            return;
          }

          //3. Conectar a la base de datos específica
          const db = await getDatabaseConnection(base);
          const Estudiante = db.model("Estudiante", EstudianteSchema);
          console.log(`Procesando la base: ${base}`);
          //4.   Obtener estudiantes
          const estudiantes = await Estudiante.find({});

          if (!estudiantes.length) {
            console.log(`No se encontraron estudiantes para la base: ${base}`);
            return;
          }
          console.log(`Se encontraron ${estudiantes.length} estudiantes`);
          // 5. Consultar la API externa para obtener las personas
          const persons = await makeRequest(
            {
              institutionConfig: {
                baseURL: "https://api.contifico.com/sistema/api/v1",
                apiKey: apiKey,
              },
            },
            {
              path: "/persona/",
              method: "get",
            }
          );

          if (!persons || !persons.length) {
            console.warn(
              `No se obtuvieron datos de la API para la base: ${base}`
            );
            return;
          }
          console.log(`Se encontraron ${persons.length} personas`);
          // 6. Cruzar datos y actualizar estudiantes
          await Promise.all(
            estudiantes.map(async (estudiante) => {
              if (estudiante.id_contifico_persona) {
                console.log(
                  `Estudiante ya actualizado: ${estudiante.nombres} ${estudiante.apellidos} en la base ${base}`
                );
                return;
              }
              const match = persons.find(
                (person) =>
                  person.cedula === estudiante.dni_factura ||
                  (person.telefonos &&
                    person.telefonos.includes(estudiante.telefono))
              );

              if (match) {
                estudiante.id_contifico_persona = match.id;
                await estudiante.save();
                console.log(
                  `Estudiante actualizado: ${estudiante.nombres} ${estudiante.apellidos} en la base ${base}`
                );
              }
            })
          );
        } catch (error) {
          console.error(
            `Error procesando la institución con base: ${institucion.base} - ${error.message}`
          );
        }
      })
    );

    console.log("Cruce de datos completado.");
  } catch (error) {
    console.error("Error en el cruce de datos:", error.message);
  }
};

module.exports = { crossData };
