import OpenAI from 'openai';

export type FineTuningJobStatus = 'validating_files' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface FineTuningJob extends Omit<OpenAI.FineTuning.FineTuningJob, 'status'> {
  status: FineTuningJobStatus;
  estimated_finish: number | null;
}

export interface FineTuningEvent extends OpenAI.FineTuning.FineTuningJobEvent {
  // Remove the additional properties
}

export interface FineTuningEventResponse {
  object: 'list';
  data: FineTuningEvent[];
  has_more: boolean;
}

export interface FineTuningCheckpoint {
  id: string;
  object: 'fine_tuning.job.checkpoint';
  created_at: number;
  fine_tuned_model_checkpoint: string;
  step_number: number;
  metrics: {
    step?: number;
    train_loss?: number;
    train_mean_token_accuracy?: number;
    valid_loss?: number;
    valid_mean_token_accuracy?: number;
    full_valid_loss?: number;
    full_valid_mean_token_accuracy?: number;
  };
  fine_tuning_job_id: string;
}

export interface FineTuningIntegration extends OpenAI.FineTuning.FineTuningJobIntegration {}

export interface CreateFineTuningJobRequest extends OpenAI.FineTuning.JobCreateParams {
  seed?: number | null;
}

export interface ListFineTuningJobsRequest extends OpenAI.FineTuning.JobListParams {}

export interface ListFineTuningEventsRequest extends OpenAI.FineTuning.JobListEventsParams {}

export interface ListFineTuningCheckpointsRequest {
  after?: string;
  limit?: number;
}

export interface FineTuningJobResponse {
  object: 'list';
  data: FineTuningJob[];
  has_more: boolean;
}

export interface FineTuningEventResponse {
  object: 'list';
  data: FineTuningEvent[];
  has_more: boolean;
}

export interface FineTuningCheckpointResponse {
  object: 'list';
  data: FineTuningCheckpoint[];
  has_more: boolean;
  first_id?: string;
  last_id?: string;
}

export type FineTuningApiError = {
  message: string;
  type?: string;
  param?: string | null;
  code?: string | null;
};

export interface APIErrorResponse {
  error: FineTuningApiError;
  code: string;
  details?: any;
}

export interface FineTuningErrorDetails {
  message: string;
  action: string;
  code: string;
  details?: any;
  response?: APIErrorResponse;
}

// Additional types from the API route version

export const SUPPORTED_MODELS = ['gpt-4o-mini-2024-07-18', 'gpt-4o-2024-08-06'] as const;
export type SupportedModel = typeof SUPPORTED_MODELS[number];

export type FineTuningAction = 
  | 'createFineTuningJob'
  | 'listFineTuningJobs'
  | 'retrieveFineTuningJob'
  | 'cancelFineTuningJob'
  | 'listFineTuningEvents'
  | 'listFineTuningCheckpoints';

export type HandleRequestResponse = FineTuningJobResponse | FineTuningEventResponse | FineTuningJob | FineTuningCheckpointResponse;

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

// Configuration constants
export const DEFAULT_HYPERPARAMETERS: Required<CreateFineTuningJobRequest['hyperparameters']> = {
  n_epochs: 'auto',
  batch_size: 'auto',
  learning_rate_multiplier: 'auto'
};

export const MAX_SUFFIX_LENGTH = 64;