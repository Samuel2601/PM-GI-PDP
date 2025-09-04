const axios = require("axios");
const path = require("path");
require("dotenv").config();

// Configuración base para la API de EduOlivo
const EDUOLIVO_BASE_URL = "https://backend.eduolivo.com/api/v1";
const ACCESS_TOKEN = process.env.access_token;

/**
 * Buscar un usuario por email en EduOlivo
 * @param {string} email - Email del usuario a buscar
 * @returns {Promise<Object|null>} - Usuario encontrado o null
 */
async function buscarUsuarioEduOlivo(email) {
  try {
    const response = await axios.get(`${EDUOLIVO_BASE_URL}/users`, {
      params: {
        pageSize: 10,
        page: 1,
        search: email,
      },
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    // Buscar el usuario exacto en los resultados
    const usuarios = response.data.data || response.data;
    if (Array.isArray(usuarios)) {
      const usuarioEncontrado = usuarios.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );
      return usuarioEncontrado || null;
    }

    return null;
  } catch (error) {
    console.error(
      `Error al buscar usuario ${email} en EduOlivo:`,
      error.message
    );
    return null;
  }
}

/**
 * Cambiar el estado de un usuario en EduOlivo
 * @param {string} userId - ID del usuario
 * @param {boolean} activo - Estado activo (true/false)
 * @returns {Promise<Object|null>} - Usuario actualizado o null
 */
async function cambiarEstadoUsuarioEduOlivo(userId, activo) {
  try {
    const response = await axios.put(
      `${EDUOLIVO_BASE_URL}/users/${userId}`,
      {
        active: activo,
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      `Usuario ${userId} ${activo ? "activado" : "desactivado"} en EduOlivo`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error al cambiar estado del usuario ${userId} en EduOlivo:`,
      error.message
    );
    return null;
  }
}

/**
 * Cambiar estado masivo de usuarios en EduOlivo
 * @param {Array<string>} userEmails - Array de emails de usuarios
 * @param {boolean} activo - Estado activo (true/false)
 * @returns {Promise<Array>} - Resultado de las operaciones
 */
async function cambiarEstadoMasivoEduOlivo(userEmails, activo) {
  const resultados = [];

  for (const email of userEmails) {
    try {
      // Buscar el usuario por email
      const usuario = await buscarUsuarioEduOlivo(email);

      if (usuario && usuario.id) {
        // Cambiar el estado del usuario
        const usuarioActualizado = await cambiarEstadoUsuarioEduOlivo(
          usuario.id,
          activo
        );

        if (usuarioActualizado) {
          resultados.push({
            email: email,
            id: usuario.id,
            activo: activo,
            exitoso: true,
            mensaje: `Usuario ${
              activo ? "activado" : "desactivado"
            } correctamente`,
          });
        } else {
          resultados.push({
            email: email,
            id: usuario.id,
            activo: activo,
            exitoso: false,
            mensaje: "Error al actualizar el estado del usuario",
          });
        }
      } else {
        resultados.push({
          email: email,
          id: null,
          activo: activo,
          exitoso: false,
          mensaje: "Usuario no encontrado en EduOlivo",
        });
      }

      // Pequeña pausa para evitar sobrecargar la API
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      resultados.push({
        email: email,
        id: null,
        activo: activo,
        exitoso: false,
        mensaje: `Error: ${error.message}`,
      });
    }
  }

  return resultados;
}

/**
 * Controlador principal para cambiar estado en EduOlivo
 * Esta función se puede llamar junto con cambiarEstadoGoogle
 */
const cambiarEstadoEduOlivo = async function (req, res) {
  if (req.user) {
    let data = req.body;
    try {
      if (data.array && data.estado !== undefined) {
        // Convertir el estado de Google (suspended) al formato de EduOlivo (active)
        // Si suspended = true, entonces active = false
        const estadoActivo = !data.estado;

        const usuarios = await cambiarEstadoMasivoEduOlivo(
          data.array,
          estadoActivo
        );

        res.status(200).send({
          usuarios: usuarios,
          mensaje: `Operación completada en EduOlivo`,
        });
      } else {
        res.status(400).send({
          mensaje: "Datos incompletos",
          array: data.array,
          estado: data.estado,
        });
      }
    } catch (error) {
      console.error("Error en cambiarEstadoEduOlivo:", error);
      res.status(500).send({
        error: error.message,
        mensaje: "Error interno del servidor",
      });
    }
  } else {
    res.status(403).send({ mensaje: "NoAccess" });
  }
};

/**
 * Controlador para consultar estado de un usuario en EduOlivo
 */
const consultarEstadoEduOlivo = async function (req, res) {
  if (req.user) {
    var email = req.params["email"];
    console.log("Consultando usuario:", email);

    try {
      if (email) {
        const usuario = await buscarUsuarioEduOlivo(email);

        if (usuario) {
          res.status(200).send({
            usuario: usuario,
            mensaje: "Usuario encontrado",
          });
        } else {
          res.status(404).send({
            mensaje: "Usuario no encontrado en EduOlivo",
          });
        }
      } else {
        res.status(400).send({
          mensaje: "Email no proporcionado",
        });
      }
    } catch (error) {
      console.error("Error en consultarEstadoEduOlivo:", error);
      res.status(500).send({
        error: error.message,
        mensaje: "Error interno del servidor",
      });
    }
  } else {
    res.status(403).send({ mensaje: "NoAccess" });
  }
};

module.exports = {
  cambiarEstadoEduOlivo,
  consultarEstadoEduOlivo,
  cambiarEstadoMasivoEduOlivo,
  buscarUsuarioEduOlivo,
  cambiarEstadoUsuarioEduOlivo,
};
