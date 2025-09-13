import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import Logger from './services/logger.service';
import './index.css';
import App from './App';

const handleAppErrorBoundaryReset = () => {
  Logger.info(
    'Top-level ErrorBoundary: Reset triggered, reloading application'
  );
  window.location.reload();
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary onReset={handleAppErrorBoundaryReset}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
