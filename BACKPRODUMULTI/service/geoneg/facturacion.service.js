// services/facturacion.service.js

const modelsService = require("../models.service");

class FacturacionService {
  // Método principal para generar factura con nuevo proveedor
  async generarDocumentoNuevoProveedor(pago, detalles, dbName) {
    try {
      // Calcular subtotal y total
      const subtotal = Number(
        detalles.reduce((sum, det) => sum + det.valor, 0).toFixed(2)
      );
      const fechas = this.generarFechas(detalles[0]);
      return {
        codigoComprobante: "FACT",
        idProveedor: 0,
        Ingreso: true,
        porcentajeDescuentoFacturacion: 0,
        valorFacturaLetras: this.numeroALetras(subtotal),
        Comprobante: this.crearComprobante(pago, subtotal),
        ComprobanteProducto: this.mapearDetallesProductos(detalles, fechas),
        PagosCXC: await this.mapearPagos(pago, detalles, dbName),
        Sesion: await this.crearDatosSesion(dbName),
      };
    } catch (error) {
      console.error("Error al armar documento para nuevo proveedor:", error);
      throw new Error("Error al armar documento para nuevo proveedor");
    }
  }

  generarFechas(detalle) {
    const fecha = [];

    for (let j = 0; j < 10; j++) {
      fecha.push({
        date: new Date(detalle.idpension.idanio_lectivo.anio_lectivo).setMonth(
          new Date(detalle.idpension.idanio_lectivo.anio_lectivo).getMonth() + j
        ),
      });
    }
    return fecha;
  }

  // Crear objeto Comprobante
  crearComprobante(pago, subtotal) {
    return {
      GeneroEmpresa: true,
      Identificacion: pago.estudiante.dni_factura,
      NumeroComprobante: 0,
      MontoPagosGeneral: 0,
      CodigoTipoPago: "0",
      SaldoComprobante: subtotal,
      CodigoBanco: "0",
      NumeroCuenta: "0",
      NumeroDocumento: "0",
      Observaciones: "",
      NumeroCuotas: 1,
      ValorXCuota: subtotal,
      DiaPago: 1,
      FechaVcto: this.formatearFechaYYYYMMDD(new Date()),
      PieSubtotal: subtotal,
      PieDescuento: 0,
      PieValorDescuento: 0,
      PieBaseIva0: subtotal,
      PieBaseIVA: 0,
      PieIVA: 0,
      PieTotalVenta: subtotal,
      FechaAfiliacion: this.formatearFechaYYYYMMDD(new Date()),
      FechaVigencia: this.formatearFechaYYYYMMDD(new Date()),
      IdEmpresaCorporativa: 0,
      ValorInscripcionOriginal: 0,
      ValorInscripcion: 0,
      MontoLetras: this.numeroALetras(subtotal),
      Fecha: this.formatearFechaYYYYMMDD(new Date()),
      FormaCobroDoc: "0",
      RegistraCheque: false,
      IncluyeRetencion: "N",
      NombreCliente: pago.estudiante.nombres_factura,
      DireccionCliente: pago.estudiante.direccion,
      TelefonoCliente: pago.estudiante.telefono,
      MailCliente: pago.estudiante.email_padre,
      IdComprobanteRef: 0,
      Observacion: `Estudiante: ${pago.estudiante.nombres} ${pago.estudiante.apellidos}`,
      LiberaGuias: "N",
      IdCentralCostos: 0,
      tipoComprobante: "FACT",
      Referencia1: "0",
      Referencia2: "0",
      CodigoCuentaCajaBanco: "0",
      Operacion: "",
      IdComprobante: 0,
      CodigoAsiento: 0,
      PorcentajeDescuentoFacturacion: 0,
      IdReferencia: 0,
      FechaCheque: this.formatearFechaYYYYMMDD(new Date()),
      AplicaCredito: "N",
      IdCuota: 0,
      DocumentoConDiferido: "N",
      IdCentralCostoOrigen: 0,
      IdCentralCostoDestino: 0,
      CodigoVendedor: "0",
      MotivoTraslado: "0",
      IdProveedor: 0,
      Referencia3: "",
      Moneda: "USD",
      Plazo: 30,
      IdPais: 0,
      TipoSolicitud: "N",
      SecuencialPagoMasivo: 0,
      CodigoProcesoInicio: "0",
      CodigoProcesoActual: "0",
      IdCentralCostosMPrima: 0,
      Responsable: pago.encargado
        ? `${pago.encargado.nombres} ${pago.encargado.apellidos}`
        : "RESPONSABLE",
      IdGeneral: 0,
    };
  }

