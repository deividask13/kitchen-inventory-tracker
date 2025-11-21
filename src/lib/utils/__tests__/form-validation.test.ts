import { describe, it, expect } from 'vitest';
import {
  validateField,
  validateForm,
  rules,
  createValidator,
  getErrorMessage,
  ValidationResult,
} from '../form-validation';

describe('validateField', () => {
  it('should validate required fields', () => {
    const error = validateField('', [rules.required()]);
    expect(error).toBe('This field is required');
    
    const noError = validateField('value', [rules.required()]);
    expect(noError).toBeNull();
  });

  it('should validate minLength', () => {
    const error = validateField('ab', [rules.minLength(3)]);
    expect(error).toBe('Must be at least 3 characters');
    
    const noError = validateField('abc', [rules.minLength(3)]);
    expect(noError).toBeNull();
  });

  it('should validate maxLength', () => {
    const error = validateField('abcdef', [rules.maxLength(5)]);
    expect(error).toBe('Must be no more than 5 characters');
    
    const noError = validateField('abcde', [rules.maxLength(5)]);
    expect(noError).toBeNull();
  });

  it('should validate minValue', () => {
    const error = validateField(4, [rules.minValue(5)]);
    expect(error).toBe('Must be at least 5');
    
    const noError = validateField(5, [rules.minValue(5)]);
    expect(noError).toBeNull();
  });

  it('should validate maxValue', () => {
    const error = validateField(11, [rules.maxValue(10)]);
    expect(error).toBe('Must be no more than 10');
    
    const noError = validateField(10, [rules.maxValue(10)]);
    expect(noError).toBeNull();
  });

  it('should validate pattern', () => {
    const error = validateField('abc', [rules.pattern(/^\d+$/, 'Must be digits only')]);
    expect(error).toBe('Must be digits only');
    
    const noError = validateField('123', [rules.pattern(/^\d+$/)]);
    expect(noError).toBeNull();
  });

  it('should validate email', () => {
    const error = validateField('invalid-email', [rules.email()]);
    expect(error).toBe('Invalid email address');
    
    const noError = validateField('test@example.com', [rules.email()]);
    expect(noError).toBeNull();
  });

  it('should validate date', () => {
    const minDate = new Date('2024-01-01');
    const maxDate = new Date('2024-12-31');
    
    const errorBefore = validateField(new Date('2023-12-31'), [
      rules.date(minDate, maxDate)
    ]);
    expect(errorBefore).toContain('must be after');
    
    const errorAfter = validateField(new Date('2025-01-01'), [
      rules.date(minDate, maxDate)
    ]);
    expect(errorAfter).toContain('must be before');
    
    const noError = validateField(new Date('2024-06-15'), [
      rules.date(minDate, maxDate)
    ]);
    expect(noError).toBeNull();
  });

  it('should validate custom rules', () => {
    const isEven = (value: number) => value % 2 === 0;
    
    const error = validateField(3, [rules.custom(isEven, 'Must be even')]);
    expect(error).toBe('Must be even');
    
    const noError = validateField(4, [rules.custom(isEven, 'Must be even')]);
    expect(noError).toBeNull();
  });

  it('should validate multiple rules', () => {
    const error = validateField('ab', [
      rules.required(),
      rules.minLength(3),
      rules.maxLength(10)
    ]);
    expect(error).toBe('Must be at least 3 characters');
    
    const noError = validateField('abcd', [
      rules.required(),
      rules.minLength(3),
      rules.maxLength(10)
    ]);
    expect(noError).toBeNull();
  });

  it('should skip validation for empty optional fields', () => {
    const noError = validateField('', [rules.minLength(3)]);
    expect(noError).toBeNull();
  });

  it('should use custom error messages', () => {
    const error = validateField('', [rules.required('Name is required')]);
    expect(error).toBe('Name is required');
  });
});

