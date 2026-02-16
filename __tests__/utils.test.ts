import {
  add,
  subtract,
  multiply,
  divide,
  calculateRefund,
  formatCurrency,
  validateEmail,
  generateOrderId,
} from '../lib/utils';

describe('Math Operations', () => {
  describe('add', () => {
    test('adds two positive numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });

    test('adds negative numbers correctly', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    test('adds positive and negative numbers correctly', () => {
      expect(add(5, -3)).toBe(2);
    });
  });

  describe('subtract', () => {
    test('subtracts two numbers correctly', () => {
      expect(subtract(10, 5)).toBe(5);
    });

    test('handles negative results', () => {
      expect(subtract(5, 10)).toBe(-5);
    });
  });

  describe('multiply', () => {
    test('multiplies two numbers correctly', () => {
      expect(multiply(4, 5)).toBe(20);
    });

    test('handles zero correctly', () => {
      expect(multiply(100, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    test('divides two numbers correctly', () => {
      expect(divide(10, 2)).toBe(5);
    });

    test('throws error when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });
});

describe('Refund Calculation', () => {
  test('returns 100% refund when more than 7 days before departure', () => {
    expect(calculateRefund(100, 8)).toBe(100);
    expect(calculateRefund(100, 15)).toBe(100);
  });

  test('returns 50% refund when 3-7 days before departure', () => {
    expect(calculateRefund(100, 7)).toBe(50);
    expect(calculateRefund(100, 5)).toBe(50);
    expect(calculateRefund(100, 3)).toBe(50);
  });

  test('returns 0% refund when less than 3 days before departure', () => {
    expect(calculateRefund(100, 2)).toBe(0);
    expect(calculateRefund(100, 1)).toBe(0);
    expect(calculateRefund(100, 0)).toBe(0);
  });

  test('calculates refund with different amounts', () => {
    expect(calculateRefund(200, 10)).toBe(200);
    expect(calculateRefund(200, 5)).toBe(100);
    expect(calculateRefund(200, 1)).toBe(0);
  });
});

describe('Currency Formatting', () => {
  test('formats amount in USD by default', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  test('formats amount in different currencies', () => {
    expect(formatCurrency(100, 'EUR')).toContain('100');
    expect(formatCurrency(100, 'GBP')).toContain('100');
  });
});

describe('Email Validation', () => {
  test('validates correct email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.email@domain.org')).toBe(true);
    expect(validateEmail('name.surname@company.co.uk')).toBe(true);
  });

  test('rejects invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@domain')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('Order ID Generation', () => {
  test('generates order IDs in correct format', () => {
    const orderId = generateOrderId();
    expect(orderId).toMatch(/^ORD-\d+-[A-Z0-9]{6}$/);
  });

  test('generates unique order IDs', () => {
    const orderIds = new Set();
    for (let i = 0; i < 100; i++) {
      orderIds.add(generateOrderId());
    }
    // All 100 generated IDs should be unique
    expect(orderIds.size).toBe(100);
  });
});

