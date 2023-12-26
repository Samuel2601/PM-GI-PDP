import { Component,OnInit} from '@angular/core';
import { ConfigService } from 'src/app/service/config.service';
import { Chart } from 'chart.js/auto';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-grafic-sp',
  templateUrl: './grafic-sp.component.html',
  styleUrls: ['./grafic-sp.component.scss']
})
export class GraficSpComponent implements OnInit {
  private datase: any[]=[];
  private labels: any[]=[];

  constructor(private _configService:ConfigService) {}

  ngOnInit(): void {
    this._configService.labels$.subscribe(labels => {
      this.labels = labels;
      // Actualizar el gráfico con las nuevas etiquetas
      //this.updateChart();
    });
    this._configService.data$.subscribe(data => {
      this.datase = data;
      
      // Actualizar el gráfico con los nuevos datos
      this.updateChart();
    });
   
  }

  updateChart(){
    var canvas = <HTMLCanvasElement>document.getElementById('myChart3');
    var ctx: CanvasRenderingContext2D | any;
   
    ctx = canvas.getContext('2d');
    var existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
      var myChart3 = new Chart(ctx, {
        type: 'bar',
        data: {
        labels: this.labels,
        datasets: this.datase,
        },
        options: {
        scales: {
          y: {
          beginAtZero: true,
          },
        },
        },
      });
      //myChart3.update();
  }


 
}
