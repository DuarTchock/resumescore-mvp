// src/utils/pdfGenerator.js - VERSIÓN FINAL SIN EMOJIS
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = (data) => {
  try {
    console.log('Generando PDF profesional...');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Colores
    const colors = {
      primary: [99, 102, 241],
      secondary: [139, 92, 246],
      success: [16, 185, 129],
      warning: [245, 158, 11],
      danger: [239, 68, 68],
      gray: [100, 116, 139],
      lightGray: [241, 245, 249],
      white: [255, 255, 255]
    };

    // ============================================
    // HEADER CON DEGRADADO
    // ============================================
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 55, 'F');
    
    // Logo text
    doc.setFontSize(28);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMESCORE', 15, 25);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Analisis Profesional de CV con IA', 15, 33);
    
    // Info
    doc.setFontSize(9);
    const fecha = new Date(data.timestamp).toLocaleDateString('es-ES');
    doc.text(`Fecha: ${fecha}`, 15, 41);
    doc.text(`Archivo: ${data.cvName || 'CV.pdf'}`, 15, 46);
    
    doc.setFontSize(8);
    doc.text('Powered by Groq AI - Llama 3.3 70B', pageWidth - 70, 50);
    
    yPos = 65;

    // ============================================
    // RESUMEN EJECUTIVO
    // ============================================
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(10, yPos, pageWidth - 20, 48, 3, 3, 'F');
    
    yPos += 8;
    
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 15, yPos);
    
    yPos += 10;
    
    // Métricas en cards
    const metrics = [
      { label: 'Coincidencia', value: `${data.matchRate || 0}%`, color: colors.primary },
      { label: 'Promedio ATS', value: `${data.average || 0}%`, color: colors.secondary },
      { label: 'Potencial', value: `${data.improvementPath?.potential || data.average || 0}%`, color: colors.success }
    ];
    
    const cardWidth = (pageWidth - 40) / 3;
    metrics.forEach((metric, i) => {
      const x = 15 + (i * cardWidth);
      
      // Card background
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, yPos, cardWidth - 5, 25, 2, 2, 'F');
      
      // Indicator circle
      doc.setFillColor(...metric.color);
      doc.circle(x + 5, yPos + 7, 2.5, 'F');
      
      // Label
      doc.setFontSize(9);
      doc.setTextColor(...colors.gray);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + 10, yPos + 8);
      
      // Value
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.value, x + 5, yPos + 20);
    });
    
    yPos += 35;

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
        // Usar círculos de colores en lugar de emojis
        const indicator = score >= 85 ? '[+++]' : score >= 75 ? '[++]' : score >= 60 ? '[+]' : '[!]';
        return [indicator, ats, `${score}%`];
      });
      
      doc.autoTable({
        startY: yPos,
        head: [['Estado', 'Sistema ATS', 'Score']],
        body: atsData,
        theme: 'grid',
        headStyles: {
          fillColor: colors.primary,
          fontStyle: 'bold',
          fontSize: 10,
          textColor: colors.white
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          lineColor: [220, 220, 220],
          lineWidth: 0.5
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: null },
          2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
        },
        alternateRowStyles: {
          fillColor: colors.lightGray
        },
        didParseCell: function(data) {
          // Colorear el indicador según el score
          if (data.column.index === 0 && data.row.index >= 0) {
            const scoreText = data.row.raw[2];
            const score = parseInt(scoreText);
            
            if (score >= 85) {
              data.cell.styles.textColor = colors.success;
            } else if (score >= 75) {
              data.cell.styles.textColor = colors.warning;
            } else if (score >= 60) {
              data.cell.styles.textColor = [245, 158, 11]; // Orange
            } else {
              data.cell.styles.textColor = colors.danger;
            }
          }
        }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Nueva página si es necesario
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
    
    yPos += 8;
    
    if (data.keywords) {
      const keywordSections = [
        { 
          title: 'SKILLS TECNICOS', 
          found: data.keywords.technical?.found || [],
          missing: data.keywords.technical?.missing || []
        },
        { 
          title: 'HABILIDADES BLANDAS', 
          found: data.keywords.soft?.found || [],
          missing: data.keywords.soft?.missing || []
        },
        { 
          title: 'KEYWORDS DE INDUSTRIA', 
          found: data.keywords.industry?.found || [],
          missing: data.keywords.industry?.missing || []
        }
      ];
      
      keywordSections.forEach(section => {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }
        
        // Título de sección
        doc.setFillColor(...colors.lightGray);
        doc.roundedRect(15, yPos, pageWidth - 30, 8, 2, 2, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 18, yPos + 5.5);
        yPos += 12;
        
        // Encontrados
        doc.setFontSize(9);
        doc.setTextColor(...colors.success);
        doc.setFont('helvetica', 'bold');
        doc.text(`[+] Encontrados (${section.found.length}):`, 20, yPos);
        
        doc.setTextColor(...colors.gray);
        doc.setFont('helvetica', 'normal');
        const foundText = section.found.length > 0 ? section.found.join(', ') : 'Ninguno';
        const foundLines = doc.splitTextToSize(foundText, pageWidth - 50);
        doc.text(foundLines, 25, yPos + 5);
        yPos += (foundLines.length * 5) + 8;
        
        // Faltantes
        doc.setFontSize(9);
        doc.setTextColor(...colors.danger);
        doc.setFont('helvetica', 'bold');
        doc.text(`[-] Faltantes (${section.missing.length}):`, 20, yPos);
        
        doc.setTextColor(...colors.gray);
        doc.setFont('helvetica', 'normal');
        const missingText = section.missing.length > 0 ? section.missing.join(', ') : 'Ninguno';
        const missingLines = doc.splitTextToSize(missingText, pageWidth - 50);
        doc.text(missingLines, 25, yPos + 5);
        yPos += (missingLines.length * 5) + 12;
      });
    }

    // Nueva página para recomendaciones
    doc.addPage();
    yPos = 20;

    // ============================================
    // RECOMENDACIONES PRIORIZADAS
    // ============================================
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMENDACIONES PRIORIZADAS', 15, yPos);
    
    yPos += 8;
    
    if (data.recommendations && data.recommendations.length > 0) {
      const groupedRecs = { critical: [], important: [], normal: [] };
      
      data.recommendations.forEach(rec => {
        const priority = typeof rec === 'object' ? rec.priority : 'normal';
        if (groupedRecs[priority]) {
          groupedRecs[priority].push(rec);
        }
      });
      
      const priorityConfig = {
        critical: { 
          label: 'CRITICAS', 
          symbol: '[!!!]',
          color: colors.danger,
          bgColor: [254, 226, 226] // Red light
        },
        important: { 
          label: 'IMPORTANTES', 
          symbol: '[!!]',
          color: colors.warning,
          bgColor: [254, 243, 199] // Yellow light
        },
        normal: { 
          label: 'OPCIONALES', 
          symbol: '[!]',
          color: colors.success,
          bgColor: [209, 250, 229] // Green light
        }
      };

      ['critical', 'important', 'normal'].forEach(priority => {
        const recs = groupedRecs[priority];
        if (recs.length === 0) return;
        
        const config = priorityConfig[priority];
        
        // Header de prioridad
        doc.setFillColor(...config.bgColor);
        doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(...config.color);
        doc.setFont('helvetica', 'bold');
        doc.text(`${config.symbol} ${config.label} (${recs.length})`, 18, yPos + 6.5);
        yPos += 14;
        
        recs.forEach((rec, i) => {
          if (yPos > pageHeight - 35) {
            doc.addPage();
            yPos = 20;
          }
          
          const text = typeof rec === 'string' ? rec : rec.text;
          const section = typeof rec === 'object' && rec.section ? rec.section : '';
          
          // Número
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`${i + 1}.`, 20, yPos);
          
          // Sección tag
          if (section) {
            doc.setFillColor(...colors.lightGray);
            doc.roundedRect(27, yPos - 3, 25, 5, 1, 1, 'F');
            doc.setFontSize(8);
            doc.setTextColor(...colors.gray);
            doc.setFont('helvetica', 'normal');
            doc.text(`[${section}]`, 29, yPos);
          }
          
          yPos += 5;
          
          // Texto de recomendación
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colors.gray);
          const lines = doc.splitTextToSize(text, pageWidth - 50);
          doc.text(lines, 25, yPos);
          yPos += (lines.length * 5) + 8;
        });
        
        yPos += 5;
      });
    }

    // ============================================
    // LEYENDA
    // ============================================
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('LEYENDA DE SIMBOLOS', 18, yPos + 6);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.gray);
    doc.text('[+++] Excelente (85%+)  |  [++] Bueno (75-84%)  |  [+] Aceptable (60-74%)  |  [!] Necesita Mejora (<60%)', 18, yPos + 12);
    doc.text('[!!!] Critico  |  [!!] Importante  |  [!] Opcional', 18, yPos + 18);

    // ============================================
    // FOOTER
    // ============================================
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      doc.setDrawColor(...colors.gray);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `ResumeScore © 2024 | Pagina ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      doc.text('Hecho con AI para ayudarte a conseguir tu trabajo ideal', pageWidth / 2, pageHeight - 6, { align: 'center' });
    }

    console.log('PDF generado exitosamente');

    // GUARDAR
    const fileName = `ResumeScore_Analisis_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;

  } catch (error) {
    console.error('Error generando PDF:', error);
    alert(`Error al generar el PDF: ${error.message}\n\nIntenta con formato TXT.`);
    return false;
  }
};