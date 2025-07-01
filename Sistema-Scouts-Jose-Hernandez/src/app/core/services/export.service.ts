import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Export data to PDF format (with dynamic import)
   * @param data Array of objects to export
   * @param columns Array of column definitions
   * @param fileName Name of the file (without extension)
   * @param title Title for the PDF document
   */
  async exportToPDF(data: any[], columns: ExportColumn[], fileName: string, title: string): Promise<void> {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-AR')}`, 14, 32);
    
    // Prepare data for the table
    const tableData = data.map(item => 
      columns.map(col => this.formatCellValue(item[col.key], col.type))
    );
    
    // Generate table
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [46, 125, 50], // Scout green color
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 },
      didDrawPage: (data) => {
        // Add page number
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, 
          doc.internal.pageSize.width - 30, 
          doc.internal.pageSize.height - 10);
      }
    });
    
    // Save the PDF
    doc.save(`${fileName}.pdf`);
  }

  /**
   * Export data to CSV format (with dynamic import)
   * @param data Array of objects to export
   * @param columns Array of column definitions
   * @param fileName Name of the file (without extension)
   */
  async exportToCSV(data: any[], columns: ExportColumn[], fileName: string): Promise<void> {
    const [{ unparse }, { saveAs }] = await Promise.all([
      import('papaparse'),
      import('file-saver')
    ]);
    
    // Prepare data for CSV
    const csvData = data.map(item => {
      const row: any = {};
      columns.forEach(col => {
        row[col.header] = this.formatCellValue(item[col.key], col.type);
      });
      return row;
    });
    
    // Convert to CSV
    const csv = unparse(csvData, {
      delimiter: ',',
      header: true
    });
    
    // Create BOM for UTF-8 to handle Spanish characters correctly
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csv;
    
    // Create and save blob
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  }

  /**
   * Export payments data to PDF (with dynamic import)
   */
  async exportPaymentsToPDF(payments: any[], isPendingFees: boolean = false): Promise<void> {
    const title = isPendingFees ? 'Cuotas Pendientes' : 'Historial de Pagos';
    const fileName = isPendingFees ? 'cuotas-pendientes' : 'historial-pagos';
    
    const columns: ExportColumn[] = isPendingFees ? [
      { key: 'description', header: 'Descripción', type: 'text' },
      { key: 'period', header: 'Período', type: 'text' },
      { key: 'dueDate', header: 'Vencimiento', type: 'date' },
      { key: 'amount', header: 'Monto', type: 'currency' }
    ] : [
      { key: 'paymentDate', header: 'Fecha', type: 'date' },
      { key: 'memberName', header: 'Miembro', type: 'text' },
      { key: 'referenceId', header: 'Referencia', type: 'text' },
      { key: 'amount', header: 'Monto', type: 'currency' },
      { key: 'status', header: 'Estado', type: 'text' }
    ];
    
    await this.exportToPDF(payments, columns, fileName, title);
  }

  /**
   * Export payments data to CSV (with dynamic import)
   */
  async exportPaymentsToCSV(payments: any[], isPendingFees: boolean = false): Promise<void> {
    const fileName = isPendingFees ? 'cuotas-pendientes' : 'historial-pagos';
    
    const columns: ExportColumn[] = isPendingFees ? [
      { key: 'description', header: 'Descripción', type: 'text' },
      { key: 'period', header: 'Período', type: 'text' },
      { key: 'dueDate', header: 'Vencimiento', type: 'date' },
      { key: 'amount', header: 'Monto', type: 'currency' }
    ] : [
      { key: 'paymentDate', header: 'Fecha', type: 'date' },
      { key: 'memberName', header: 'Miembro', type: 'text' },
      { key: 'referenceId', header: 'Referencia', type: 'text' },
      { key: 'amount', header: 'Monto', type: 'currency' },
      { key: 'status', header: 'Estado', type: 'text' }
    ];
    
    await this.exportToCSV(payments, columns, fileName);
  }

  /**
   * Export members data to PDF (with dynamic import)
   */
  async exportMembersToPDF(members: any[], title: string = 'Lista de Miembros'): Promise<void> {
    const columns: ExportColumn[] = [
      { key: 'firstName', header: 'Nombre', type: 'text' },
      { key: 'lastName', header: 'Apellido', type: 'text' },
      { key: 'dni', header: 'DNI', type: 'text' },
      { key: 'age', header: 'Edad', type: 'number' },
      { key: 'section', header: 'Sección', type: 'text' },
      { key: 'memberType', header: 'Tipo', type: 'text' }
    ];
    
    await this.exportToPDF(members, columns, 'lista-miembros', title);
  }

  /**
   * Export members data to CSV (with dynamic import)
   */
  async exportMembersToCSV(members: any[], fileName: string = 'lista-miembros'): Promise<void> {
    const columns: ExportColumn[] = [
      { key: 'firstName', header: 'Nombre', type: 'text' },
      { key: 'lastName', header: 'Apellido', type: 'text' },
      { key: 'dni', header: 'DNI', type: 'text' },
      { key: 'age', header: 'Edad', type: 'number' },
      { key: 'section', header: 'Sección', type: 'text' },
      { key: 'memberType', header: 'Tipo', type: 'text' }
    ];
    
    await this.exportToCSV(members, columns, fileName);
  }

  /**
   * Export events data to PDF (with dynamic import)
   */
  async exportEventsToPDF(events: any[], title: string = 'Lista de Eventos'): Promise<void> {
    const columns: ExportColumn[] = [
      { key: 'name', header: 'Evento', type: 'text' },
      { key: 'eventDate', header: 'Fecha', type: 'date' },
      { key: 'startTime', header: 'Hora', type: 'text' },
      { key: 'location', header: 'Ubicación', type: 'text' },
      { key: 'registrationCount', header: 'Inscriptos', type: 'number' }
    ];
    
    await this.exportToPDF(events, columns, 'lista-eventos', title);
  }

  /**
   * Export events data to CSV
   */
  exportEventsToCSV(events: any[], fileName: string = 'lista-eventos'): void {
    const columns: ExportColumn[] = [
      { key: 'name', header: 'Evento', type: 'text' },
      { key: 'eventDate', header: 'Fecha', type: 'date' },
      { key: 'startTime', header: 'Hora', type: 'text' },
      { key: 'location', header: 'Ubicación', type: 'text' },
      { key: 'registrationCount', header: 'Inscriptos', type: 'number' }
    ];
    
    this.exportToCSV(events, columns, fileName);
  }

  /**
   * Export registrations data to PDF
   */
  exportRegistrationsToPDF(registrations: any[], isInvitations: boolean = false): void {
    const title = isInvitations ? 'Invitaciones Pendientes' : 'Registros Completados';
    const fileName = isInvitations ? 'invitaciones-pendientes' : 'registros-completados';
    
    const columns: ExportColumn[] = isInvitations ? [
      { key: 'lastName', header: 'Apellido', type: 'text' },
      { key: 'email', header: 'Email', type: 'text' },
      { key: 'userType', header: 'Tipo de Usuario', type: 'text' },
      { key: 'sendDate', header: 'Fecha de Envío', type: 'date' },
      { key: 'status', header: 'Estado', type: 'text' }
    ] : [
      { key: 'firstName', header: 'Nombre', type: 'text' },
      { key: 'lastName', header: 'Apellido', type: 'text' },
      { key: 'email', header: 'Email', type: 'text' },
      { key: 'registrationDate', header: 'Fecha de Registro', type: 'date' },
      { key: 'userType', header: 'Tipo de Usuario', type: 'text' }
    ];
    
    this.exportToPDF(registrations, columns, fileName, title);
  }

  /**
   * Export registrations data to CSV
   */
  exportRegistrationsToCSV(registrations: any[], isInvitations: boolean = false): void {
    const fileName = isInvitations ? 'invitaciones-pendientes' : 'registros-completados';
    
    const columns: ExportColumn[] = isInvitations ? [
      { key: 'lastName', header: 'Apellido', type: 'text' },
      { key: 'email', header: 'Email', type: 'text' },
      { key: 'userType', header: 'Tipo de Usuario', type: 'text' },
      { key: 'sendDate', header: 'Fecha de Envío', type: 'date' },
      { key: 'status', header: 'Estado', type: 'text' }
    ] : [
      { key: 'firstName', header: 'Nombre', type: 'text' },
      { key: 'lastName', header: 'Apellido', type: 'text' },
      { key: 'email', header: 'Email', type: 'text' },
      { key: 'registrationDate', header: 'Fecha de Registro', type: 'date' },
      { key: 'userType', header: 'Tipo de Usuario', type: 'text' }
    ];
    
    this.exportToCSV(registrations, columns, fileName);
  }

  /**
   * Export news articles data to PDF
   */
  exportNewsToPDF(articles: any[]): void {
    const columns: ExportColumn[] = [
      { key: 'title', header: 'Título', type: 'text' },
      { key: 'status', header: 'Estado', type: 'text' },
      { key: 'createdAt', header: 'Fecha', type: 'date' },
      { key: 'views', header: 'Visualizaciones', type: 'number' },
      { key: 'categories', header: 'Categorías', type: 'text' }
    ];
    
    this.exportToPDF(articles, columns, 'articulos-noticias', 'Artículos de Noticias');
  }

  /**
   * Export news articles data to CSV
   */
  exportNewsToCSV(articles: any[]): void {
    const columns: ExportColumn[] = [
      { key: 'title', header: 'Título', type: 'text' },
      { key: 'status', header: 'Estado', type: 'text' },
      { key: 'createdAt', header: 'Fecha', type: 'date' },
      { key: 'views', header: 'Visualizaciones', type: 'number' },
      { key: 'categories', header: 'Categorías', type: 'text' }
    ];
    
    this.exportToCSV(articles, columns, 'articulos-noticias');
  }

  /**
   * Format cell value based on type
   */
  private formatCellValue(value: any, type: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString('es-AR');
      case 'currency':
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS'
        }).format(value);
      case 'number':
        return value.toString();
      case 'text':
      default:
        return value.toString();
    }
  }
}

export interface ExportColumn {
  key: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'currency';
}