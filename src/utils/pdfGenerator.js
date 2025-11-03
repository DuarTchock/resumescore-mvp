// src/utils/pdfGenerator.js - Generador de PDF Premium
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = (data) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Colores del tema
  const colors = {
    primary: [99, 102, 241],     // Indigo
    secondary: [139, 92, 246],   // Purple
    success: [16, 185, 129],     // Green
    warning: [245, 158, 11],     // Amber
    danger: [239, 68, 68],       // Red
    gray: [100, 116, 139],       // Slate
    lightGray: [241, 245, 249]   // Slate 100
  };

  // ============================================
  // HEADER con diseño premium
  // ============================================
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo/Icono (simulado con texto)
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text('📊', 15, 25);
  
  // Título
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMESCORE', 30, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Análisis Profesional de CV', 30, 28);
  
  // Fecha y archivo
  doc.setFontSize(9);
  doc.text(`Fecha: ${new Date(data.timestamp).toLocaleDateString('es-ES')}`, 30, 35);
  doc.text(`Archivo: ${data.cvName}`, 30, 40);
  
  // Powered by
  doc.setFontSize(8);
  doc.text('Powered by Groq AI', pageWidth - 40, 45);
  
  yPos = 60;

  // ============================================
  // RESUMEN EJECUTIVO - Card con sombra
  // ============================================
  doc.setFillColor(...colors.lightGray);
  doc.roundedRect(10, yPos, pageWidth - 20, 45, 3, 3, 'F');
  
  yPos += 10;
  
  doc.setFontSize(14);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('📈 RESUMEN EJECUTIVO', 15, yPos);
  
  yPos += 10;
  
  // Métricas principales en 3 columnas
  const metrics = [
    { label: 'Coincidencia', value: `${data.matchRate}%`, color: colors.primary },
    { label: 'Promedio ATS', value: `${data.average}%`, color: colors.secondary },
    { label: 'Potencial', value: `${data.improvementPath?.potential || data.average}%`, color: colors.success }
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

  // ============================================
  // SCORES POR ATS - Tabla estilizada
  // ============================================
  doc.setFontSize(14);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('🏆 SCORES POR ATS', 15, yPos);
  
  yPos += 5;
  
  const atsData = Object.entries(data.scores).map(([ats, score]) => {
    const emoji = score >= 85 ? '🟢' : score >= 75 ? '🟡' : score >= 60 ? '🟠' : '🔴';
    return [emoji, ats, `${score}%`];
  });
  
  doc.autoTable({
    startY: yPos,
    head: [['', 'ATS', 'Score']],
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

  // Nueva página si es necesario
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  // ============================================
  // KEYWORDS - Sección destacada
  // ============================================
  doc.setFontSize(14);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('🔍 ANÁLISIS DE KEYWORDS', 15, yPos);
  
  yPos += 10;
  
  const keywordSections = [
    { 
      title: '💻 Skills Técnicos', 
      found: data.keywords?.technical?.found || [],
      missing: data.keywords?.technical?.missing || [],
      color: colors.primary
    },
    { 
      title: '🤝 Soft Skills', 
      found: data.keywords?.soft?.found || [],
      missing: data.keywords?.soft?.missing || [],
      color: colors.secondary
    },
    { 
      title: '🏢 Keywords de Industria', 
      found: data.keywords?.industry?.found || [],
      missing: data.keywords?.industry?.missing || [],
      color: colors.warning
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
    
    // Encontrados
    doc.setFontSize(9);
    doc.setTextColor(...colors.success);
    doc.text(`✓ Encontrados (${section.found.length}):`, 20, yPos);
    doc.setTextColor(...colors.gray);
    doc.setFont('helvetica', 'normal');
    const foundText = section.found.length > 0 
      ? section.found.join(', ')
      : 'Ninguno';
    const foundLines = doc.splitTextToSize(foundText, pageWidth - 40);
    doc.text(foundLines, 25, yPos + 4);
    yPos += (foundLines.length * 4) + 6;
    
    // Faltantes
    doc.setFontSize(9);
    doc.setTextColor(...colors.danger);
    doc.text(`✗ Faltantes (${section.missing.length}):`, 20, yPos);
    doc.setTextColor(...colors.gray);
    doc.setFont('helvetica', 'normal');
    const missingText = section.missing.length > 0 
      ? section.missing.join(', ')
      : 'Ninguno';
    const missingLines = doc.splitTextToSize(missingText, pageWidth - 40);
    doc.text(missingLines, 25, yPos + 4);
    yPos += (missingLines.length * 4) + 10;
  });

  // Nueva página para recomendaciones
  doc.addPage();
  yPos = 20;

  // ============================================
  // RECOMENDACIONES PRIORIZADAS
  // ============================================
  doc.setFontSize(14);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('💡 RECOMENDACIONES PRIORIZADAS', 15, yPos);
  
  yPos += 10;
  
  // Agrupar por prioridad
  const groupedRecs = {
    critical: [],
    important: [],
    normal: []
  };
  
  data.recommendations?.forEach(rec => {
    const priority = typeof rec === 'object' ? rec.priority : 'normal';
    if (groupedRecs[priority]) {
      groupedRecs[priority].push(rec);
    }
  });
  
  ['critical', 'important', 'normal'].forEach(priority => {
    const recs = groupedRecs[priority];
    if (recs.length === 0) return;
    
    const priorityInfo = {
      critical: { label: 'CRÍTICAS', emoji: '🔴', color: colors.danger },
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

  // Nueva página para ruta de mejora
  if (data.improvementPath?.steps && data.improvementPath.steps.length > 0) {
    doc.addPage();
    yPos = 20;
    
    // ============================================
    // RUTA DE MEJORA
    // ============================================
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('🎯 TU RUTA DE MEJORA', 15, yPos);
    
    yPos += 10;
    
    // Progress bar
    const current = data.improvementPath.current;
    const potential = data.improvementPath.potential;
    const barWidth = pageWidth - 40;
    const barHeight = 15;
    
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(15, yPos, barWidth, barHeight, 2, 2, 'F');
    
    const progressWidth = (current / 100) * barWidth;
    doc.setFillColor(...colors.warning);
    doc.roundedRect(15, yPos, progressWidth, barHeight, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${current}%`, 15 + progressWidth - 15, yPos + 10);
    
    doc.setTextColor(0, 0, 0);
    doc.text(`Meta: ${potential}%`, 15 + barWidth + 5, yPos + 10);
    
    yPos += 25;
    
    // Pasos
    data.improvementPath.steps.forEach((step, i) => {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFillColor(...colors.lightGray);
      doc.roundedRect(15, yPos, pageWidth - 30, 20, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text(`Paso ${i + 1}`, 20, yPos + 7);
      
      doc.setTextColor(...colors.success);
      doc.text(step.impact, pageWidth - 50, yPos + 7);
      
      doc.setFontSize(9);
      doc.setTextColor(...colors.gray);
      doc.setFont('helvetica', 'normal');
      const actionLines = doc.splitTextToSize(step.action, pageWidth - 50);
      doc.text(actionLines, 20, yPos + 13);
      
      yPos += 25;
    });
  }

  // ============================================
  // FOOTER en última página
  // ============================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(
      `ResumeScore © 2024 | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // ============================================
  // GUARDAR PDF
  // ============================================
  const fileName = `ResumeScore_Analisis_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};