// src/components/ui/ATSTooltip.jsx - Tooltips especializados para términos ATS
//import { Tooltip } from './Tooltip';
import { ATSTooltip, InfoIconWithTooltip } from './ui/ATSTooltip';

/**
 * ATSTooltip - Tooltip especializado con explicaciones de términos relacionados a ATS
 */
export const ATSTooltip = ({ children, term = "ATS", darkMode = false }) => {
  const tooltips = {
    ATS: "Los ATS (Applicant Tracking Systems - Sistemas de Seguimiento de Candidatos) son sistemas automatizados que las empresas utilizan para filtrar CVs antes de que lleguen a un reclutador humano. Analizan keywords, formato y compatibilidad con el puesto.",
    
    keywords: "Palabras clave específicas del puesto que los Sistemas de Seguimiento de Candidatos (ATS) buscan en tu CV para determinar compatibilidad. Incluyen habilidades técnicas, soft skills y terminología de la industria.",
    
    matchRate: "Porcentaje de compatibilidad entre tu CV y la descripción del trabajo. Se calcula analizando keywords encontradas vs faltantes, formato, estructura y experiencia relevante.",
    
    score: "Puntuación de 0-100 que mide qué tan bien tu CV será interpretado por este sistema ATS específico. Considera formato, keywords, estructura de secciones y compatibilidad con el puesto.",
    
    format: "Los ATS (Sistemas de Seguimiento de Candidatos) prefieren formatos simples y limpios. Evita tablas complejas, gráficos, columnas múltiples y formatos inusuales que dificultan la extracción automática de información.",
    
    bullets: "Los bullets con • o - son preferidos por los ATS y mejoran la legibilidad tanto para sistemas automatizados como para reclutadores humanos. Facilitan la extracción de información clave.",
    
    sections: "Secciones claramente definidas (Experiencia, Educación, Skills, Certificaciones) ayudan a los ATS a categorizar tu información correctamente. Usa nombres de sección estándar.",
    
    dates: "Formato de fechas consistente (MM/YYYY o Mes Año) facilita que los Sistemas de Seguimiento de Candidatos (ATS) extraigan tu historial laboral y calculen años de experiencia automáticamente.",
    
    technical: "Skills técnicos son habilidades específicas y cuantificables relacionadas con herramientas, tecnologías, lenguajes de programación o software. Los ATS les dan alta prioridad en el matching.",
    
    soft: "Soft skills son habilidades interpersonales y de personalidad (liderazgo, comunicación, trabajo en equipo). Aunque importantes, los ATS les dan menor peso que a las técnicas.",
    
    industry: "Keywords de industria son términos específicos del sector o dominio del negocio (fintech, e-commerce, healthcare). Demuestran conocimiento del campo y son valorados por los ATS.",
    
    improvement: "Ruta de mejora muestra los pasos específicos y priorizados para optimizar tu CV. Cada paso incluye el impacto estimado en tu score y el tiempo requerido para implementarlo.",
    
    potential: "Tu potencial máximo es el score que puedes alcanzar si implementas todas las mejoras recomendadas. Se calcula considerando keywords faltantes, formato y estructura."
  };

  const content = tooltips[term] || tooltips.ATS;

  return (
    <Tooltip text={content}>
      <span className={`underline decoration-dotted cursor-help transition-colors ${
        darkMode 
          ? 'text-blue-400 hover:text-blue-300' 
          : 'text-blue-600 hover:text-blue-700'
      }`}>
        {children}
      </span>
    </Tooltip>
  );
};

/**
 * InfoIconWithTooltip - Icono de información con tooltip
 */
export const InfoIconWithTooltip = ({ term, darkMode = false }) => {
  return (
    <ATSTooltip term={term} darkMode={darkMode}>
      <svg 
        className={`w-4 h-4 inline-block ml-1 cursor-help transition-colors ${
          darkMode 
            ? 'text-gray-400 hover:text-gray-300' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </ATSTooltip>
  );
};

export default ATSTooltip;