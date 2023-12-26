const fs = require('fs');

const xml2js = require('xml2js');
function gnerar_xml(pagos){
    console.log(JSON.stringify(pagos, null, 2));
    try {
        // Lee el archivo XML
        const xmlData = fs.readFileSync('./facturas/plantilla/factura_V2.1.0.xml', 'utf-8');

        // Configura el analizador de XML
        const parser = new xml2js.Parser();

        let estructura;
        // Convierte el XML a objeto
        parser.parseString(xmlData, (error, result) => {
            if (error) {
            console.error('Error al convertir XML:', error);
            } else {
                estructura=result;
            }
        });

        console.log(JSON.stringify(estructura, null, 2));


        // Crear un nuevo constructor XML
        const builder = new xml2js.Builder();

        // Convertir el objeto a XML
        const xml = builder.buildObject(estructura);

        // Guardar el XML en un archivo
        //fs.writeFileSync('objeto.xml', xml);
    } catch (error) {
        console.log(error);
    }
    

}

async function firma(pagos){    


}
async function enviarSRI(ruta){

}

module.exports = {
    firma,
    enviarSRI,
    gnerar_xml
}