import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import { nhost } from './lib/nhost';
import App from './App';
import './index.css';

// TypeScript interfaces for Error Boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// Error boundary component for better error handling
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('App Error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md text-center">
            <h2 className="text-red-400 text-lg font-semibold mb-2">Something went wrong!</h2>
            <p className="text-red-300 text-sm mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = createRoot(document.getElementById('root')!);

// Main app render with Nhost providers
root.render(
  <StrictMode>
    <ErrorBoundary>
      <NhostProvider nhost={nhost}>
        <NhostApolloProvider nhost={nhost}>
          <App />
        </NhostApolloProvider>
      </NhostProvider>
    </ErrorBoundary>
  </StrictMode>
);