import { useState, useCallback, useEffect } from 'react';
import { validateField, ValidationRule, ValidationResult } from '@/lib/utils/form-validation';

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  initialValues?: Record<string, any>;
  validationRules: Record<string, ValidationRule[]>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
}

export interface UseFormValidationReturn {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: string, value: any) => void;
  handleBlur: (field: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  resetForm: () => void;
  validateForm: () => ValidationResult;
}

/**
 * Custom hook for form validation with real-time feedback
 */
export function useFormValidation(
  options: UseFormValidationOptions
): UseFormValidationReturn {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    initialValues = {},
    validationRules,
    onSubmit,
  } = options;

  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateSingleField = useCallback(
    (field: string, value: any): string | null => {
      const rules = validationRules[field];
      if (!rules) return null;
      
      return validateField(value, rules);
    },
    [validationRules]
  );

  // Validate all fields
  const validateAllFields = useCallback((): ValidationResult => {
    const newErrors: Record<string, string> = {};
    
    for (const [field, rules] of Object.entries(validationRules)) {
      const value = values[field];
      const error = validateField(value, rules);
      if (error) {
        newErrors[field] = error;
      }
    }
    
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }, [validationRules, values]);

  // Handle field change
  const handleChange = useCallback(
    (field: string, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
      
      // Validate on change if enabled and field has been touched
      if (validateOnChange && touched[field]) {
        const error = validateSingleField(field, value);
        setErrors(prev => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[field] = error;
          } else {
            delete newErrors[field];
          }
          return newErrors;
        });
      }
    },
    [validateOnChange, touched, validateSingleField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: string) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      
      // Validate on blur if enabled
      if (validateOnBlur) {
        const error = validateSingleField(field, values[field]);
        setErrors(prev => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[field] = error;
          } else {
            delete newErrors[field];
          }
          return newErrors;
        });
      }
    },
    [validateOnBlur, values, validateSingleField]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      // Mark all fields as touched
      const allTouched = Object.keys(validationRules).reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {}
      );
      setTouched(allTouched);
      
      // Validate all fields
      const validation = validateAllFields();
      setErrors(validation.errors);
      
      if (!validation.isValid) {
        return;
      }
      
      // Submit if valid
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          // Error handling is done by the caller
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validationRules, validateAllFields, onSubmit, values]
  );

  // Set field value programmatically
  const setFieldValue = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Set field touched programmatically
  const setFieldTouched = useCallback((field: string, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateForm: validateAllFields,
  };
}
