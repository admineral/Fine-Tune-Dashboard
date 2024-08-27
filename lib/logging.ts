import chalk from 'chalk';
import { FineTuningJob } from '@/types/fine-tuning';

// Log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Determine if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production';

// Current log level
const currentLogLevel = isProduction ? LogLevel.WARN : LogLevel.DEBUG;

/**
 * Generic logging function with optional data
 * @param level Log level
 * @param message Message to log
 * @param data Additional data to log (optional)
 */
function log(level: LogLevel, message: string, data?: unknown): void {
  if (level >= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    let colorFunc: (text: string) => string;
    switch (level) {
      case LogLevel.DEBUG:
        colorFunc = chalk.gray;
        break;
      case LogLevel.INFO:
        colorFunc = chalk.blue;
        break;
      case LogLevel.WARN:
        colorFunc = chalk.yellow;
        break;
      case LogLevel.ERROR:
        colorFunc = chalk.red;
        break;
    }

    console.log(colorFunc(logMessage));
    if (data && !isProduction) {
      console.dir(data, { depth: null, colors: true });
    }
  }
}

/**
 * Logs API request details
 * @param method HTTP method of the request
 * @param action The action being performed
 * @param customApiKey Whether a custom API key is being used
 */
export function logRequest(method: string, action: string | null, customApiKey: boolean): void {
  log(LogLevel.INFO, `[OpenAI API Request] ${method} | Action: ${action || 'unknown'}`, {
    customApiKey,
    timestamp: new Date().toISOString(),
  });
}

interface LogResponseSummary {
  action: string;
  status: number;
  duration: string;
  totalJobs?: number;
  jobsSummary?: string;
  resultSummary?: string;
}

/**
 * Logs API response details
 * @param action The action that was performed
 * @param status HTTP status code of the response
 * @param duration Duration of the request in milliseconds
 * @param result The response data (optional)
 */
export function logResponse(action: string, status: number, duration: number, result?: unknown): void {
  const level = status >= 200 && status < 300 ? LogLevel.INFO : LogLevel.WARN;
  const summary: LogResponseSummary = {
    action,
    status,
    duration: `${duration.toFixed(2)}ms`,
  };

  if (action === 'listFineTuningJobs' && result && typeof result === 'object' && 'jobs' in result) {
    const typedResult = result as { totalJobs?: number; jobs: FineTuningJob[] };
    summary.totalJobs = typedResult.totalJobs || typedResult.jobs.length;
    summary.jobsSummary = summarizeJobs(typedResult.jobs);
  } else if (result) {
    summary.resultSummary = summarizeResult(result);
  }

  log(level, `[OpenAI API Response]`, summary);
}

function summarizeJobs(jobs: FineTuningJob[]): string {
  const statusCounts: Record<string, number> = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(statusCounts)
    .map(([status, count]) => `${status}: ${count}`)
    .join(', ');
}

function summarizeResult(result: unknown): string {
  if (Array.isArray(result)) {
    return `Array with ${result.length} items`;
  } else if (typeof result === 'object' && result !== null) {
    const keys = Object.keys(result);
    return `Object with keys: ${keys.join(', ')}`;
  } else {
    return String(result).slice(0, 100) + (String(result).length > 100 ? '...' : '');
  }
}

/**
 * Logs error details
 * @param method HTTP method of the request
 * @param action The action being performed
 * @param error The error object
 */
export function logError(method: string, action: string, error: unknown): void {
  const summary = {
    method,
    action,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorType: error instanceof Error ? error.constructor.name : typeof error
  };
  log(LogLevel.ERROR, `[OpenAI API Error]`, { ...summary, error });
}

/**
 * Logs server action details
 * @param action The action being performed
 * @param method HTTP method of the request
 * @param data The data associated with the action (optional)
 */
export function logServerAction(action: string, method: string, data?: unknown): void {
  log(LogLevel.DEBUG, `[Server Action] ${action} | Method: ${method}`, data);
}