this.fbeca = this.config[val].anio_lectivo;


function exportarcash(
  paralelo,
  pagos_estudiante,
  sumarcash,
  fbeca,
  mcash,
        
) {
  const json = [];
  let j = 1;

  pagos_estudiante.forEach((element) => {
    for (const key in element) {
      if (Object.prototype.hasOwnProperty.call(element, key)) {
        const element3 = element[key];
        element3.forEach((element2) => {
          let con = sumarcash(element2.detalle);
          if (con > 0 && element2.estado !== "Desactivado") {
            con = parseFloat(con.toFixed(2)) * 100;
            const studen = {
              Item: j,
              Ref: "CO",
              Cedula: element2.dni,
              Modena: "USD",
              Valor: con,
              Ref1: "REC",
              Ref2: "",
              Ref3: "",
              Concepto:
                "PENSION DE " +
                meses[
                  new Date(
                    new Date(fbeca).setMonth(new Date(fbeca).getMonth() + mcash)
                  )
                ].toUpperCase(),
              Ref4: "C",
              Cedula2: element2.dni,
              Alumno: element2.nombres,
            };
            if (paralelo) {
              studen.curso = element2.curso;
              studen.paralelo = element2.paralelo;
            }
            json.push(studen);
            j++;
          }
        });
      }
    }
  });
  return json;
}
