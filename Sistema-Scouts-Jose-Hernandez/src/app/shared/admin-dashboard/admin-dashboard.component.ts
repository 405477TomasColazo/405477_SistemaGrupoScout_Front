import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';

import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import Chart from 'chart.js/auto'
import {FormsModule} from '@angular/forms';
import { ExportService } from '../../core/services/export.service';
import { ExportButtonsComponent } from '../components/export-buttons/export-buttons.component';

interface PagoCuota {
  name: string;
  value: number;
  color: string;
}

interface MiembroSeccion {
  nombre: string;
  miembros: number;
  color: string;
}

// Interfaces para los datos históricos con firma de índice
interface HistoricoPagosCuotas {
  [key: string]: PagoCuota[];
}

interface HistoricoMiembrosSeccion {
  [key: string]: MiembroSeccion[];
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    NgIf,
    NgClass,
    NgForOf,
    FormsModule,
    DatePipe,
    ExportButtonsComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('pagosCuotasChart') pagosCuotasChartRef: ElementRef | undefined;
  @ViewChild('miembrosSeccionChart') miembrosSeccionChartRef: ElementRef | undefined;

  // Variables para alertas
  showAlert: boolean = false;
  alertType: 'success' | 'error' = 'success';
  alertText: string = '';

  // Fecha actual para mostrar en el calendario
  mesActual: string = 'Mayo 2025';
  fechaActualizacion: Date = new Date();

  // Variables para filtros
  filtroSeleccionado: string = 'total';
  anioSeleccionado: number = 2025;
  mostrarSelectorAnio: boolean = false;
  etiquetaPeriodoActual: string = 'Total acumulado';

  // Menús de gráficos
  menuGraficoAbierto: string | null = null;

  // Opciones de filtros
  periodos = [
    { nombre: 'Enero 2025', valor: '2025-01' },
    { nombre: 'Febrero 2025', valor: '2025-02' },
    { nombre: 'Marzo 2025', valor: '2025-03' },
    { nombre: 'Abril 2025', valor: '2025-04' },
    { nombre: 'Mayo 2025', valor: '2025-05' }
  ];

  filtrosRapidos = [
    { nombre: 'Este mes', valor: 'actual' },
    { nombre: 'Últimos 3 meses', valor: 'trimestre' },
    { nombre: 'Este año', valor: 'anio' }
  ];

  aniosDisponibles = [2023, 2024, 2025];

  // Datos para las tarjetas de resumen
  resumenEstadisticas = [
    {
      titulo: 'Total Miembros',
      valor: '223',
      cambio: '+12',
      icon: 'users',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      titulo: 'Ingresos Mensuales',
      valor: '$15,840',
      cambio: '+8.5%',
      icon: 'money',
      textColor: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      titulo: 'Asistencia Promedio',
      valor: '78%',
      cambio: '+5%',
      icon: 'trend',
      textColor: 'text-purple-500',
      bgColor: 'bg-purple-100'
    }
  ];

  // Datos de pago de cuotas para el gráfico
  pagosCuotasData: PagoCuota[] = [
    { name: 'Pagado', value: 75, color: '#4ade80' },
    { name: 'Pendiente', value: 25, color: '#f87171' }
  ];

  // Datos históricos de pagos por mes (para los filtros)
  pagosCuotasHistorico: HistoricoPagosCuotas = {
    'total': [
      { name: 'Pagado', value: 75, color: '#4ade80' },
      { name: 'Pendiente', value: 25, color: '#f87171' }
    ],
    'actual': [
      { name: 'Pagado', value: 80, color: '#4ade80' },
      { name: 'Pendiente', value: 20, color: '#f87171' }
    ],
    'trimestre': [
      { name: 'Pagado', value: 72, color: '#4ade80' },
      { name: 'Pendiente', value: 28, color: '#f87171' }
    ],
    'anio': [
      { name: 'Pagado', value: 68, color: '#4ade80' },
      { name: 'Pendiente', value: 32, color: '#f87171' }
    ],
    '2025-01': [
      { name: 'Pagado', value: 65, color: '#4ade80' },
      { name: 'Pendiente', value: 35, color: '#f87171' }
    ],
    '2025-02': [
      { name: 'Pagado', value: 70, color: '#4ade80' },
      { name: 'Pendiente', value: 30, color: '#f87171' }
    ],
    '2025-03': [
      { name: 'Pagado', value: 72, color: '#4ade80' },
      { name: 'Pendiente', value: 28, color: '#f87171' }
    ],
    '2025-04': [
      { name: 'Pagado', value: 78, color: '#4ade80' },
      { name: 'Pendiente', value: 22, color: '#f87171' }
    ],
    '2025-05': [
      { name: 'Pagado', value: 80, color: '#4ade80' },
      { name: 'Pendiente', value: 20, color: '#f87171' }
    ]
  };

