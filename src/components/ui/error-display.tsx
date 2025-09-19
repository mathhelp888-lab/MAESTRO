"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaestroError, ErrorSeverity } from '@/lib/errors';

interface ErrorDisplayProps {
  error: MaestroError;
  onRetry?: () => void;
  onRefresh?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onRetry, onRefresh, onDismiss }: ErrorDisplayProps) {
  const { data } = error;

  // Determine alert variant based on severity
  const getAlertVariant = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Get appropriate icon for severity
  const getIcon = () => {
    return <AlertTriangle className="h-4 w-4" />;
  };

  const handleRecoveryAction = (actionType: string) => {
    switch (actionType) {
      case 'retry':
        onRetry?.();
        break;
      case 'refresh':
        onRefresh?.();
        break;
      case 'manual':
        onDismiss?.();
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getIcon()}
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={getAlertVariant(data.severity)}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Code: {data.code}</AlertTitle>
            <AlertDescription className="mt-2">
              {data.userMessage}
            </AlertDescription>
          </Alert>

          {/* Recovery Actions */}
          {data.recoveryActions && data.recoveryActions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">What would you like to do?</p>
              <div className="flex flex-col gap-2">
                {data.recoveryActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? 'default' : 'outline'}
                    onClick={() => {
                      if (action.action) {
                        action.action();
                      } else {
                        handleRecoveryAction(action.type);
                      }
                    }}
                    className="w-full"
                  >
                    {action.type === 'retry' && <RotateCcw className="w-4 h-4 mr-2" />}
                    {action.type === 'refresh' && <RefreshCw className="w-4 h-4 mr-2" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Default actions if no recovery actions provided */}
          {(!data.recoveryActions || data.recoveryActions.length === 0) && (
            <div className="flex flex-col gap-2">
              {onRetry && (
                <Button onClick={onRetry} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              {onRefresh && (
                <Button variant="outline" onClick={onRefresh} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              )}
            </div>
          )}

          {/* Technical details (collapsed by default, for development) */}
          {process.env.NODE_ENV === 'development' && data.technicalDetails && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Technical Details
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                {data.technicalDetails}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}