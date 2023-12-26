export class TableUtil {
	static exportToPdf(name: string, imagen: string,info:any) {
		let printContentsd, printContentst, popupWin;

		popupWin = window.open('', '_blank', 'top=0,left=0,height=auto,width=auto');
		printContentsd = document.getElementById('detalle')?.innerHTML;
		printContentst = document.getElementById('titular')?.innerHTML;
		popupWin?.document.open();
		popupWin?.document.write(
			`
    <html>
      <head>
        <title> Pago de Pensión </title>

      </head>
        <body onload="window.print();window.close()">
        <div style="margin-right: auto;
       margin-left: auto;  >
           <div style="margin-top: 70px; margin-left:5% ;">
           <img _ngcontent-twf-c49="" src=` +
           imagen +
           `  alt="..." 
               class="navbar-brand-img mx-auto" style="max-height: 4rem !important;" style="">
           </div>

           <div style="margin-top: -70px ; margin-left:-10%;text-align:center;">
           <h2 style="text-align:center ;"><b >
           `+info.titulo+`</b>
           <h4 style=" text-align:center;">
           Dirección: `+info.calle1+` y `+info.calle2+`<br>

           Teléfono: `+info.telefonocon+`<br>

           Teléfono: 062712968<br>

           Año lectivo ` +
				name +
				`
           </h4>

           </h2>
           
           </div>
          <div>
          <b></b> 
          </div>
           <div style="margin-top: -150px; margin-left:80% ;">
           <img _ngcontent-twf-c49="" src="https://i.postimg.cc/ThvxfG15/nuevo-logo-Mineduc.jpg" alt="..." 
               class="navbar-brand-img mx-auto" style="max-height: 4rem !important;" style=""><br>
               <img _ngcontent-twf-c49="" src="https://i.postimg.cc/ZYBybc0J/Politics-of-Ecuador-Guillermo-Lasso-Administration-logo-svg.png" alt="..." 
               class="navbar-brand-img mx-auto" style="max-height: 4rem !important;" style="">
           </div>

           
       </div>
       
     
       <table style=" margin-top: 7%;margin-right: auto;
       margin-left: auto; width: 100%;" >
       ${printContentst}
        </table>
      <table style=" margin-top: 7%;margin-right: auto;
      margin-left: auto; width: 100%;" >
      ${printContentsd}
       </table>
            
        </body>

    </html>`
		);
		popupWin?.document.close();
	}
}
export class TableUtil2 {
	static exportToPdf(name: string, imagen: string,info:any) {
		let printContentsd, printContentst, popupWin;

		popupWin = window.open('', '_blank', 'top=0,left=0,height=auto,width=auto');
		printContentsd = document.getElementById('detallen')?.innerHTML;
		printContentst = document.getElementById('titular')?.innerHTML;
		popupWin?.document.open();
		/*popupWin.document.write(
			`
    <html>
      <head>
        <title> </title>

      </head>
        <body onload="window.print();window.close()" >
        <img _ngcontent-twf-c49="" src="https://i.postimg.cc/HnNHSQH9/Imagen1.jpg" alt="..." 
        class="navbar-brand-img mx-auto" style="max-height: 4rem !important; margin-left: auto;
        margin-right: auto;display: block; ">
        <p style="text-align:center ;">EGBF CRISTO REY </p>
        <div style="margin-right: 70%; font-family: "Times New Roman", Times, serif;" >
        

              <table style=" margin-top: 7%;margin-right: auto;
            margin-left: auto; width: 100%;" >
            ${printContentst}
            
              </table>
            <table style=" margin-top: 7%;margin-right: 60%;
            margin-left: auto; width: 100%;" >
            ${printContentsd}
            </table>
        </div>

        
            
        </body>

    </html>`
		);*/
		popupWin?.document.write(
			`
    <html>
      <head>
        <title> Pago de Pensión </title>

      </head>
        <body onload="window.print();window.close()">
        <div style="margin-right: auto;
       margin-left: auto;  >
      
       


           <div style="margin-top: -70px ; margin-left:-10%;text-align:center;">
           <img _ngcontent-twf-c49="" src=` +
           imagen +
           `  alt="..." 
        class="navbar-brand-img mx-auto" style="max-height: 4rem !important; margin-left: auto;
        margin-right: auto;display: block; ">
           <h2 style="text-align:center ;"><b >
           `+info.titulo+`</b>
           <h4 style=" text-align:center;">
           Dirección: `+info.calle1+` y `+info.calle2+`<br>

           Teléfono: `+info.telefonocon+`<br>

           Año lectivo ` +
				name +
				`
           </h4>

           </h2>
           
           </div>
          <div>
          <b></b> 
          </div>


           
       </div>
       
     
       <table style=" margin-top: 7%;margin-right: auto;
       margin-left: auto; width: 100%;" >
       ${printContentst}
        </table>
      <table style=" margin-top: 7%;margin-right: auto;
      margin-left: auto; width: 100%;" >
      ${printContentsd}
       </table>
            
        </body>

    </html>`
		);
		popupWin?.document.close();
	}
}
