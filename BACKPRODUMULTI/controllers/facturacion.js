const fs = require('fs');
const forge = require('node-forge');
const { PKCS12 } = require('crypto');
const SignedXml = require('xml-crypto').SignedXml;
const xmlbuilder = require('xmlbuilder');

const Dsig = require('pkcs12-xml');
const estructuraFactura = {
    factura: {
        _id: "comprobante",
        _version: "1.0.0",
        infoTributaria: {
            ambiente: null,
            tipoEmision:null,
            razonSocial: null,
            nombreComercial: null,
            ruc: null,
            claveAcceso: null,
            codDoc: null,
            estab: null,
            ptoEmi: null,
            secuencial: null,
            dirMatriz: null,
        },
        infoFactura: {
            fechaEmision: null,
            dirEstablecimiento: null,
            contribuyenteEspecial: null,
            obligadoContabilidad: null,
            tipoIdentificacionComprador: null,
            guiaRemision: null,
            razonSocialComprador: null,
            identificacionComprador: null,
            direccionComprador: null,
            totalSinImpuestos: null,
            totalDescuento: null,
            totalConImpuestos: {
                totalImpuesto: [
                    {
                        codigo: 2,
                        codigoPorcentaje: 2,
                        baseImponible: null,
                        valor: null,
                    },
                    {
                        codigo: 3,
                        codigoPorcentaje: 3072,
                        baseImponible: null,
                        valor: null,
                    },
                    {
                        codigo: 5,
                        codigoPorcentaje: 5001,
                        baseImponible: null,
                        valor: null,
                    }
                ]
            },
            propina: null,
            importeTotal: null,
            moneda: null,
        },
        detalles: {
            detalle: [
                {
                    codigoPrincipal: null, // opcional
                    codigoAuxiliar: null, // obligatorio cuando corresponda
                    descripcion: null,
                    cantidad: null,
                    precioUnitario: null,
                    descuento: null,
                    precioTotalSinImpuesto: null,
                    detallesAdicionales: {
                        detAdicional: [
                            {
                                _nombre: "",
                                _valor: ""
                            }
                        ]
                    },
                    impuestos: {
                        impuesto: [
                            {
                                codigo: 2,
                                codigoPorcentaje: 2,
                                tarifa: 12,
                                baseImponible: null,
                                valor: null
                            },
                            {
                                codigo: 3,
                                codigoPorcentaje: 3072,
                                tarifa: 5,
                                baseImponible: null,
                                valor: null
                            },
                            {
                                codigo: 5,
                                codigoPorcentaje: 5001,
                                tarifa: 0.02,
                                baseImponible: null,
                                valor: null
                            }
                        ]
                    }
                }
            ]
        },
        infoAdicional: {
            campoAdicional: [
                {
                    _nombre: "Codigo Impuesto ISD",
                    __text: 4580
                },
                {
                    _nombre: "Impuesto ISD",
                    __text: "15.42x"
                }
            ]
        }
    }
};

function archivoXML(){
    let clave=generarClaveScceso();
    //console.log(ca);
    let xml=xmlbuilder.create(estructuraFactura).end({ pretty: true });
    return {xml,clave};
}
function generarClaveScceso(){
    // Generar la clave de acceso
    const infoTributaria = estructuraFactura.factura.infoTributaria;
    const infoFactura = estructuraFactura.factura.infoFactura;

    const fechaEmision = infoFactura.fechaEmision;
    const fechaEmisionFormateada = fechaEmision.replace(/\//g, ''); // Eliminar los separadores "/"

    const tipoComprobante = infoTributaria.codDoc;
    const ruc = infoTributaria.ruc;
    const tipoAmbiente = infoTributaria.ambiente;
    const serie = infoTributaria.estab;
    const numeroComprobante = infoTributaria.ptoEmi + infoTributaria.secuencial;
    const codigoNumerico = "12345678"; // Reemplazar con el valor real
    const tipoEmision = infoTributaria.tipoEmision;
    // Armar la clave de acceso
    const claveAcceso = `${fechaEmisionFormateada}${tipoComprobante}${ruc}${tipoAmbiente}${serie}${numeroComprobante}${codigoNumerico}${tipoEmision}`;
    const digitoVerificador = calcularDigitoVerificador(claveAcceso);

    // Asignar la clave de acceso al objeto estructuraFactura
    estructuraFactura.factura.infoTributaria.claveAcceso = `${claveAcceso}${digitoVerificador}`;
    return claveAcceso;
}
// Calcular el dígito verificador (módulo 11)
function calcularDigitoVerificador(claveAcceso) {
    const pesos = [7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < claveAcceso.length; i++) {
        sum += parseInt(claveAcceso[i]) * pesos[i % 6];
    }
    let modulo = sum % 11;
    let digitoVerificador = modulo === 0 ? 0 : 11 - modulo;
    return digitoVerificador === 10 ? 1 : digitoVerificador;
}

function cargarArchivoFirma(xml,ruta, password) {
    console.log(ruta);
    let result;
    try {
        var dsig = new Dsig(ruta);
        dsig.openSession(password);
        //console.log(xml);
        console.log('........................................');
        result = dsig.computeSignature(xml);
        console.log(result); 
        console.log('........................................');   
        dsig.closeSession();    
    } catch(err) {
        console.log("ERROR FIRMA:",err);
    } finally {
        
        return result;
    }
}





module.exports={
    archivoXML,
    cargarArchivoFirma,
    estructuraFactura
}
//const xml = xmlbuilder.create(estructuraFactura).end({ pretty: true });
//console.log(xml);