  // Mapear los detalles a productos
  mapearDetallesProductos(detalles, fechas) {
    return detalles.map((detalle, index) => {
      const codigoProducto =
        detalle.tipo === 0
          ? "13"
          : String(new Date(fechas[detalle.tipo - 1].date).getMonth() + 1);

      return {
        IdComprobante: index + 1,
        id: "0",
        newPrice: detalle.valor,
        CodigoProducto: codigoProducto,
        Nombre: this.obtenerDescripcionProducto(detalle, fechas),
        Costo: 0,
        CodigoPrecioVenta: "FINAL",
        PrecioMasImpuestos: detalle.valor,
        PrecioDescuentoImpuesto: 0,
        PorcImpuestos: 0,
        cartCount: 1,
        PrecioSistema: detalle.valor,
        PrecioDescuento: 0,
        PrecioVenta: detalle.valor,
        Total: detalle.valor,
        PorcImpuestoIVA: 0,
        ImpuestoIVA0: true,
        ValorImpuestoIVA: 0,
        CodigoGeneral: "0",
        Parametro1: "",
        Parametro2: "",
        BaseImpuestoIVA0: detalle.valor,
        BaseImpuestoIVA: 0,
        Series: "",
        PorcDescuento: 0,
        IdCentralCostos: 0,
        UltimoPrecioCliente: 0,
        CodigoPrecio: "FINAL",
        IDENTITYCAMPO: 0,
        UnidadFuncional: "UN",
        UnidadVenta: "UN",
        UnidadFraccionNo: 0,
        EsSeries: true,
        IdPuntoVentaDetalle: 0,
        NombreAlmacen: "",
        Parametro3: "",
        Parametro4: codigoProducto,
        IdComprobanteDetalleRef: 0,
        IdPuntoVenta: 2237,
        Descuento: 0,
      };
    });
  }

  // Mapear los pagos con manejo de índices
  async mapearPagos(pago, detalles, dbName) {
    // Primero agrupamos los pagos por número de documento
    const pagosMap = new Map();

    detalles.forEach((detalle) => {
      if (detalle.documento) {
        const docKey = detalle.documento.documento || "SIN_DOCUMENTO";

        if (!pagosMap.has(docKey)) {
          pagosMap.set(docKey, {
            Identificacion: pago.estudiante.dni_factura,
            IdSaldosComprobante: "0",
            Fecha: this.formatearFechaYYYYMMDD(
              new Date(detalle.documento.fecha || new Date())
            ),
            MontoPagosGeneral: detalle.valor.toString(),
            CodigoTipoPago:
              detalle.documento.cuenta === "Efectivo"
                ? "EFECTIVO"
                : "TRANSFERENCIA",
            CodigoBanco: "0",
            NumeroCuenta: "0",
            NumeroDocumento: docKey,
            Observaciones: `PAGO ${this.obtenerDescripcionCortaProducto(
              detalle
            )}`,
            MontoLetras: "",
            RegistraCheque: false,
            IncluyeRetencion: "N",
            CodigoCuentaCajaBanco: "0",
            IdReferencia: "0",
            IdSecuencial: "0",
            IdCabeceraAsiento: "0",
            FechaCheque: "1900-00-00",
            IdCuota: "0",
            DocumentoConDiferido: "N",
            IDENTITYCAMPO: "0",
            SecuencialPagoMasivo: "0",
            ModalidadPago: "0",
            IdCabeceraPagoLote: "0",
            // Añadimos estos campos para el control de índices
            id: detalle.documento._id,
            valor_origen: detalle.documento.valor_origen || 0,
          });
        } else {
          // Si ya existe el pago, actualizar el monto
          const pagoExistente = pagosMap.get(docKey);
          pagoExistente.MontoPagosGeneral = (
            parseFloat(pagoExistente.MontoPagosGeneral) + detalle.valor
          ).toFixed(2);
        }
      }
    });

    // Procesamos cada pago para verificar discrepancias y aplicar índices
    const pagosArray = await Promise.all(
      Array.from(pagosMap.values()).map(async (documento_pago) => {
        // Comprobar si hay discrepancia entre valor_origen y monto acumulado
        if (
          documento_pago.valor_origen > 0 &&
          parseFloat(documento_pago.MontoPagosGeneral) !==
            documento_pago.valor_origen
        ) {
          // Obtener cuántas veces se ha asignado este documento
          const asignaciones = await this.obtenerAsignacionesDocumento(
            pago._id,
            documento_pago.id,
            dbName
          );

          // Siempre añadir un índice cuando hay discrepancia
          // Si hay asignaciones previas, usar ese número, si no, comenzar con 1
          const indice = asignaciones > 0 ? asignaciones : 1;
          documento_pago.NumeroDocumento = `${documento_pago.NumeroDocumento}-${
            indice + 1
          }`;
        }

        // Eliminar propiedades temporales antes de devolver
        const { id, valor_origen, ...pagoFinal } = documento_pago;
        return pagoFinal;
      })
    );

    return pagosArray;
  }

