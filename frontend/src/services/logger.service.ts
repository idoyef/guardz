import log from 'loglevel';

class LoggerService {
  private static instance: LoggerService;
  private logger = log;

  private constructor() {
    this.initializeLogger();
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private initializeLogger(): void {
    const isDevelopment = import.meta.env.DEV;
    const isTest = import.meta.env.MODE === 'test';

    if (isTest) {
      this.logger.setLevel('SILENT');
    } else if (isDevelopment) {
      this.logger.setLevel('DEBUG');
    } else {
      this.logger.setLevel('WARN');
    }

    this.logger.setDefaultLevel(this.logger.getLevel());

    this.info('Logger initialized', {
      level: this.logger.getLevel(),
      environment: import.meta.env.MODE,
    });
  }

  public debug(message: string, ...args: any[]): void {
    this.logger.debug(`[DEBUG] ${message}`, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.logger.info(`[INFO] ${message}`, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.logger.warn(`[WARN] ${message}`, ...args);
  }

  public error(message: string, error?: Error | any, ...args: any[]): void {
    if (error instanceof Error) {
      this.logger.error(
        `[ERROR] ${message}`,
        {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        ...args
      );
    } else {
      this.logger.error(`[ERROR] ${message}`, error, ...args);
    }
  }

  public logApiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, { data });
  }

  public logApiResponse(
    method: string,
    url: string,
    status: number,
    data?: any
  ): void {
    this.debug(`API Response: ${method.toUpperCase()} ${url} [${status}]`, {
      data,
    });
  }

  public logApiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method.toUpperCase()} ${url}`, error);
  }

  public logUserAction(action: string, details?: any): void {
    this.info(`User Action: ${action}`, details);
  }

  public logComponent(component: string, event: string, details?: any): void {
    this.debug(`Component [${component}]: ${event}`, details);
  }

  public logForm(formName: string, event: string, details?: any): void {
    this.info(`Form [${formName}]: ${event}`, details);
  }

  public logPerformance(
    operation: string,
    duration: number,
    details?: any
  ): void {
    this.debug(`Performance [${operation}]: ${duration}ms`, details);
  }
}

export const Logger = LoggerService.getInstance();
export default Logger;
