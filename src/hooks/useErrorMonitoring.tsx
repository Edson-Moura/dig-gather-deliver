import { useEffect, useState } from 'react';
import { errorHandler } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

interface ErrorStats {
  totalErrors: number;
  criticalErrors: number;
  lastError: Date | null;
  errorRate: number; // errors per minute
}

export const useErrorMonitoring = () => {
  const [errorStats, setErrorStats] = useState<ErrorStats>({
    totalErrors: 0,
    criticalErrors: 0,
    lastError: null,
    errorRate: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let errorCount = 0;
    let criticalErrorCount = 0;
    let startTime = Date.now();
    
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Override console.error to capture all errors
    console.error = (...args) => {
      errorCount++;
      
      // Check if it's a critical error based on keywords
      const message = args.join(' ').toLowerCase();
      if (message.includes('critical') || message.includes('fatal') || 
          message.includes('crash') || message.includes('🚨')) {
        criticalErrorCount++;
      }

      const now = new Date();
      const minutesElapsed = (now.getTime() - startTime) / (1000 * 60);
      const rate = minutesElapsed > 0 ? errorCount / minutesElapsed : 0;

      setErrorStats({
        totalErrors: errorCount,
        criticalErrors: criticalErrorCount,
        lastError: now,
        errorRate: rate
      });

      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      errorCount++;
      
      const now = new Date();
      const minutesElapsed = (now.getTime() - startTime) / (1000 * 60);
      const rate = minutesElapsed > 0 ? errorCount / minutesElapsed : 0;

      setErrorStats(prev => ({
        ...prev,
        totalErrors: errorCount,
        lastError: now,
        errorRate: rate
      }));

      originalConsoleWarn.apply(console, args);
    };

    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorHandler.handleError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          action: 'unhandledPromiseRejection',
          component: 'useErrorMonitoring'
        }
      );
    };

    // Listen for global errors
    const handleGlobalError = (event: ErrorEvent) => {
      errorHandler.handleError(
        event.error || new Error(event.message),
        {
          action: 'globalError',
          component: 'useErrorMonitoring',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    setIsMonitoring(true);
    logger.info('Error monitoring started', undefined, 'useErrorMonitoring');

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
      setIsMonitoring(false);
      logger.info('Error monitoring stopped', undefined, 'useErrorMonitoring');
    };
  }, []);

  const resetStats = () => {
    setErrorStats({
      totalErrors: 0,
      criticalErrors: 0,
      lastError: null,
      errorRate: 0
    });
    logger.info('Error stats reset', undefined, 'useErrorMonitoring');
  };

  const getHealthStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (errorStats.criticalErrors > 0 || errorStats.errorRate > 10) {
      return 'critical';
    } else if (errorStats.totalErrors > 5 || errorStats.errorRate > 5) {
      return 'warning';
    }
    return 'healthy';
  };

  return {
    errorStats,
    isMonitoring,
    resetStats,
    healthStatus: getHealthStatus()
  };
};