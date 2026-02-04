/**
 * Logger Utility
 *
 * Provides structured logging with JSON format, contextual metadata,
 * and environment-appropriate log levels for better debugging and monitoring.
 *
 * Features:
 * - JSON structured logging for better parsing
 * - Timestamp and correlation ID support
 * - Context-aware logging (API route, operation, user info)
 * - Environment-based configuration
 * - Support for multiple log levels (info, error, warn, debug)
 */

interface LogContext {
  operation?: string;
  userId?: string;
  correlationId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: "info" | "error" | "warn" | "debug";
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  environment: string;
}

/**
 * Core logger class with structured JSON output
 */
class Logger {
  private environment: string;
  private isDevelopment: boolean;

  constructor() {
    this.environment = process.env.NODE_ENV || "development";
    this.isDevelopment = this.environment === "development";
  }

  /**
   * Generate correlation ID for request tracing
   */
  generateCorrelationId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogEntry["level"],
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: this.environment,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        code: (error as unknown as { code?: string }).code,
      };

      // Include stack trace in development or for debugging
      if (this.isDevelopment || level === "error") {
        entry.error.stack = error.stack;
      }
    }

    return entry;
  }

  /**
   * Output log to console (in production, this would go to a logging service)
   */
  private output(entry: LogEntry): void {
    const logString = JSON.stringify(entry, null, this.isDevelopment ? 2 : 0);

    switch (entry.level) {
      case "error":
        console.error(logString);
        break;
      case "warn":
        console.warn(logString);
        break;
      case "debug":
        if (this.isDevelopment) {
          console.debug(logString);
        }
        break;
      default:
        console.log(logString);
    }
  }

  /**
   * Log info level messages
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry("info", message, context);
    this.output(entry);
  }

  /**
   * Log error level messages with optional error object
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry("error", message, context, error);
    this.output(entry);
  }

  /**
   * Log warning level messages
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry("warn", message, context);
    this.output(entry);
  }

  /**
   * Log debug level messages (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const entry = this.createLogEntry("debug", message, context);
      this.output(entry);
    }
  }

  /**
   * Log API request start
   */
  logApiRequest(
    method: string,
    path: string,
    context?: Partial<LogContext>
  ): string {
    const correlationId = this.generateCorrelationId();

    this.info(`API Request: ${method} ${path}`, {
      ...context,
      correlationId,
      method,
      path,
      operation: "api_request_start",
    });

    return correlationId;
  }

  /**
   * Log API request completion
   */
  logApiResponse(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
    correlationId?: string,
    context?: Partial<LogContext>
  ): void {
    this.info(
      `API Response: ${method} ${path} - ${statusCode} (${responseTime}ms)`,
      {
        ...context,
        correlationId,
        method,
        path,
        statusCode,
        responseTime,
        operation: "api_request_complete",
      }
    );
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other modules
export type { LogContext };
