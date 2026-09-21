/**
 * Indian Number and Currency Formatters for MarketingIQ
 * 1 Lakh = 1,00,000 (100K)
 * 1 Crore = 1,00,00,000 (10M)
 */

export function formatINR(val: number, options?: { compact?: boolean; precision?: number }): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0';

  const precision = options?.precision !== undefined ? options.precision : 2;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  if (options?.compact !== false) {
    if (absVal >= 10000000) {
      // Crores
      const cr = absVal / 10000000;
      return `${isNegative ? '-' : ''}₹${cr.toFixed(precision)} Cr`;
    }
    if (absVal >= 100000) {
      // Lakhs
      const lk = absVal / 100000;
      return `${isNegative ? '-' : ''}₹${lk.toFixed(precision)} L`;
    }
  }

  // Standard Indian comma separator: 12,34,567
  const parts = Math.round(absVal).toString().split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `${isNegative ? '-' : ''}₹${formattedInt}`;
}

export function formatNumberIndian(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  const absVal = Math.abs(val);
  const isNegative = val < 0;

  if (absVal >= 10000000) {
    return `${isNegative ? '-' : ''}${(absVal / 10000000).toFixed(2)} Cr`;
  }
  if (absVal >= 100000) {
    return `${isNegative ? '-' : ''}${(absVal / 100000).toFixed(2)} L`;
  }

  const parts = Math.round(absVal).toString().split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  return `${isNegative ? '-' : ''}${otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree}`;
}

export function formatPercent(val: number, precision: number = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '0.0%';
  return `${val.toFixed(precision)}%`;
}

export function formatROI(val: number): string {
  if (val === null || val === undefined || isNaN(val)) return '0.00x';
  return `${val.toFixed(2)}x`;
}

export function formatDelta(val: number, type: 'currency' | 'percent' | 'roi' | 'number' = 'currency'): { text: string; isPositive: boolean; isNeutral: boolean } {
  if (Math.abs(val) < 0.001) {
    return { text: '0', isPositive: false, isNeutral: true };
  }
  const isPositive = val > 0;
  const prefix = isPositive ? '+' : '-';
  const absVal = Math.abs(val);

  let formatted = '';
  switch (type) {
    case 'currency':
      formatted = formatINR(absVal, { compact: true });
      break;
    case 'percent':
      formatted = `${absVal.toFixed(1)}%`;
      break;
    case 'roi':
      formatted = `${absVal.toFixed(2)}x`;
      break;
    case 'number':
      formatted = formatNumberIndian(absVal);
      break;
  }

  return {
    text: `${prefix}${formatted}`,
    isPositive,
    isNeutral: false
  };
}
