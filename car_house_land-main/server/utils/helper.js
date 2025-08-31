const crypto = require('crypto');
const moment = require('moment');

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

const formatCurrency = (amount, currency = 'ETB') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 ETB';
  }

  const formatter = new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  if (currency === 'ETB') {
    return `${formatter.format(amount)} ETB`;
  }
  
  if (currency === 'USD') {
    return `$${formatter.format(amount)}`;
  }
  
  return `${formatter.format(amount)} ${currency}`;
};

const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  return moment(date).format(format);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const validateEthiopianPhone = (phone) => {
  const phoneRegex = /^\+251[0-9]{9}$/;
  return phoneRegex.test(phone);
};

const sanitizeSearchString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getPaginationInfo = (page, limit, total) => {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const itemsPerPage = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: total,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null
  };
};

const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const exchangeRates = {
    'ETB': { 'USD': 0.018, 'ETB': 1 },
    'USD': { 'ETB': 55.5, 'USD': 1 }
  };

  if (fromCurrency === toCurrency) return amount;
  
  const rate = exchangeRates[fromCurrency]?.[toCurrency];
  return rate ? Math.round(amount * rate * 100) / 100 : amount;
};

const generateSlug = (title) => {
  if (typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const validateFileType = (filename, allowedTypes) => {
  if (!filename || !Array.isArray(allowedTypes)) return false;
  const fileExtension = filename.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(fileExtension);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ethiopianLocations = {
  regions: [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
    'Gambela', 'Harari', 'Oromia', 'Sidama', 'SNNP', 'Somali', 'Tigray'
  ],
  cities: {
    'Addis Ababa': ['Bole', 'Kirkos', 'Yeka', 'Nifas Silk-Lafto', 'Kolfe Keranio', 'Gulele', 'Arada', 'Addis Ketema', 'Lideta', 'Akaky Kaliti'],
    'Oromia': ['Adama', 'Jimma', 'Bishoftu', 'Shashamane', 'Hawassa', 'Nekemte', 'Ambo', 'Holeta'],
    'Amhara': ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Birhan', 'Kombolcha', 'Debre Markos'],
    'Tigray': ['Mekelle', 'Adigrat', 'Axum', 'Shire', 'Alamata'],
    'SNNP': ['Hawassa', 'Arba Minch', 'Dilla', 'Sodo', 'Jinka'],
    'Dire Dawa': ['Dire Dawa']
  }
};

const escapeHtml = (text) => {
  if (typeof text !== 'string') return text;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

const generateVerificationCode = (length = 6) => {
  const digits = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
};

module.exports = {
  generateRandomString,
  generateUniqueId,
  formatCurrency,
  formatDate,
  calculateDistance,
  validateEthiopianPhone,
  sanitizeSearchString,
  getPaginationInfo,
  convertCurrency,
  generateSlug,
  validateFileType,
  formatFileSize,
  ethiopianLocations,
  escapeHtml,
  generateVerificationCode
};
