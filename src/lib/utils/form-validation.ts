/**
 * Form validation utilities with real-time error messages
 * Provides field-level validation and helpful error messages
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  value: any;
  rules: ValidationRule[];
}

export type ValidationRule = 
  | RequiredRule
  | MinLengthRule
  | MaxLengthRule
  | MinValueRule
  | MaxValueRule
  | PatternRule
  | EmailRule
  | DateRule
  | CustomRule;

interface BaseRule {
  type: string;
  message?: string;
}

interface RequiredRule extends BaseRule {
  type: 'required';
}

interface MinLengthRule extends BaseRule {
  type: 'minLength';
  value: number;
}

interface MaxLengthRule extends BaseRule {
  type: 'maxLength';
  value: number;
}

interface MinValueRule extends BaseRule {
  type: 'minValue';
  value: number;
}

interface MaxValueRule extends BaseRule {
  type: 'maxValue';
  value: number;
}

interface PatternRule extends BaseRule {
  type: 'pattern';
  value: RegExp;
}

interface EmailRule extends BaseRule {
  type: 'email';
}

interface DateRule extends BaseRule {
  type: 'date';
  minDate?: Date;
  maxDate?: Date;
}

interface CustomRule extends BaseRule {
  type: 'custom';
  validator: (value: any) => boolean;
}

/**
 * Validate a single field against rules
 */
export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    const error = validateRule(value, rule);
    if (error) {
      return error;
    }
  }
  return null;
}

/**
 * Validate a single rule
 */
function validateRule(value: any, rule: ValidationRule): string | null {
  switch (rule.type) {
    case 'required':
      return validateRequired(value, rule);
    
    case 'minLength':
      return validateMinLength(value, rule);
    
    case 'maxLength':
      return validateMaxLength(value, rule);
    
    case 'minValue':
      return validateMinValue(value, rule);
    
    case 'maxValue':
      return validateMaxValue(value, rule);
    
    case 'pattern':
      return validatePattern(value, rule);
    
    case 'email':
      return validateEmail(value, rule);
    
    case 'date':
      return validateDate(value, rule);
    
    case 'custom':
      return validateCustom(value, rule);
    
    default:
      return null;
  }
}

function validateRequired(value: any, rule: RequiredRule): string | null {
  const isEmpty = 
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);
  
  if (isEmpty) {
    return rule.message || 'This field is required';
  }
  
  return null;
}

function validateMinLength(value: any, rule: MinLengthRule): string | null {
  if (value === null || value === undefined || value === '') {
    return null; // Skip if empty (use required rule for that)
  }
  
  const length = typeof value === 'string' ? value.length : String(value).length;
  
  if (length < rule.value) {
    return rule.message || `Must be at least ${rule.value} characters`;
  }
  
  return null;
}

function validateMaxLength(value: any, rule: MaxLengthRule): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  const length = typeof value === 'string' ? value.length : String(value).length;
  
  if (length > rule.value) {
    return rule.message || `Must be no more than ${rule.value} characters`;
  }
  
  return null;
}

function validateMinValue(value: any, rule: MinValueRule): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return 'Must be a valid number';
  }
  
  if (numValue < rule.value) {
    return rule.message || `Must be at least ${rule.value}`;
  }
  
  return null;
}

function validateMaxValue(value: any, rule: MaxValueRule): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return 'Must be a valid number';
  }
  
  if (numValue > rule.value) {
    return rule.message || `Must be no more than ${rule.value}`;
  }
  
  return null;
}

function validatePattern(value: any, rule: PatternRule): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const strValue = String(value);
  
  if (!rule.value.test(strValue)) {
    return rule.message || 'Invalid format';
  }
  
  return null;
}

function validateEmail(value: any, rule: EmailRule): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(String(value))) {
    return rule.message || 'Invalid email address';
  }
  
  return null;
}

function validateDate(value: any, rule: DateRule): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const date = value instanceof Date ? value : new Date(value);
  
  if (isNaN(date.getTime())) {
    return rule.message || 'Invalid date';
  }
  
  if (rule.minDate && date < rule.minDate) {
    return rule.message || `Date must be after ${rule.minDate.toLocaleDateString()}`;
  }
  
  if (rule.maxDate && date > rule.maxDate) {
    return rule.message || `Date must be before ${rule.maxDate.toLocaleDateString()}`;
  }
  
  return null;
}

function validateCustom(value: any, rule: CustomRule): string | null {
  if (!rule.validator(value)) {
    return rule.message || 'Invalid value';
  }
  
  return null;
}

/**
 * Validate multiple fields
 */
export function validateForm(fields: Record<string, FieldValidation>): ValidationResult {
  const errors: Record<string, string> = {};
  
  for (const [fieldName, field] of Object.entries(fields)) {
    const error = validateField(field.value, field.rules);
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Create validation rules builder for common patterns
 */
export const rules = {
  required: (message?: string): RequiredRule => ({
    type: 'required',
    message,
  }),
  
  minLength: (value: number, message?: string): MinLengthRule => ({
    type: 'minLength',
    value,
    message,
  }),
  
  maxLength: (value: number, message?: string): MaxLengthRule => ({
    type: 'maxLength',
    value,
    message,
  }),
  
  minValue: (value: number, message?: string): MinValueRule => ({
    type: 'minValue',
    value,
    message,
  }),
  
  maxValue: (value: number, message?: string): MaxValueRule => ({
    type: 'maxValue',
    value,
    message,
  }),
  
  pattern: (value: RegExp, message?: string): PatternRule => ({
    type: 'pattern',
    value,
    message,
  }),
  
  email: (message?: string): EmailRule => ({
    type: 'email',
    message,
  }),
  
  date: (minDate?: Date, maxDate?: Date, message?: string): DateRule => ({
    type: 'date',
    minDate,
    maxDate,
    message,
  }),
  
  custom: (validator: (value: any) => boolean, message?: string): CustomRule => ({
    type: 'custom',
    validator,
    message,
  }),
};

/**
 * Hook-friendly validation helper
 */
export function createValidator(fields: Record<string, ValidationRule[]>) {
  return (values: Record<string, any>): ValidationResult => {
    const fieldValidations: Record<string, FieldValidation> = {};
    
    for (const [fieldName, rules] of Object.entries(fields)) {
      fieldValidations[fieldName] = {
        value: values[fieldName],
        rules,
      };
    }
    
    return validateForm(fieldValidations);
  };
}

/**
 * Get user-friendly error message for common validation errors
 */
export function getErrorMessage(error: Error): string {
  // Check for validation errors
  if (error.name === 'ValidationError') {
    return error.message;
  }
  
  // Check for network errors
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Check for timeout errors
  if (error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // Check for database errors
  if (error.message.includes('database') || error.message.includes('IndexedDB')) {
    return 'Database error. Your data may not have been saved.';
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
}