describe('validateForm', () => {
  it('should validate all fields', () => {
    const result = validateForm({
      name: {
        value: '',
        rules: [rules.required()]
      },
      email: {
        value: 'invalid',
        rules: [rules.email()]
      },
      age: {
        value: 150,
        rules: [rules.maxValue(120)]
      }
    });
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('name');
    expect(result.errors).toHaveProperty('email');
    expect(result.errors).toHaveProperty('age');
  });

  it('should return valid result when all fields pass', () => {
    const result = validateForm({
      name: {
        value: 'John Doe',
        rules: [rules.required()]
      },
      email: {
        value: 'john@example.com',
        rules: [rules.email()]
      },
      age: {
        value: 30,
        rules: [rules.minValue(0), rules.maxValue(120)]
      }
    });
    
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});

describe('createValidator', () => {
  it('should create a validator function', () => {
    const validator = createValidator({
      name: [rules.required(), rules.minLength(2)],
      email: [rules.required(), rules.email()]
    });
    
    const result = validator({
      name: 'J',
      email: 'invalid'
    });
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('name');
    expect(result.errors).toHaveProperty('email');
  });

  it('should validate successfully with valid data', () => {
    const validator = createValidator({
      name: [rules.required(), rules.minLength(2)],
      email: [rules.required(), rules.email()]
    });
    
    const result = validator({
      name: 'John',
      email: 'john@example.com'
    });
    
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});

describe('getErrorMessage', () => {
  it('should return validation error message', () => {
    const error = new Error('Invalid input');
    error.name = 'ValidationError';
    
    const message = getErrorMessage(error);
    expect(message).toBe('Invalid input');
  });

  it('should return network error message', () => {
    const error = new Error('fetch failed');
    
    const message = getErrorMessage(error);
    expect(message).toContain('Network error');
  });

  it('should return timeout error message', () => {
    const error = new Error('Request timeout');
    
    const message = getErrorMessage(error);
    expect(message).toContain('timed out');
  });

  it('should return database error message', () => {
    const error = new Error('IndexedDB error');
    
    const message = getErrorMessage(error);
    expect(message).toContain('Database error');
  });

  it('should return default error message', () => {
    const error = new Error('Unknown error');
    
    const message = getErrorMessage(error);
    expect(message).toBe('Unknown error');
  });

  it('should return default message for errors without message', () => {
    const error = new Error();
    
    const message = getErrorMessage(error);
    expect(message).toContain('unexpected error');
  });
});

describe('rules builder', () => {
  it('should create required rule', () => {
    const rule = rules.required('Custom message');
    expect(rule.type).toBe('required');
    expect(rule.message).toBe('Custom message');
  });

  it('should create minLength rule', () => {
    const rule = rules.minLength(5, 'Too short');
    expect(rule.type).toBe('minLength');
    expect(rule.value).toBe(5);
    expect(rule.message).toBe('Too short');
  });

  it('should create maxLength rule', () => {
    const rule = rules.maxLength(10, 'Too long');
    expect(rule.type).toBe('maxLength');
    expect(rule.value).toBe(10);
    expect(rule.message).toBe('Too long');
  });

  it('should create minValue rule', () => {
    const rule = rules.minValue(0, 'Must be positive');
    expect(rule.type).toBe('minValue');
    expect(rule.value).toBe(0);
    expect(rule.message).toBe('Must be positive');
  });

  it('should create maxValue rule', () => {
    const rule = rules.maxValue(100, 'Too large');
    expect(rule.type).toBe('maxValue');
    expect(rule.value).toBe(100);
    expect(rule.message).toBe('Too large');
  });

  it('should create pattern rule', () => {
    const pattern = /^\d+$/;
    const rule = rules.pattern(pattern, 'Digits only');
    expect(rule.type).toBe('pattern');
    expect(rule.value).toBe(pattern);
    expect(rule.message).toBe('Digits only');
  });

  it('should create email rule', () => {
    const rule = rules.email('Invalid email');
    expect(rule.type).toBe('email');
    expect(rule.message).toBe('Invalid email');
  });

  it('should create date rule', () => {
    const minDate = new Date('2024-01-01');
    const maxDate = new Date('2024-12-31');
    const rule = rules.date(minDate, maxDate, 'Invalid date range');
    expect(rule.type).toBe('date');
    expect(rule.minDate).toBe(minDate);
    expect(rule.maxDate).toBe(maxDate);
    expect(rule.message).toBe('Invalid date range');
  });

  it('should create custom rule', () => {
    const validator = (value: any) => value > 0;
    const rule = rules.custom(validator, 'Must be positive');
    expect(rule.type).toBe('custom');
    expect(rule.validator).toBe(validator);
    expect(rule.message).toBe('Must be positive');
  });
});
