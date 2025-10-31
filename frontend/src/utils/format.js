// Format date
export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};


// Deformat currency string to number
export const deformatCurrency = (currencyString) => {
  if (!currencyString) return 0;
  if (typeof currencyString === 'number') return currencyString;
  return Number(currencyString.replace(/[^0-9,-]+/g,"").replace(',', ''));
};
