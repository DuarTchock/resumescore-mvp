// src/utils/helpers.js - Utilidades del cliente (navegador)

/**
 * Extrae texto de un archivo PDF o DOCX enviándolo a la API
 * @param {File} file - El archivo a procesar
 * @returns {Promise<string>} - El texto extraído
 */
export async function extractTextFromFile(file) {
  try {
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', file);

    // Llamar a la API de Vercel
    const response = await fetch('/api/extract-text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al procesar el archivo');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

/**
 * Valida que el archivo sea PDF o DOCX
 * @param {File} file - El archivo a validar
 * @returns {boolean} - true si es válido
 */
export function isValidFileType(file) {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];
  return validTypes.includes(file.type);
}

/**
 * Valida el tamaño del archivo (máximo 10MB)
 * @param {File} file - El archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB (default: 10)
 * @returns {boolean} - true si es válido
 */
export function isValidFileSize(file, maxSizeMB = 10) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Formatea el tamaño del archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Obtiene la extensión del archivo
 * @param {File} file - El archivo
 * @returns {string} - Extensión del archivo
 */
export function getFileExtension(file) {
  return file.name.split('.').pop().toLowerCase();
}

// ============================================
// FUNCIONES ORIGINALES DE HELPERS.JS
// ============================================

export const getPriorityColor = (priority, darkMode) => {
  const colors = {
    critical: darkMode 
      ? 'bg-red-900 text-red-200 border-red-700' 
      : 'bg-red-50 text-red-800 border-red-300',
    important: darkMode 
      ? 'bg-yellow-900 text-yellow-200 border-yellow-700' 
      : 'bg-yellow-50 text-yellow-800 border-yellow-300',
    normal: darkMode 
      ? 'bg-green-900 text-green-200 border-green-700' 
      : 'bg-green-50 text-green-800 border-green-300'
  };
  return colors[priority] || colors.normal;
};

export const getPriorityIcon = (priority) => {
  return priority === 'critical' ? '🔴' : priority === 'important' ? '🟡' : '🟢';
};

export const getScoreColor = (score) => {
  if (score >= 85) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

export const getScoreGradient = (score) => {
  if (score >= 85) return 'bg-gradient-to-r from-green-500 to-emerald-500';
  if (score >= 70) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
  return 'bg-gradient-to-r from-red-500 to-pink-500';
};

export const formatDate = (isoString) => {
  return new Date(isoString).toLocaleString('es-ES');
};