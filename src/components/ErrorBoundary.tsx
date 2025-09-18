import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandler, ErrorCategory, ErrorSeverity } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = errorHandler.handleError(error, {
      action: 'componentDidCatch',
      component: 'ErrorBoundary',
      metadata: {
        errorInfo: errorInfo.componentStack,
        errorId: this.state.errorId
      }
    });

    logger.error('React Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    }, 'ErrorBoundary');

    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: sendToErrorReportingService(appError);
    }
  }

  handleReload = () => {
    logger.userAction('Error boundary reload attempted', undefined, { errorId: this.state.errorId });
    window.location.reload();
  };

  handleRetry = () => {
    logger.userAction('Error boundary retry attempted', undefined, { errorId: this.state.errorId });
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl">Oops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado. Nossa equipe foi notificada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-muted p-3 rounded-md text-sm font-mono text-muted-foreground overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
              
              {this.state.errorId && (
                <div className="text-xs text-muted-foreground text-center">
                  ID do Erro: {this.state.errorId}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry}
                  variant="outline" 
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center mt-4">
                Se o problema persistir, entre em contato com o suporte.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}