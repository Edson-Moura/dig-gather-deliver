export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info', 
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  component?: string;
  userId?: string;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  
  private constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    context?: Record<string, any>,
    component?: string,
    userId?: string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      context,
      component,
      userId
    };
  }

  private formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const component = entry.component ? `[${entry.component}]` : '';
    const userId = entry.userId ? `[User: ${entry.userId}]` : '';
    
    let formatted = `${timestamp} ${component}${userId} ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    return formatted;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warn and error
    return level === LogLevel.WARN || level === LogLevel.ERROR;
  }

  debug(message: string, context?: Record<string, any>, component?: string, userId?: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, component, userId);
    console.log(`🐛 ${this.formatLog(entry)}`);
  }

  info(message: string, context?: Record<string, any>, component?: string, userId?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context, component, userId);
    console.info(`ℹ️ ${this.formatLog(entry)}`);
  }

  warn(message: string, context?: Record<string, any>, component?: string, userId?: string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context, component, userId);
    console.warn(`⚠️ ${this.formatLog(entry)}`);
  }

  error(message: string, context?: Record<string, any>, component?: string, userId?: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, component, userId);
    console.error(`❌ ${this.formatLog(entry)}`);
  }

  // Convenience methods for common logging scenarios
  apiCall(method: string, url: string, status: number, duration?: number, userId?: string): void {
    this.info(`API Call: ${method} ${url}`, {
      status,
      duration: duration ? `${duration}ms` : undefined
    }, 'API', userId);
  }

  userAction(action: string, userId?: string, metadata?: Record<string, any>): void {
    this.info(`User Action: ${action}`, metadata, 'USER_ACTION', userId);
  }

  performance(operation: string, duration: number, component?: string): void {
    if (duration > 1000) {
      this.warn(`Slow Operation: ${operation}`, { duration: `${duration}ms` }, component);
    } else {
      this.debug(`Performance: ${operation}`, { duration: `${duration}ms` }, component);
    }
  }

  featureUsage(feature: string, userId?: string, metadata?: Record<string, any>): void {
    this.info(`Feature Used: ${feature}`, metadata, 'FEATURE_USAGE', userId);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Utility function to measure performance
export const measurePerformance = async <T>(
  operation: () => Promise<T> | T,
  operationName: string,
  component?: string
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - start;
    logger.performance(operationName, duration, component);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Failed Operation: ${operationName}`, { 
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : String(error)
    }, component);
    throw error;
  }
};