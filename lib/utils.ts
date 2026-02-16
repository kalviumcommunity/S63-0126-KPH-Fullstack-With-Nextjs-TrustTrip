// Utility functions for testing demonstration

export const add = (a: number, b: number): number => a + b;

export const subtract = (a: number, b: number): number => a - b;

export const multiply = (a: number, b: number): number => a * b;

export const divide = (a: number, b: number): number => {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
};

export const calculateRefund = (
  originalAmount: number,
  daysBeforeDeparture: number
): number => {
  // Refund policy:
  // - More than 7 days before departure: 100% refund
  // - 3-7 days before departure: 50% refund
  // - Less than 3 days before departure: 0% refund
  if (daysBeforeDeparture > 7) {
    return originalAmount;
  } else if (daysBeforeDeparture >= 3) {
    return originalAmount * 0.5;
  }
  return 0;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

