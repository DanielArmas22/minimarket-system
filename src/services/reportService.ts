import jsPDF from 'jspdf';
import { Sale, Product, InventoryAdjustment } from '../types';

export type ReportType = 'sales' | 'top-products' | 'profit-margin' | 'inventory-movements';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  reportType: ReportType;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface ProfitMarginData {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  margin: number; // Porcentaje estimado
}

/**
 * Servicio para generar reportes en formato PDF
 */
class ReportService {
  /**
   * Genera un reporte PDF según el tipo seleccionado
   */
  generateReport(
    reportType: ReportType,
    data: {
      sales?: Sale[];
      products?: Product[];
      inventoryAdjustments?: InventoryAdjustment[];
      filters: ReportFilters;
    }
  ): void {
    try {
      switch (reportType) {
        case 'sales':
          this.generateSalesReport(data.sales || [], data.filters);
          break;
        case 'top-products':
          this.generateTopProductsReport(data.sales || [], data.filters);
          break;
        case 'profit-margin':
          this.generateProfitMarginReport(data.sales || [], data.filters);
          break;
        case 'inventory-movements':
          this.generateInventoryMovementsReport(data.inventoryAdjustments || [], data.filters);
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }
    } catch (error) {
      console.error('Error al generar el reporte PDF:', error);
      throw new Error('No se pudo generar el reporte. Por favor, intente nuevamente.');
    }
  }