  // Datos de miembros por sección para el gráfico
  miembrosSeccionData: MiembroSeccion[] = [
    { nombre: 'Manada', miembros: 42, color: '#f1d717' },
    { nombre: 'Scout', miembros: 65, color: '#21ff10' },
    { nombre: 'Caminante', miembros: 28, color: '#01bce4' },
    { nombre: 'Rover', miembros: 35, color: '#ff0000' }
  ];

  // Datos históricos de miembros por mes (para los filtros)
  miembrosSeccionHistorico: HistoricoMiembrosSeccion = {
    'total': [
      { nombre: 'Manada', miembros: 42, color: '#f1d717' },
      { nombre: 'Scout', miembros: 65, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 28, color: '#01bce4' },
      { nombre: 'Rover', miembros: 35, color: '#ff0000' }
    ],
    'actual': [
      { nombre: 'Manada', miembros: 45, color: '#f1d717' },
      { nombre: 'Scout', miembros: 68, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 30, color: '#01bce4' },
      { nombre: 'Rover', miembros: 38, color: '#ff0000' }
    ],
    'trimestre': [
      { nombre: 'Manada', miembros: 40, color: '#f1d717' },
      { nombre: 'Scout', miembros: 62, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 25, color: '#01bce4' },
      { nombre: 'Rover', miembros: 33, color: '#ff0000' }
    ],
    'anio': [
      { nombre: 'Manada', miembros: 38, color: '#f1d717' },
      { nombre: 'Scout', miembros: 62, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 25, color: '#01bce4' },
      { nombre: 'Rover', miembros: 33, color: '#ff0000' }
    ],
    '2025-01': [
      { nombre: 'Manada', miembros: 38, color: '#f1d717' },
      { nombre: 'Scout', miembros: 60, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 22, color: '#01bce4' },
      { nombre: 'Rover', miembros: 30, color: '#ff0000' }
    ],
    '2025-02': [
      { nombre: 'Manada', miembros: 40, color: '#f1d717' },
      { nombre: 'Scout', miembros: 62, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 24, color: '#01bce4' },
      { nombre: 'Rover', miembros: 32, color: '#ff0000' }
    ],
    '2025-03': [
      { nombre: 'Manada', miembros: 40, color: '#f1d717' },
      { nombre: 'Scout', miembros: 62, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 25, color: '#01bce4' },
      { nombre: 'Rover', miembros: 33, color: '#ff0000' }
    ],
    '2025-04': [
      { nombre: 'Manada', miembros: 42, color: '#f1d717' },
      { nombre: 'Scout', miembros: 65, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 28, color: '#01bce4' },
      { nombre: 'Rover', miembros: 35, color: '#ff0000' }
    ],
    '2025-05': [
      { nombre: 'Manada', miembros: 45, color: '#f1d717' },
      { nombre: 'Scout', miembros: 68, color: '#21ff10' },
      { nombre: 'Caminante', miembros: 30, color: '#01bce4' },
      { nombre: 'Rover', miembros: 38, color: '#ff0000' }
    ]
  };

  // Datos de eventos próximos
  eventosProximos = [
    { id: 1, titulo: 'Caminata de la Manada', fecha: '15/05/2025', hora: '09:00', lugar: 'Parque Las Heras' },
    { id: 2, titulo: 'Reunión de consejo distrital', fecha: '18/05/2025', hora: '19:30', lugar: 'Centro vecinal' },
    { id: 3, titulo: 'Mantenimiento instalaciones', fecha: '22/05/2025', hora: '08:00', lugar: 'Todas las áreas' },
    { id: 4, titulo: 'Evento fin de mes', fecha: '30/05/2025', hora: '20:00', lugar: 'Salón principal' }
  ];

  // Datos de notificaciones
  notificaciones = [
    { id: 1, tipo: 'warning', mensaje: '25 miembros con cuota vencida', tiempo: 'Hace 2 horas' },
    { id: 2, tipo: 'info', mensaje: 'Nueva solicitud de registro', tiempo: 'Hace 5 horas' },
    { id: 3, tipo: 'alert', mensaje: 'Mantenimiento programado', tiempo: 'Hace 1 día' }
  ];

  // Referencias a los gráficos
  pagosCuotasChart: Chart | undefined;
  miembrosSeccionChart: Chart | undefined;

