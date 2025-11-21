'use client';

/**
 * Example component demonstrating error handling and form validation features
 * This file serves as documentation for how to use the error handling system
 */

import { useState } from 'react';
import { PageErrorBoundary, FormErrorBoundary } from '../error-boundary';
import { useToast } from '../ui/toast';
import { useFormValidation } from '@/hooks/use-form-validation';
import { rules } from '@/lib/utils/form-validation';
import { retry } from '@/lib/utils/retry';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

/**
 * Example 1: Using Error Boundaries
 */
function ErrorBoundaryExample() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('This is a test error!');
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Error Boundary Example</h3>
      <p className="text-gray-600 mb-4">
        Click the button to trigger an error and see the error boundary in action.
      </p>
      <Button onClick={() => setShouldError(true)} variant="destructive">
        Trigger Error
      </Button>
    </Card>
  );
}

/**
 * Example 2: Using Toast Notifications
 */
function ToastExample() {
  const { addToast } = useToast();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Toast Notifications Example</h3>
      <p className="text-gray-600 mb-4">
        Click the buttons to see different types of toast notifications.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            addToast({
              type: 'success',
              title: 'Success!',
              description: 'Your action was completed successfully.',
            })
          }
          variant="default"
        >
          Success Toast
        </Button>
        
        <Button
          onClick={() =>
            addToast({
              type: 'error',
              title: 'Error',
              description: 'Something went wrong. Please try again.',
            })
          }
          variant="destructive"
        >
          Error Toast
        </Button>
        
        <Button
          onClick={() =>
            addToast({
              type: 'warning',
              title: 'Warning',
              description: 'Please review your input before continuing.',
            })
          }
          variant="secondary"
        >
          Warning Toast
        </Button>
        
        <Button
          onClick={() =>
            addToast({
              type: 'info',
              title: 'Info',
              description: 'Here is some helpful information.',
            })
          }
          variant="secondary"
        >
          Info Toast
        </Button>
        
        <Button
          onClick={() =>
            addToast({
              type: 'success',
              title: 'Action Available',
              description: 'You can undo this action.',
              action: {
                label: 'Undo',
                onClick: () => alert('Undo clicked!'),
              },
            })
          }
          variant="default"
        >
          Toast with Action
        </Button>
      </div>
    </Card>
  );
}

/**
 * Example 3: Using Form Validation
 */
function FormValidationExample() {
  const { addToast } = useToast();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation({
    initialValues: {
      name: '',
      email: '',
      age: '',
    },
    validationRules: {
      name: [rules.required('Name is required'), rules.minLength(2, 'Name must be at least 2 characters')],
      email: [rules.required('Email is required'), rules.email('Please enter a valid email')],
      age: [rules.required('Age is required'), rules.minValue(0, 'Age must be positive'), rules.maxValue(120, 'Age must be realistic')],
    },
    onSubmit: async (values) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addToast({
        type: 'success',
        title: 'Form Submitted!',
        description: `Welcome, ${values.name}!`,
      });
    },
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Form Validation Example</h3>
      <p className="text-gray-600 mb-4">
        Fill out the form to see real-time validation in action.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={touched.name && errors.name ? 'border-red-500' : ''}
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={touched.email && errors.email ? 'border-red-500' : ''}
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <Input
            id="age"
            type="number"
            value={values.age}
            onChange={(e) => handleChange('age', e.target.value)}
            onBlur={() => handleBlur('age')}
            className={touched.age && errors.age ? 'border-red-500' : ''}
          />
          {touched.age && errors.age && (
            <p className="mt-1 text-sm text-red-600">{errors.age}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} variant="default">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Card>
  );
}

/**
 * Example 4: Using Retry Mechanism
 */
function RetryExample() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleRetryableOperation = async () => {
    setIsLoading(true);
    
    try {
      // Simulate an operation that might fail
      const result = await retry(
        async () => {
          // Randomly fail 70% of the time
          if (Math.random() < 0.7) {
            throw new Error('Network error');
          }
          return 'Success!';
        },
        {
          maxAttempts: 3,
          delayMs: 500,
          onRetry: (error, attempt) => {
            addToast({
              type: 'warning',
              title: 'Retrying...',
              description: `Attempt ${attempt} failed. Retrying...`,
              duration: 2000,
            });
          },
        }
      );
      
      addToast({
        type: 'success',
        title: 'Operation Successful',
        description: result,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Operation Failed',
        description: 'All retry attempts failed. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Retry Mechanism Example</h3>
      <p className="text-gray-600 mb-4">
        Click the button to simulate an operation with automatic retry on failure.
      </p>
      <Button
        onClick={handleRetryableOperation}
        disabled={isLoading}
        variant="default"
      >
        {isLoading ? 'Processing...' : 'Try Retryable Operation'}
      </Button>
    </Card>
  );
}

/**
 * Main example component showcasing all error handling features
 */
export function ErrorHandlingExamples() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Error Handling & Validation Examples</h1>
        <p className="text-gray-600">
          This page demonstrates the error handling and form validation features available in the application.
        </p>
      </div>

      {/* Error Boundary Example */}
      <PageErrorBoundary>
        <ErrorBoundaryExample />
      </PageErrorBoundary>

      {/* Toast Example */}
      <ToastExample />

      {/* Form Validation Example */}
      <FormErrorBoundary>
        <FormValidationExample />
      </FormErrorBoundary>

      {/* Retry Example */}
      <RetryExample />
    </div>
  );
}
