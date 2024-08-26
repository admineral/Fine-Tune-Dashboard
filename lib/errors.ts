import { FineTuningApiError } from '@/types/fine-tuning';

export class APIError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code: string,
    public details?: any,
    public apiResponse?: FineTuningApiError
  ) {
    super(message);
    this.name = 'APIError';
  }
}