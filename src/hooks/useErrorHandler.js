// Custom hook for consistent error handling
import { useState, useCallback } from 'react';
import { useToast } from '../components/common/Toast';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleError = useCallback((error, options = {}) => {
    const {
      showToast: shouldShowToast = true,
      toastType = 'error',
      fallbackMessage = 'An unexpected error occurred',
      logError = true
    } = options;

    // Set error state
    setError(error);

    // Log error in development
    if (logError && process.env.NODE_ENV === 'development') {
      console.error('Error handled by useErrorHandler:', error);
    }

    // Show toast notification
    if (shouldShowToast) {
      const message = error?.message || fallbackMessage;
      showToast(message, toastType);
    }

    return error;
  }, [showToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = useCallback(async (asyncFunction, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      return { data: result, error: null };
    } catch (error) {
      handleError(error, options);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const withLoading = useCallback((asyncFunction) => {
    return async (...args) => {
      setIsLoading(true);
      try {
        return await asyncFunction(...args);
      } finally {
        setIsLoading(false);
      }
    };
  }, []);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeAsync,
    withLoading
  };
};

// Higher-order component for error handling
export const withErrorHandling = (WrappedComponent, errorOptions = {}) => {
  return function ErrorHandlingComponent(props) {
    const errorHandler = useErrorHandler();

    return (
      <WrappedComponent
        {...props}
        errorHandler={errorHandler}
        {...errorHandler}
      />
    );
  };
};

// Utility function to create consistent error objects
export const createError = (message, code = null, status = null) => {
  const error = new Error(message);
  if (code) error.code = code;
  if (status) error.status = status;
  return error;
};

// Error types for better categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

export default useErrorHandler;