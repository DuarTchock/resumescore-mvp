// src/utils/pdfGenerator.js - VERSIÓN CORREGIDA CON MANEJO DE ERRORES
// Importación alternativa que funciona en todos los bundlers
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = (data) => {
  try {
    console.log('Iniciando generación de PDF...');
    console.log('Datos recibidos:', data);

    // Verificar que jsPDF esté disponible
    if (!jsPDF) {
      throw new Error('jsPDF no está disponible. Verifica que esté instalado.');
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    console.log('PDF doc creado, comenzando a generar contenido...');

    // Colores del tema
    const colors = {
      primary: [99, 102, 241],
      secondary: [139, 92, 246],
      success: [16, 185, 129],
      warning: [245, 158, 11],
      danger: [239, 68, 68],
      gray: [100, 116, 139],
      lightGray: [241, 245, 249]
    };

    // ============================================
    // HEADER
    // ============================================
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.text('📊', 15, 25);
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMESCORE', 30, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Analisis Profesional de CV', 30, 28);
    
    doc.setFontSize(9);
    const fecha = data.timestamp ? new Date(data.timestamp).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${fecha}`, 30, 35);
    doc.text(`Archivo: ${data.cvName || 'CV.pdf'}`, 30, 40);
    
    doc.setFontSize(8);
    doc.text('Powered by Groq AI', pageWidth - 40, 45);
    
    yPos = 60;

    // ============================================
    // RESUMEN EJECUTIVO
    // ============================================
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(10, yPos, pageWidth - 20, 45, 3, 3, 'F');
    
    yPos += 10;
    
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 15, yPos);
    
    yPos += 10;
    
    const metrics = [
      { label: 'Coincidencia', value: `${data.matchRate || 0}%`, color: colors.primary },
      { label: 'Promedio ATS', value: `${data.average || 0}%`, color: colors.secondary },
      { label: 'Potencial', value: `${data.improvementPath?.potential || data.average || 0}%`, color: colors.success }
    ];
    
    const colWidth = (pageWidth - 40) / 3;
    metrics.forEach((metric, i) => {
      const x = 15 + (i * colWidth);
      
      doc.setFillColor(...metric.color);
      doc.circle(x + 5, yPos + 5, 3, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(...colors.gray);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + 10, yPos + 6);
      
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value, x + 10, yPos + 15);
    });
    
    yPos += 30;

    console.log('Header y resumen completados...');

    // ============================================
    // SCORES POR ATS
    // ============================================
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('SCORES POR SISTEMA DE SEGUIMIENTO (ATS)', 15, yPos);
    
    yPos += 5;
    
    if (data.scores && Object.keys(data.scores).length > 0) {
      const atsData = Object.entries(data.scores).map(([ats, score]) => {
        const emoji = score >= 85 ? '🟢' : score >= 75 ? '🟡' : score >= 60 ? '🟠' : '🔴';
        return [emoji, ats, `${score}%`];
      });
      
      doc.autoTable({
        startY: yPos,
        head: [['', 'Sistema ATS', 'Score']],
        body: atsData,
        theme: 'grid',
        headStyles: {
          fillColor: colors.primary,
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: null },
          2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
        },
        alternateRowStyles: {
          fillColor: colors.lightGray
        }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }

    console.log('Scores ATS completados...');

    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    // ============================================
    // KEYWORDS
    // ============================================
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('ANALISIS DE KEYWORDS', 15, yPos);
    
    yPos += 10;
    
    if (data.keywords) {
      const keywordSections = [
        { 
          title: 'Skills Tecnicos', 
          found: data.keywords.technical?.found || [],
          missing: data.keywords.technical?.missing || []
        },
        { 
          title: 'Habilidades Blandas', 
          found: data.keywords.soft?.found || [],
          missing: data.keywords.soft?.missing || []
        },
        { 
          title: 'Keywords de Industria', 
          found: data.keywords.industry?.found || [],
          missing: data.keywords.industry?.missing || []
        }
      ];
      
      keywordSections.forEach(section => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 15, yPos);
        yPos += 6;
        
        doc.setFontSize(9);
        doc.setTextColor(...colors.success);
        doc.text(`Encontrados (${section.found.length}):`, 20, yPos);
        doc.setTextColor(...colors.gray);
        doc.setFont('helvetica', 'normal');
        const foundText = section.found.length > 0 ? section.found.join(', ') : 'Ninguno';
        const foundLines = doc.splitTextToSize(foundText, pageWidth - 40);
        doc.text(foundLines, 25, yPos + 4);
        yPos += (foundLines.length * 4) + 6;
        
        doc.setFontSize(9);
        doc.setTextColor(...colors.danger);
        doc.text(`Faltantes (${section.missing.length}):`, 20, yPos);
        doc.setTextColor(...colors.gray);
        doc.setFont('helvetica', 'normal');
        const missingText = section.missing.length > 0 ? section.missing.join(', ') : 'Ninguno';
        const missingLines = doc.splitTextToSize(missingText, pageWidth - 40);
        doc.text(missingLines, 25, yPos + 4);
        yPos += (missingLines.length * 4) + 10;
      });
    }

    console.log('Keywords completadas...');

    // Nueva página para recomendaciones
    doc.addPage();
    yPos = 20;

    // ============================================
    // RECOMENDACIONES
    // ============================================
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMENDACIONES PRIORIZADAS', 15, yPos);
    
    yPos += 10;
    
    if (data.recommendations && data.recommendations.length > 0) {
      const groupedRecs = { critical: [], important: [], normal: [] };
      
      data.recommendations.forEach(rec => {
        const priority = typeof rec === 'object' ? rec.priority : 'normal';
        if (groupedRecs[priority]) {
          groupedRecs[priority].push(rec);
        }
      });
      
      ['critical', 'important', 'normal'].forEach(priority => {
        const recs = groupedRecs[priority];
        if (recs.length === 0) return;
        
        const priorityInfo = {
          critical: { label: 'CRITICAS', emoji: '🔴', color: colors.danger },
          important: { label: 'IMPORTANTES', emoji: '🟡', color: colors.warning },
          normal: { label: 'OPCIONALES', emoji: '🟢', color: colors.success }
        };
        
        const info = priorityInfo[priority];
        
        doc.setFontSize(12);
        doc.setTextColor(...info.color);
        doc.setFont('helvetica', 'bold');
        doc.text(`${info.emoji} ${info.label} (${recs.length})`, 15, yPos);
        yPos += 8;
        
        recs.forEach((rec, i) => {
          if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = 20;
          }
          
          const text = typeof rec === 'string' ? rec : rec.text;
          const section = typeof rec === 'object' && rec.section ? rec.section : '';
          
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`${i + 1}.`, 20, yPos);
          
          if (section) {
            doc.setTextColor(...colors.gray);
            doc.text(`[${section}]`, 25, yPos);
          }
          
          yPos += 4;
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colors.gray);
          const lines = doc.splitTextToSize(text, pageWidth - 45);
          doc.text(lines, 25, yPos);
          yPos += (lines.length * 4) + 6;
        });
        
        yPos += 5;
      });
    }

    console.log('Recomendaciones completadas...');

    // FOOTER
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      doc.text(
        `ResumeScore © 2024 | Pagina ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    console.log('PDF generado completamente, guardando...');

    // GUARDAR
    const fileName = `ResumeScore_Analisis_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('PDF guardado exitosamente:', fileName);
    return true;

  } catch (error) {
    console.error('Error detallado al generar PDF:', error);
    console.error('Stack trace:', error.stack);
    
    // Mensaje de error más descriptivo
    const errorMsg = error.message || 'Error desconocido';
    alert(`Error al generar el PDF: ${errorMsg}\n\nPor favor:\n1. Verifica que jsPDF esté instalado: npm install jspdf jspdf-autotable\n2. Revisa la consola para más detalles\n3. Intenta con el formato TXT`);
    
    return false;
  }
};