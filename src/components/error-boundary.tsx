"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MaestroError } from '@/lib/errors';
import { ErrorDisplay } from '@/components/ui/error-display';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: MaestroError | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Transform any error into a MaestroError
    const maestroError = MaestroError.fromUnknown(error, {
      source: 'ErrorBoundary',
      timestamp: new Date().toISOString()
    });

    return {
      hasError: true,
      error: maestroError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging (maintains existing console logging pattern)
    console.error('Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Log the MaestroError details if available
    if (this.state.error?.data.shouldLog) {
      console.error('MaestroError details:', {
        code: this.state.error.data.code,
        severity: this.state.error.data.severity,
        userMessage: this.state.error.data.userMessage,
        context: this.state.error.data.context
      });
    }

    // TODO: In the future, this could report to an error tracking service
    // if (this.state.error?.data.shouldReport) {
    //   errorReportingService.report(this.state.error);
    // }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error display using our ErrorDisplay component
      return (
        <ErrorDisplay
          error={this.state.error}
          onRetry={this.handleRetry}
          onRefresh={this.handleRefresh}
        />
      );
    }

    return this.props.children;
  }
}