  // Export state
  isExportingEvents = false;

  constructor(
    private ngZone: NgZone,
    private exportService: ExportService
  ) { }

  ngOnInit(): void {
    // Inicialización de datos
    this.inicializarFiltros();
  }

  ngAfterViewInit(): void {
    // Creamos los gráficos después de que los elementos DOM estén disponibles
    setTimeout(() => {
      this.ngZone.runOutsideAngular(() => {
        this.createPagosCuotasChart();
        this.createMiembrosSeccionChart();
      });
    }, 100);
  }

  // Inicializar filtros con fechas actuales
  inicializarFiltros(): void {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();

    // Inicializar el filtro al mes actual
    this.filtroSeleccionado = 'actual';
    this.anioSeleccionado = anioActual;

    // Actualizar etiqueta
    this.actualizarEtiquetaPeriodo();

    // Inicializar datos según el filtro seleccionado
    this.actualizarDatosPorFiltro();
  }

  // Método para obtener el estilo de la notificación según su tipo
  getNotificationStyle(tipo: string): string {
    switch(tipo) {
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-l-4 border-amber-500';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-l-4 border-blue-500';
      case 'alert':
        return 'bg-red-50 text-red-700 border-l-4 border-red-500';
      default:
        return 'bg-gray-50 text-gray-700 border-l-4 border-gray-500';
    }
  }

  // Métodos para filtros
  aplicarFiltro(): void {
    this.actualizarEtiquetaPeriodo();
    this.actualizarDatosPorFiltro();
    this.actualizarGraficos();
    this.cerrarMenuGrafico();
  }

  seleccionarFiltroRapido(filtro: string): void {
    this.filtroSeleccionado = filtro;
    this.aplicarFiltro();
  }

  actualizarEtiquetaPeriodo(): void {
    if (this.filtroSeleccionado === 'total') {
      this.etiquetaPeriodoActual = 'Total acumulado';
    } else if (this.filtroSeleccionado === 'actual') {
      this.etiquetaPeriodoActual = 'Mes actual';
    } else if (this.filtroSeleccionado === 'trimestre') {
      this.etiquetaPeriodoActual = 'Últimos 3 meses';
    } else if (this.filtroSeleccionado === 'anio') {
      this.etiquetaPeriodoActual = `Año ${this.anioSeleccionado}`;
    } else {
      // Para filtros de meses específicos (formato: 'YYYY-MM')
      const [anio, mes] = this.filtroSeleccionado.split('-');
      const nombreMes = this.obtenerNombreMes(parseInt(mes));
      this.etiquetaPeriodoActual = `${nombreMes} ${anio}`;
    }
  }