  /**
   * Genera reporte de ventas
   */
  private generateSalesReport(sales: Sale[], filters: ReportFilters): void {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    });

    const margin = 15;
    let yPos = margin;
    const lineHeight = 7;
    const pageHeight = 297;
    const maxWidth = 180;

    // Filtrar ventas por fecha
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Encabezado
    this.addHeader(doc, 'REPORTE DE VENTAS', filters, margin, yPos, maxWidth);
    yPos += 20;

    // Estadísticas resumidas
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', margin, yPos);
    yPos += lineHeight;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de ventas: ${totalSales}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Ingresos totales: $${totalRevenue.toFixed(2)}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Venta promedio: $${avgSale.toFixed(2)}`, margin, yPos);
    yPos += lineHeight * 1.5;

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, maxWidth - margin, yPos);
    yPos += lineHeight;

    // Tabla de ventas
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE VENTAS', margin, yPos);
    yPos += lineHeight * 1.5;

    // Encabezados de tabla
    doc.setFontSize(8);
    doc.text('Fecha', margin, yPos);
    doc.text('Ticket #', margin + 40, yPos);
    doc.text('Total', margin + 85, yPos);
    doc.text('Productos', margin + 110, yPos);
    yPos += lineHeight;

    doc.setLineWidth(0.3);
    doc.line(margin, yPos, maxWidth - margin, yPos);
    yPos += lineHeight / 2;

    // Detalles de ventas
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    filteredSales.forEach((sale) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }

      const saleDate = new Date(sale.date);
      doc.text(saleDate.toLocaleDateString('es-ES'), margin, yPos);
      doc.text(sale.id.substring(0, 8), margin + 40, yPos);
      doc.text(`$${sale.total.toFixed(2)}`, margin + 85, yPos);
      doc.text(`${sale.items.length}`, margin + 110, yPos);
      yPos += lineHeight;
    });

    const fileName = `reporte_ventas_${filters.startDate}_${filters.endDate}.pdf`;
    doc.save(fileName);
  }

  /**
   * Genera reporte de productos más vendidos
   */
  private generateTopProductsReport(sales: Sale[], filters: ReportFilters): void {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    });

    const margin = 15;
    let yPos = margin;
    const lineHeight = 7;
    const pageHeight = 297;
    const maxWidth = 180;

    // Filtrar ventas por fecha
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Calcular productos más vendidos
    const productMap = new Map<number, TopProduct>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.totalSold += item.quantity;
          existing.totalRevenue += item.subtotal;
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            totalSold: item.quantity,
            totalRevenue: item.subtotal,
          });
        }
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 20); // Top 20

    // Encabezado
    this.addHeader(doc, 'PRODUCTOS MÁS VENDIDOS', filters, margin, yPos, maxWidth);
    yPos += 20;

    // Estadísticas resumidas
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', margin, yPos);
    yPos += lineHeight;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de productos únicos: ${productMap.size}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Total de unidades vendidas: ${topProducts.reduce((sum, p) => sum + p.totalSold, 0)}`, margin, yPos);
    yPos += lineHeight * 1.5;

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, maxWidth - margin, yPos);
    yPos += lineHeight;

    // Tabla de productos
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('RANKING DE PRODUCTOS', margin, yPos);
    yPos += lineHeight * 1.5;

    // Encabezados de tabla
    doc.setFontSize(8);
    doc.text('#', margin, yPos);
    doc.text('Producto', margin + 10, yPos);
    doc.text('Cantidad', margin + 110, yPos);
    doc.text('Ingresos', margin + 135, yPos);
    yPos += lineHeight;

    doc.setLineWidth(0.3);
    doc.line(margin, yPos, maxWidth - margin, yPos);
    yPos += lineHeight / 2;

    // Detalles de productos
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    topProducts.forEach((product, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }

      doc.text(`${index + 1}`, margin, yPos);
      const productName = this.truncateText(doc, product.productName, 95);
      doc.text(productName, margin + 10, yPos);
      doc.text(`${product.totalSold}`, margin + 110, yPos);
      doc.text(`$${product.totalRevenue.toFixed(2)}`, margin + 135, yPos);
      yPos += lineHeight;
    });

    const fileName = `reporte_productos_vendidos_${filters.startDate}_${filters.endDate}.pdf`;
    doc.save(fileName);
  }

  /**
   * Genera reporte de márgenes de ganancia
   */
  private generateProfitMarginReport(sales: Sale[], filters: ReportFilters): void {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    });

    const margin = 15;
    let yPos = margin;
    const lineHeight = 7;
    const pageHeight = 297;
    const maxWidth = 180;

    // Filtrar ventas por fecha
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Calcular márgenes (estimado al 30% por defecto, ya que no tenemos costo)
    const productMap = new Map<number, ProfitMarginData>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.productId);
        const estimatedCost = item.price * 0.7; // Asumiendo 30% de margen
        const profit = item.price - estimatedCost;
        const marginPercent = (profit / item.price) * 100;
        
        if (existing) {
          existing.totalSold += item.quantity;
          existing.totalRevenue += item.subtotal;
          existing.margin = marginPercent; // Mantener el margen promedio
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            totalSold: item.quantity,
            totalRevenue: item.subtotal,
            margin: marginPercent,
          });
        }
      });
    });

    const products = Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Encabezado
    this.addHeader(doc, 'REPORTE DE MÁRGENES DE GANANCIA', filters, margin, yPos, maxWidth);
    yPos += 20;

    // Nota sobre márgenes estimados
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Nota: Los márgenes son estimados basados en un 30% de ganancia promedio.', margin, yPos);
    yPos += lineHeight * 1.5;

    // Estadísticas resumidas
    const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
    const avgMargin = products.length > 0 
      ? products.reduce((sum, p) => sum + p.margin, 0) / products.length 
      : 0;
    const estimatedProfit = totalRevenue * 0.3;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', margin, yPos);
    yPos += lineHeight;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ingresos totales: $${totalRevenue.toFixed(2)}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Ganancia estimada: $${estimatedProfit.toFixed(2)}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Margen promedio: ${avgMargin.toFixed(1)}%`, margin, yPos);
    yPos += lineHeight * 1.5;

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, maxWidth - margin, yPos);
    yPos += lineHeight;

    // Tabla de productos
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('MÁRGENES POR PRODUCTO', margin, yPos);
    yPos += lineHeight * 1.5;

    // Encabezados de tabla
    doc.setFontSize(8);
    doc.text('Producto', margin, yPos);
    doc.text('Ingresos', margin + 90, yPos);
    doc.text('Margen', margin + 120, yPos);
    doc.text('Ganancia Est.', margin + 145, yPos);
    yPos += lineHeight;

    doc.setLineWidth(0.3);
    doc.line(margin, yPos, maxWidth - margin, yPos);
    yPos += lineHeight / 2;

    // Detalles de productos
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    products.slice(0, 30).forEach((product) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }

      const productName = this.truncateText(doc, product.productName, 85);
      doc.text(productName, margin, yPos);
      doc.text(`$${product.totalRevenue.toFixed(2)}`, margin + 90, yPos);
      doc.text(`${product.margin.toFixed(1)}%`, margin + 120, yPos);
      doc.text(`$${(product.totalRevenue * 0.3).toFixed(2)}`, margin + 145, yPos);
      yPos += lineHeight;
    });

    const fileName = `reporte_margenes_${filters.startDate}_${filters.endDate}.pdf`;
    doc.save(fileName);
  }

  /**
   * Genera reporte de movimientos de inventario
   */
  private generateInventoryMovementsReport(adjustments: InventoryAdjustment[], filters: ReportFilters): void {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    });

    const margin = 15;
    let yPos = margin;
    const lineHeight = 7;
    const pageHeight = 297;
    const maxWidth = 180;

    // Filtrar ajustes por fecha
    const filteredAdjustments = adjustments.filter(adj => {
      const adjDate = new Date(adj.adjustmentDate);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      return adjDate >= startDate && adjDate <= endDate;
    });

    // Encabezado
    this.addHeader(doc, 'REPORTE DE MOVIMIENTOS DE INVENTARIO', filters, margin, yPos, maxWidth);
    yPos += 20;

    // Estadísticas resumidas
    const increases = filteredAdjustments.filter(a => a.adjustmentType === 'increase').length;
    const decreases = filteredAdjustments.filter(a => a.adjustmentType === 'decrease').length;
    const totalAdjustments = filteredAdjustments.length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', margin, yPos);
    yPos += lineHeight;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de ajustes: ${totalAdjustments}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Aumentos: ${increases}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Disminuciones: ${decreases}`, margin, yPos);
    yPos += lineHeight * 1.5;

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, maxWidth - margin, yPos);
    yPos += lineHeight;

    // Tabla de ajustes
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE MOVIMIENTOS', margin, yPos);
    yPos += lineHeight * 1.5;

    // Encabezados de tabla
    doc.setFontSize(8);
    doc.text('Fecha', margin, yPos);
    doc.text('Producto', margin + 35, yPos);
    doc.text('Tipo', margin + 95, yPos);
    doc.text('Cantidad', margin + 115, yPos);
    doc.text('Razón', margin + 140, yPos);
    yPos += lineHeight;

    doc.setLineWidth(0.3);
    doc.line(margin, yPos, maxWidth - margin, yPos);
    yPos += lineHeight / 2;

    // Detalles de ajustes
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    filteredAdjustments.forEach((adj) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }

      const adjDate = new Date(adj.adjustmentDate);
      doc.text(adjDate.toLocaleDateString('es-ES'), margin, yPos);
      
      const productName = adj.product?.descripcion || 'N/A';
      const truncatedName = this.truncateText(doc, productName, 55);
      doc.text(truncatedName, margin + 35, yPos);
      
      const typeText = adj.adjustmentType === 'increase' ? 'Aumento' : 'Disminución';
      doc.text(typeText, margin + 95, yPos);
      doc.text(`${adj.quantity}`, margin + 115, yPos);
      
      const reasonText = this.getReasonLabel(adj.reason);
      doc.text(reasonText, margin + 140, yPos);
      yPos += lineHeight;
    });

    const fileName = `reporte_inventario_${filters.startDate}_${filters.endDate}.pdf`;
    doc.save(fileName);
  }

  /**
   * Agrega encabezado común a todos los reportes
   */
  private addHeader(
    doc: jsPDF,
    title: string,
    filters: ReportFilters,
    margin: number,
    yPos: number,
    maxWidth: number
  ): void {
    // Nombre del negocio
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MINIMARKET', maxWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Título del reporte
    doc.setFontSize(12);
    doc.text(title, maxWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Período
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const startDate = new Date(filters.startDate).toLocaleDateString('es-ES');
    const endDate = new Date(filters.endDate).toLocaleDateString('es-ES');
    doc.text(`Período: ${startDate} - ${endDate}`, maxWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    // Fecha de generación
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const now = new Date();
    doc.text(`Generado el: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, maxWidth / 2, yPos, { align: 'center' });
  }

  /**
   * Trunca el texto para que quepa en el ancho disponible
   */
  private truncateText(doc: jsPDF, text: string, maxWidth: number): string {
    if (!text || text.trim() === '') {
      return 'N/A';
    }

    const textWidth = doc.getTextWidth(text);
    
    if (textWidth <= maxWidth) {
      return text;
    }

    let truncated = text;
    let dots = '...';
    
    while (doc.getTextWidth(truncated + dots) > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    
    return truncated + dots;
  }

  /**
   * Obtiene etiqueta legible de la razón de ajuste
   */
  private getReasonLabel(reason: string): string {
    const labels: { [key: string]: string } = {
      'merma': 'Merma',
      'conteo': 'Conteo',
      'daño': 'Daño',
      'devolucion': 'Devolución',
      'correccion': 'Corrección',
      'otro': 'Otro',
    };
    return labels[reason] || reason;
  }
}

export const reportService = new ReportService();

