import { toast } from '@/hooks/use-toast';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth', 
  VALIDATION = 'validation',
  SUBSCRIPTION = 'subscription',
  DATABASE = 'database',
  API = 'api',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export interface AppError {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: ErrorContext;
  originalError?: Error;
  timestamp: Date;
  shouldNotifyUser: boolean;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | AppError | string, context?: ErrorContext): AppError {
    let appError: AppError;

    if (typeof error === 'string') {
      appError = this.createAppError(error, ErrorSeverity.MEDIUM, ErrorCategory.UNKNOWN, context);
    } else if (error instanceof Error) {
      appError = this.createAppErrorFromError(error, context);
    } else {
      appError = error;
    }

    // Log error
    this.logError(appError);

    // Notify user if needed
    if (appError.shouldNotifyUser) {
      this.notifyUser(appError);
    }

    return appError;
  }

  private createAppError(
    message: string, 
    severity: ErrorSeverity, 
    category: ErrorCategory, 
    context?: ErrorContext
  ): AppError {
    return {
      message,
      severity,
      category,
      context,
      timestamp: new Date(),
      shouldNotifyUser: severity !== ErrorSeverity.LOW
    };
  }

  private createAppErrorFromError(error: Error, context?: ErrorContext): AppError {
    const category = this.categorizeError(error);
    const severity = this.assessSeverity(error, category);

    return {
      message: error.message,
      severity,
      category,
      context,
      originalError: error,
      timestamp: new Date(),
      shouldNotifyUser: severity !== ErrorSeverity.LOW
    };
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return ErrorCategory.AUTH;
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorCategory.NETWORK;
    }
    
    if (message.includes('subscription') || message.includes('stripe') || message.includes('checkout')) {
      return ErrorCategory.SUBSCRIPTION;
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return ErrorCategory.VALIDATION;
    }
    
    if (message.includes('database') || message.includes('supabase') || message.includes('sql')) {
      return ErrorCategory.DATABASE;
    }
    
    if (message.includes('api') || message.includes('function')) {
      return ErrorCategory.API;
    }
    
    return ErrorCategory.UNKNOWN;
  }

  private assessSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    // Critical errors that break core functionality
    if (message.includes('auth') && message.includes('failed') || 
        message.includes('payment') && message.includes('failed')) {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity - important features affected
    if (category === ErrorCategory.SUBSCRIPTION || 
        category === ErrorCategory.DATABASE ||
        message.includes('cannot') || message.includes('failed to save')) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium severity - user-facing issues
    if (category === ErrorCategory.NETWORK || 
        category === ErrorCategory.VALIDATION ||
        category === ErrorCategory.API) {
      return ErrorSeverity.MEDIUM;
    }
    
    return ErrorSeverity.LOW;
  }

  private logError(appError: AppError): void {
    const logData = {
      timestamp: appError.timestamp.toISOString(),
      message: appError.message,
      category: appError.category,
      severity: appError.severity,
      context: appError.context,
      stack: appError.originalError?.stack
    };

    switch (appError.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH SEVERITY:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY:', logData);
        break;
      case ErrorSeverity.LOW:
        console.log('ℹ️ LOW SEVERITY:', logData);
        break;
    }
  }

  private notifyUser(appError: AppError): void {
    const userMessage = this.getUserFriendlyMessage(appError);
    
    const variant = appError.severity === ErrorSeverity.CRITICAL || 
                   appError.severity === ErrorSeverity.HIGH 
                   ? 'destructive' as const 
                   : 'default' as const;

    toast({
      title: "Erro",
      description: userMessage,
      variant,
    });
  }

  private getUserFriendlyMessage(appError: AppError): string {
    switch (appError.category) {
      case ErrorCategory.NETWORK:
        return "Problema de conexão. Verifique sua internet e tente novamente.";
      case ErrorCategory.AUTH:
        return "Erro de autenticação. Faça login novamente.";
      case ErrorCategory.SUBSCRIPTION:
        return "Erro no sistema de assinatura. Tente novamente em alguns instantes.";
      case ErrorCategory.VALIDATION:
        return "Dados inválidos. Verifique as informações e tente novamente.";
      case ErrorCategory.DATABASE:
        return "Erro interno. Nossa equipe foi notificada.";
      case ErrorCategory.API:
        return "Serviço temporariamente indisponível. Tente novamente.";
      default:
        return "Algo deu errado. Tente novamente.";
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions for common error scenarios
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    errorHandler.handleError(error as Error, context);
    return null;
  }
};

export const createError = (
  message: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: ErrorContext
): AppError => {
  return {
    message,
    category,
    severity,
    context,
    timestamp: new Date(),
    shouldNotifyUser: severity !== ErrorSeverity.LOW
  };
};