import React, { ErrorInfo } from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';
import Logger from '../../services/logger.service';
import './ErrorBoundary.css';

interface ErrorFallbackProps extends FallbackProps {
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="error-boundary-container" role="alert">
      <div className="error-boundary-content">
        <div className="error-boundary-icon">⚠️</div>

        <h1 className="error-boundary-title">Oops! Something went wrong</h1>

        <p className="error-boundary-message">
          We encountered an unexpected error. Don't worry, we've logged the
          details and our team will look into it.
        </p>

        {isDevelopment && (
          <details className="error-boundary-details">
            <summary className="error-boundary-summary">
              Technical Details (Development Only)
            </summary>
            <div className="error-boundary-stack">
              <h3>Error Message:</h3>
              <pre>{error.message}</pre>

              {error.stack && (
                <>
                  <h3>Stack Trace:</h3>
                  <pre>{error.stack}</pre>
                </>
              )}
            </div>
          </details>
        )}

        <div className="error-boundary-actions">
          <button
            className="error-boundary-button primary"
            onClick={resetErrorBoundary}
          >
            Try Again
          </button>

          <button
            className="error-boundary-button secondary"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>

          <button
            className="error-boundary-button secondary"
            onClick={() => (window.location.href = '/')}
          >
            Go Home
          </button>
        </div>

        <div className="error-boundary-help">
          <p>
            If this problem persists, please contact support with the error ID:
            <code className="error-boundary-error-id">
              {error.name}-{Date.now().toString(36)}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

const handleError = (error: Error, errorInfo: ErrorInfo) => {
  Logger.error('React Error Boundary caught an error', error, {
    componentStack: errorInfo.componentStack || 'No component stack available',
    errorName: error.name,
    errorMessage: error.message,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: 'unknown',
  });

  if (import.meta.env.PROD) {
    Logger.warn('Error sent to monitoring service', {
      errorId: `${error.name}-${Date.now().toString(36)}`,
    });
  }
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onReset?: () => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onReset,
}) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={handleError}
      onReset={onReset}
      resetKeys={[window.location.pathname]}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