  // Método para consultar asignaciones de documento (implementar según tu estructura)
  async obtenerAsignacionesDocumento(idPago, idDocumento, dbName) {
    try {
      const models = modelsService.getModels(dbName);

      if (!models) {
        console.error(
          `No se pudieron cargar los modelos para la base ${dbName}`
        );
        return 0;
      }

      const { Dpago } = models;

      // Buscar todos los detalles de pago que tienen este documento
      const detalles = await Dpago.find({ documento: idDocumento });

      // Extraer los IDs de pago únicos, excluyendo el pago actual
      const pagosUnicos = new Set();
      detalles.forEach((detalle) => {
        if (detalle.pago && detalle.pago.toString() !== idPago.toString()) {
          pagosUnicos.add(detalle.pago.toString());
        }
      });

      // Devolver la cantidad de pagos únicos (excluyendo el actual)
      return pagosUnicos.size;
    } catch (error) {
      console.error("Error al obtener asignaciones del documento:", error);
      return 0;
    }
  }

  // Archivo: sesionService.js

  configuracionesSesion = {
    311505: {
      IdInstitucion: 311505,
      IdOficina: 335006,
      CodigoEmpresa: "0891792143001",
      IdPerfilUsuario: 0,
      Identificacion: "0891792143001",
      CodigoPerfil: "0",
      IdUsuario: 3271,
      IdEmpresaOperadora: 1655,
    },
    316598: {
      IdInstitucion: 316598,
      IdOficina: 340206,
      CodigoEmpresa: "0891723830001",
      IdPerfilUsuario: 0,
      Identificacion: "0891723830001",
      CodigoPerfil: "0",
      IdUsuario: 3292,
      IdEmpresaOperadora: 1659,
    },
    // Puedes seguir agregando más configuraciones aquí
  };

  async crearDatosSesion(dbName) {
    const institucion = await Instituto.findOne({ base: dbName });
    if (!institucion) {
      throw new Error("Institución no encontrada");
    }

    const configBase = configuracionesSesion[institucion.apiKey];
    if (!configBase) {
      throw new Error(
        `Configuración de sesión no definida para apiKey ${institucion.apiKey}`
      );
    }

    return {
      ...configBase,
      FechaSistema: this.formatearFechaYYYYMMDD(new Date()),
      NombreCompletoUsuario: "",
      NombreCortoUsuario: "",
      IdTransaccion: 0,
      IPEstacion: "0.00",
    };
  }

  // Obtener descripción del producto
  obtenerDescripcionProducto(detalle, fechas) {
    if (detalle.tipo === 0) {
      return "MATRICULA";
    } else if (detalle.tipo > 0 && detalle.tipo <= 12) {
      const mesesNombres = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ];
      return `PENSION ${
        mesesNombres[new Date(fechas[detalle.tipo - 1].date).getMonth()]
      }`;
    } else {
      return detalle.descripcion || "OTRO PAGO";
    }
  }

  // Obtener descripción corta del producto
  obtenerDescripcionCortaProducto(detalle) {
    if (detalle.tipo === 0) {
      return "MATRICULA";
    } else if (detalle.tipo > 0 && detalle.tipo <= 12) {
      const mesesNombres = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ];
      return mesesNombres[detalle.tipo - 1];
    } else {
      return "OTRO";
    }
  }

  // Formatear fecha en formato YYYY-MM-DD
  formatearFechaYYYYMMDD(fecha) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Convertir número a letras
  numeroALetras(numero) {
    const partes = numero.toFixed(2).split(".");
    let entero = parseInt(partes[0]);
    const decimal = parseInt(partes[1]);

    // Esta es una versión simplificada - en producción usa una librería completa
    const unidades = [
      "",
      "UNO",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];
    const especiales = [
      "DIEZ",
      "ONCE",
      "DOCE",
      "TRECE",
      "CATORCE",
      "QUINCE",
      "DIECISEIS",
      "DIECISIETE",
      "DIECIOCHO",
      "DIECINUEVE",
    ];
    const decenas = [
      "",
      "DIEZ",
      "VEINTE",
      "TREINTA",
      "CUARENTA",
      "CINCUENTA",
      "SESENTA",
      "SETENTA",
      "OCHENTA",
      "NOVENTA",
    ];
    const centenas = [
      "",
      "CIENTO",
      "DOSCIENTOS",
      "TRESCIENTOS",
      "CUATROCIENTOS",
      "QUINIENTOS",
      "SEISCIENTOS",
      "SETECIENTOS",
      "OCHOCIENTOS",
      "NOVECIENTOS",
    ];

    let resultado = "";

    if (entero === 0) {
      resultado = "CERO";
    } else {
      // Manejar centenas
      if (entero >= 100) {
        if (entero === 100) resultado = "CIEN";
        else resultado = centenas[Math.floor(entero / 100)];
        entero %= 100;
        if (entero > 0) resultado += " ";
      }

      // Manejar decenas y unidades
      if (entero >= 10 && entero <= 19) {
        resultado += especiales[entero - 10];
      } else {
        if (entero >= 20) {
          resultado += decenas[Math.floor(entero / 10)];
          entero %= 10;
          if (entero > 0) resultado += " Y ";
        }

        if (entero > 0) {
          resultado += unidades[entero];
        }
      }
    }

    // Agregar decimales
    resultado += ` COMA ${decimal < 10 ? "CERO" : ""} ${decimal}`;

    return resultado;
  }
}

module.exports = new FacturacionService();
