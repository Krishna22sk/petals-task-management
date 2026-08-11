/**
 * Safe Date handling utility for production serialization resilience.
 */

export const safeISOString = (dateVal, fallback = new Date().toISOString()) => {
  if (!dateVal) return fallback;
  if (typeof dateVal === 'string') {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? fallback : d.toISOString();
  }
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? fallback : dateVal.toISOString();
  }
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? fallback : d.toISOString();
  } catch (e) {
    return fallback;
  }
};

export const safeDateSplit = (dateVal, fallback = '') => {
  if (!dateVal) return fallback;
  if (typeof dateVal === 'string') {
    return dateVal.includes('T') ? dateVal.split('T')[0] : dateVal;
  }
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? fallback : dateVal.toISOString().split('T')[0];
  }
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? fallback : d.toISOString().split('T')[0];
  } catch (e) {
    return fallback;
  }
};
