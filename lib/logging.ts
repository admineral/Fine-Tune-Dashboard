/****************************************************************************
 * lib/logging.ts
 * 
 * Logging Utilities
 * 
 * This file contains utility functions for logging API requests, responses,
 * and errors in a consistent and colorful format.
 ****************************************************************************/

// ANSI color codes for console logging
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    fg: {
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
    },
    bg: {
      black: "\x1b[40m",
      red: "\x1b[41m",
      green: "\x1b[42m",
      yellow: "\x1b[43m",
      blue: "\x1b[44m",
      magenta: "\x1b[45m",
      cyan: "\x1b[46m",
      white: "\x1b[47m",
    }
  };
  
  /**
   * Logs API request details
   * @param method HTTP method of the request
   * @param action The action being performed
   * @param customApiKey Whether a custom API key is being used
   */
  export function logRequest(method: string, action: string | null, customApiKey: boolean): void {
    console.log(`${colors.fg.cyan}${colors.bright}[OpenAI API Request]${colors.reset}`);
    console.log(`${colors.fg.green}${method}${colors.reset} | ${colors.fg.yellow}Action:${colors.reset} ${action || 'unknown'}`);
    console.log(`${colors.dim}Custom API Key: ${customApiKey ? 'Yes' : 'No'}`);
    console.log(`${colors.dim}Timestamp: ${new Date().toISOString()}${colors.reset}\n`);
  }
  
  /**
   * Logs API response details
   * @param action The action that was performed
   * @param status HTTP status code of the response
   * @param duration Duration of the request in milliseconds
   * @param result The response data (optional)
   */
  export function logResponse(action: string, status: number, duration: number, result?: any): void {
    const statusColor = status >= 200 && status < 300 ? colors.fg.green : colors.fg.red;
    console.log(`${colors.fg.magenta}${colors.bright}[OpenAI API Response]${colors.reset}`);
    console.log(`${colors.fg.yellow}Action:${colors.reset} ${action} | ${statusColor}Status: ${status}${colors.reset} | ${colors.fg.blue}Duration: ${duration.toFixed(2)}ms${colors.reset}`);
    if (result) {
      const resultSummary = JSON.stringify(result).substring(0, 100) + (JSON.stringify(result).length > 100 ? '...' : '');
      console.log(`${colors.dim}Result: ${resultSummary}${colors.reset}\n`);
    }
  }
  
  /**
   * Logs error details
   * @param method HTTP method of the request
   * @param action The action being performed
   * @param error The error object
   */
  export function logError(method: string, action: string, error: any): void {
    console.error(`${colors.fg.red}${colors.bright}[OpenAI API Error]${colors.reset}`);
    console.error(`${colors.fg.yellow}Method:${colors.reset} ${method} | ${colors.fg.yellow}Action:${colors.reset} ${action}`);
    console.error(`${colors.fg.red}${error.message}${colors.reset}`);
    
    if (error.name === 'APIError') {
      if (error.details) {
        console.error(`${colors.dim}Details: ${JSON.stringify(error.details)}${colors.reset}`);
      }
      if (error.apiResponse) {
        const responseSummary = JSON.stringify(error.apiResponse).substring(0, 100) + (JSON.stringify(error.apiResponse).length > 100 ? '...' : '');
        console.error(`${colors.dim}OpenAI API Response: ${responseSummary}${colors.reset}`);
      }
    }
    
    if (error.stack) {
      console.error(`${colors.dim}${error.stack.split('\n')[0]}${colors.reset}\n`);
    }
  }
  
  /**
   * Logs server action details
   * @param action The action being performed
   * @param method HTTP method of the request
   * @param data The data associated with the action (optional)
   */
  export function logServerAction(action: string, method: string, data?: any): void {
    console.log(`${colors.fg.cyan}${colors.bright}[Server Action] ${colors.reset}${colors.fg.yellow}${action}${colors.reset}`);
    console.log(`${colors.dim}Method: ${method}${colors.reset}`);
    if (data) {
      const dataSummary = JSON.stringify(data).substring(0, 100) + (JSON.stringify(data).length > 100 ? '...' : '');
      console.log(`${colors.dim}Data: ${dataSummary}${colors.reset}`);
    }
    console.log(`${colors.dim}Timestamp: ${new Date().toISOString()}${colors.reset}\n`);
  }