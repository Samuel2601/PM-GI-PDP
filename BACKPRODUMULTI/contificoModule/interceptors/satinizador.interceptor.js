// Interceptor para sanitizar los datos devueltos
const sanitizer = (response) => {
  const sanitizedReq = JSON.parse(
    JSON.stringify(response, (key, value) => {
      // Excluir propiedades que puedan causar referencias circulares
      if (key === "req" || key === "res" || key === "_req" || key === "_res") {
        return undefined;
      }
      return value;
    })
  );
  return sanitizedReq;
};

module.exports = {
  sanitizer,
};