  obtenerNombreMes(mes: number): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1];
  }

  actualizarDatosPorFiltro(): void {
    // Actualizar datos de pagos de cuotas según el filtro
    if (this.pagosCuotasHistorico[this.filtroSeleccionado]) {
      this.pagosCuotasData = [...this.pagosCuotasHistorico[this.filtroSeleccionado]];
    }

    // Actualizar datos de miembros por sección según el filtro
    if (this.miembrosSeccionHistorico[this.filtroSeleccionado]) {
      this.miembrosSeccionData = [...this.miembrosSeccionHistorico[this.filtroSeleccionado]];
    }
  }

  actualizarGraficos(): void {
    // Actualizar gráfico de pagos de cuotas
    if (this.pagosCuotasChart) {
      this.pagosCuotasChart.data.labels = this.pagosCuotasData.map(item => item.name);
      this.pagosCuotasChart.data.datasets[0].data = this.pagosCuotasData.map(item => item.value);
      this.pagosCuotasChart.data.datasets[0].backgroundColor = this.pagosCuotasData.map(item => item.color);
      this.pagosCuotasChart.update();
    }

    // Actualizar gráfico de miembros por sección
    if (this.miembrosSeccionChart) {
      this.miembrosSeccionChart.data.labels = this.miembrosSeccionData.map(item => item.nombre);
      this.miembrosSeccionChart.data.datasets[0].data = this.miembrosSeccionData.map(item => item.miembros);
      this.miembrosSeccionChart.data.datasets[0].backgroundColor = this.miembrosSeccionData.map(item => item.color);
      this.miembrosSeccionChart.update();
    }
  }

  // Métodos para el menú de gráficos
  toggleMenuGrafico(menu: string): void {
    if (this.menuGraficoAbierto === menu) {
      this.menuGraficoAbierto = null;
    } else {
      this.menuGraficoAbierto = menu;
    }
  }

  cerrarMenuGrafico(): void {
    this.menuGraficoAbierto = null;
  }

  descargarGrafico(canvasId: string, nombreArchivo: string): void {
    const canvas = document.querySelector(`canvas[data-id="${canvasId}"]`) as HTMLCanvasElement
      || this.pagosCuotasChartRef?.nativeElement as HTMLCanvasElement;

    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nombreArchivo}_${this.etiquetaPeriodoActual.replace(/ /g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    this.cerrarMenuGrafico();
  }

  exportarDatosCSV(datos: any[], nombreArchivo: string): void {
    // Crear contenido CSV
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Encabezados
    const encabezados = Object.keys(datos[0]).join(',');
    csvContent += encabezados + '\r\n';

    // Datos
    datos.forEach(item => {
      const fila = Object.values(item).join(',');
      csvContent += fila + '\r\n';
    });

    // Descargar archivo
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${nombreArchivo}_${this.etiquetaPeriodoActual.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.cerrarMenuGrafico();
  }

  // El método resetZoom no existe en la versión de Chart.js que estás usando,
  // por lo que lo eliminamos o podemos implementar un método diferente
  resetZoomGrafico(graficoId: string): void {
    // Si en el futuro quieres implementar una función de zoom, puedes
    // usar Chart.js plugins como 'chartjs-plugin-zoom'
    this.cerrarMenuGrafico();
  }

  // Crear gráfico circular para pagos de cuotas
  private createPagosCuotasChart(): void {
    try {
      const ctx = this.pagosCuotasChartRef?.nativeElement as HTMLCanvasElement;

      if (ctx) {
        this.pagosCuotasChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: this.pagosCuotasData.map(item => item.name),
            datasets: [{
              data: this.pagosCuotasData.map(item => item.value),
              backgroundColor: this.pagosCuotasData.map(item => item.color),
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw as number;
                    return `${label}: ${value}%`;
                  }
                }
              }
            }
          }
        });

        // Asignar un data-id para poder descargar el gráfico
        ctx.setAttribute('data-id', 'pagosCuotasChart');
      }
    } catch (error) {
      console.error('Error en createPagosCuotasChart:', error);
    }
  }

  // Crear gráfico de barras para miembros por sección
  private createMiembrosSeccionChart(): void {
    try {
      const ctx = this.miembrosSeccionChartRef?.nativeElement as HTMLCanvasElement;

      if (ctx) {
        this.miembrosSeccionChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.miembrosSeccionData.map(item => item.nombre),
            datasets: [{
              label: 'Miembros Activos',
              data: this.miembrosSeccionData.map(item => item.miembros),
              backgroundColor: this.miembrosSeccionData.map(item => item.color),
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });

        // Asignar un data-id para poder descargar el gráfico
        ctx.setAttribute('data-id', 'miembrosSeccionChart');
      }
    } catch (error) {
      console.error('Error en createMiembrosSeccionChart:', error);
    }
  }

  // Método para mostrar una alerta
  showAlertMessage(type: 'success' | 'error', message: string): void {
    this.alertType = type;
    this.alertText = message;
    this.showAlert = true;

    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  // Export Methods for Events Table
  exportEventsToPDF(): void {
    if (this.eventosProximos.length === 0) return;
    this.isExportingEvents = true;
    
    try {
      const columns = [
        { key: 'titulo', header: 'Evento', type: 'text' as const },
        { key: 'fecha', header: 'Fecha', type: 'text' as const },
        { key: 'hora', header: 'Hora', type: 'text' as const },
        { key: 'lugar', header: 'Lugar', type: 'text' as const }
      ];
      
      this.exportService.exportToPDF(this.eventosProximos, columns, 'proximos-eventos', 'Próximos Eventos');
    } catch (error) {
      console.error('Error al exportar eventos a PDF:', error);
    }
    
    this.isExportingEvents = false;
  }

  exportEventsToCSV(): void {
    if (this.eventosProximos.length === 0) return;
    this.isExportingEvents = true;
    
    try {
      const columns = [
        { key: 'titulo', header: 'Evento', type: 'text' as const },
        { key: 'fecha', header: 'Fecha', type: 'text' as const },
        { key: 'hora', header: 'Hora', type: 'text' as const },
        { key: 'lugar', header: 'Lugar', type: 'text' as const }
      ];
      
      this.exportService.exportToCSV(this.eventosProximos, columns, 'proximos-eventos');
    } catch (error) {
      console.error('Error al exportar eventos a CSV:', error);
    }
    
    this.isExportingEvents = false;
  }
}
