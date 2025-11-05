import jsPDF from 'jspdf';
import { Sale, typePayment } from '../types';

/**
 * Servicio para generar tickets de venta en formato PDF
 */
class TicketService {
  /**
   * Genera un ticket PDF de una venta
   */
  generateTicket(sale: Sale, paymentTypes?: typePayment[]): void {
    try {
      const doc = new jsPDF({
        format: [80, 200], // Tamaño de ticket pequeño (80mm ancho x 200mm alto)
        unit: 'mm',
      });

      const margin = 5;
      let yPos = margin;
      const lineHeight = 6;
      const maxWidth = 70;

      // Configuración del ticket
      const businessName = 'MINIMARKET';
      const businessAddress = 'Dirección del Negocio';
      const businessPhone = 'Tel: (XXX) XXX-XXXX';
      const businessRUC = 'RUC: XXXXXXXXX';

      // Encabezado del negocio
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(businessName, maxWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(businessAddress, maxWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight / 2;

      doc.text(businessPhone, maxWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight / 2;

      doc.text(businessRUC, maxWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight;

      // Línea separadora
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, maxWidth - margin, yPos);
      yPos += lineHeight;

      // Información de la venta
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TICKET DE VENTA', maxWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const saleDate = new Date(sale.date);
      doc.text(`Fecha: ${saleDate.toLocaleDateString('es-ES')}`, margin, yPos);
      yPos += lineHeight / 1.5;

      doc.text(`Hora: ${saleDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, margin, yPos);
      yPos += lineHeight / 1.5;

      if (sale.id) {
        doc.text(`Ticket #: ${sale.id}`, margin, yPos);
        yPos += lineHeight;
      }

      // Línea separadora
      doc.line(margin, yPos, maxWidth - margin, yPos);
      yPos += lineHeight / 2;

      // Detalles de productos
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('PRODUCTOS', margin, yPos);
      yPos += lineHeight / 1.5;

      // Línea separadora debajo de PRODUCTOS
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, maxWidth - margin, yPos);
      yPos += lineHeight / 1.5;

      // Lista de productos
      sale.items.forEach((item, index) => {
        // Verificar si hay espacio suficiente
        if (yPos > 180) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        
        // Nombre del producto (truncado si es necesario)
        const productName = this.truncateText(doc, item.productName, maxWidth - margin * 2);
        doc.text(productName, margin, yPos);
        yPos += lineHeight / 1.3;

        // Cantidad y precio - formato mejorado
        const quantityText = `${item.quantity} x $${item.price.toFixed(2)}`;
        const subtotalText = `$${item.subtotal.toFixed(2)}`;
        
        // Cantidad y precio unitario a la izquierda
        doc.text(quantityText, margin, yPos);
        
        // Subtotal alineado a la derecha
        const subtotalWidth = doc.getTextWidth(subtotalText);
        doc.text(subtotalText, maxWidth - margin - subtotalWidth, yPos);
        
        yPos += lineHeight / 1.2;
      });

      // Línea separadora
      if (yPos > 180) {
        doc.addPage();
        yPos = margin;
      }
      doc.line(margin, yPos, maxWidth - margin, yPos);
      yPos += lineHeight;

      // Totales
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const totalText = `TOTAL: $${sale.total.toFixed(2)}`;
      doc.text(totalText, maxWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight;

      // Método de pago (siempre mostrar)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const paymentMethodName = this.getPaymentMethodName(sale.paymentMethod, paymentTypes);
      doc.text(`Método de pago: ${paymentMethodName}`, margin, yPos);
      yPos += lineHeight;

      // Cliente si existe
      if (sale.customerName) {
        doc.setFontSize(7);
        doc.text(`Cliente: ${sale.customerName}`, margin, yPos);
        yPos += lineHeight;
      }

      // Pie de página
      yPos += lineHeight;
      doc.line(margin, yPos, maxWidth - margin, yPos);
      yPos += lineHeight;

      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.text('¡Gracias por su compra!', maxWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight / 1.5;

      doc.text('Conserve este ticket', maxWidth / 2, yPos, { align: 'center' });

      // Generar nombre del archivo
      const fileName = `ticket_${sale.id || Date.now()}_${saleDate.getTime()}.pdf`;

      // Descargar el PDF
      doc.save(fileName);
    } catch (error) {
      console.error('Error al generar el ticket PDF:', error);
      throw new Error('No se pudo generar el ticket. Por favor, intente nuevamente.');
    }
  }

  /**
   * Trunca el texto para que quepa en el ancho disponible
   */
  private truncateText(doc: jsPDF, text: string, maxWidth: number): string {
    if (!text || text.trim() === '') {
      return 'Producto sin nombre';
    }

    const textWidth = doc.getTextWidth(text);
    
    if (textWidth <= maxWidth) {
      return text;
    }

    // Truncar texto agregando puntos suspensivos
    let truncated = text;
    let dots = '...';
    
    // Verificar si los puntos suspensivos caben
    while (doc.getTextWidth(truncated + dots) > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    
    return truncated + dots;
  }

  /**
   * Obtiene el nombre del método de pago
   */
  private getPaymentMethodName(methodId: number | null | undefined, paymentTypes?: typePayment[]): string {
    if (methodId === null || methodId === undefined) {
      return 'No especificado';
    }
    
    if (paymentTypes && paymentTypes.length > 0) {
      const paymentType = paymentTypes.find(pt => pt.id === methodId);
      if (paymentType && paymentType.descripcion) {
        return paymentType.descripcion;
      }
    }
    
    // Si no encuentra el tipo de pago, usar nombres comunes
    const commonMethods: { [key: number]: string } = {
      1: 'Efectivo',
      2: 'Tarjeta',
      3: 'Transferencia',
    };
    
    return commonMethods[methodId] || `Método ${methodId}`;
  }

  /**
   * Imprime el ticket directamente (si el navegador lo soporta)
   */
  printTicket(sale: Sale, paymentTypes?: typePayment[]): void {
    try {
      // Primero generar el PDF
      this.generateTicket(sale, paymentTypes);
    } catch (error) {
      console.error('Error al imprimir el ticket:', error);
      throw error;
    }
  }
}

export const ticketService = new TicketService();

