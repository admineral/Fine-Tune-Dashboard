'use server'

/****************************************************************************
 * Fine-Tuning Actions
 * 
 * This file contains server actions for managing fine-tuning jobs using the OpenAI API.
 * It provides functions for creating, listing, retrieving, and canceling fine-tuning jobs,
 * as well as listing fine-tuning events and checkpoints.
 * 
 * The actions use the OpenAI SDK and implement error handling and logging.
 ****************************************************************************/

import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'
import { 
  FineTuningJob, 
  FineTuningEvent, 
  FineTuningCheckpoint, 
  APIErrorResponse, 
  FineTuningJobResponse, 
  FineTuningEventResponse,
  FineTuningCheckpointResponse,
  CreateFineTuningJobRequest,
  ListFineTuningJobsRequest,
  ListFineTuningEventsRequest,
  ListFineTuningCheckpointsRequest,
  FineTuningErrorDetails,
  FineTuningIntegration,
  FineTuningApiError,
  APIError,
  SupportedModel,
  SUPPORTED_MODELS,
  DEFAULT_HYPERPARAMETERS,
  MAX_SUFFIX_LENGTH
} from '@/types/fine-tuning'
import { logRequest, logResponse, logError, logServerAction } from '@/lib/logging'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Custom error class for fine-tuning errors
 */
class FineTuningError extends Error implements FineTuningErrorDetails {
  constructor(
    public message: string, 
    public action: string, 
    public code: string, 
    public details?: any,
    public response?: APIErrorResponse
  ) {
    super(message);
    this.name = 'FineTuningError';
  }
}

/**
 * Generic function to handle API requests
 * @param action The action being performed
 * @param method The HTTP method
 * @param data The request data
 * @returns The API response
 * @throws FineTuningError
 */
async function handleRequest<T>(action: string, method: string, data?: any): Promise<T> {
  const startTime = Date.now();
  
  logServerAction(action, method, data);

  try {
    let result: T;

    switch (action) {
      case 'createFineTuningJob':
        result = await openai.fineTuning.jobs.create(data) as T;
        break;
      case 'listFineTuningJobs':
        result = await openai.fineTuning.jobs.list(data) as T;
        break;
      case 'retrieveFineTuningJob':
        result = await openai.fineTuning.jobs.retrieve(data.jobId) as T;
        break;
      case 'cancelFineTuningJob':
        result = await openai.fineTuning.jobs.cancel(data.jobId) as T;
        break;
      case 'listFineTuningEvents':
        result = await openai.fineTuning.jobs.listEvents(data.jobId, data) as T;
        break;
      case 'listFineTuningCheckpoints':
        result = await openai.fineTuning.jobs.checkpoints.list(data.jobId, data) as T;
        break;
      default:
        throw new FineTuningError('Invalid action', action, 'INVALID_ACTION');
    }

    const duration = Date.now() - startTime;
    logResponse(action, 200, duration, result);
    return result;
  } catch (error) {
    logError(method, action, error);
    if (error instanceof OpenAI.APIError) {
      throw new FineTuningError(
        error.message,
        action,
        error.code || 'OPENAI_API_ERROR',
        { originalError: error },
        {
          error: {
            message: error.message,
            type: error.type || '',
            param: error.param || null,
            code: error.code || null
          },
          code: error.code || 'UNKNOWN'
        }
      );
    } else if (error instanceof Error) {
      throw new FineTuningError(
        'An unexpected error occurred',
        action,
        'UNEXPECTED_ERROR',
        { message: error.message, stack: error.stack }
      );
    } else {
      throw new FineTuningError(
        'An unknown error occurred',
        action,
        'UNKNOWN_ERROR',
        { error: String(error) }
      );
    }
  }
}

/**
 * Creates a new fine-tuning job
 * @param formData The form data containing job parameters
 * @returns The created fine-tuning job
 * @throws FineTuningError
 */
export async function createFineTuningJob(formData: FormData): Promise<FineTuningJob> {
  const rawData = Object.fromEntries(formData);
  const data: Partial<CreateFineTuningJobRequest> = {};

  if (typeof rawData.model === 'string') data.model = rawData.model;
  if (typeof rawData.training_file === 'string') data.training_file = rawData.training_file;
  if (typeof rawData.validation_file === 'string') data.validation_file = rawData.validation_file;
  if (typeof rawData.suffix === 'string') data.suffix = rawData.suffix;
  if (typeof rawData.seed === 'string') data.seed = parseInt(rawData.seed, 10);

  if (typeof rawData.hyperparameters === 'string') {
    try {
      data.hyperparameters = JSON.parse(rawData.hyperparameters);
    } catch (e) {
      console.error('Failed to parse hyperparameters:', e);
    }
  }

  if (typeof rawData.integrations === 'string') {
    try {
      const parsedIntegrations = JSON.parse(rawData.integrations);
      if (Array.isArray(parsedIntegrations)) {
        data.integrations = parsedIntegrations as FineTuningIntegration[];
      }
    } catch (e) {
      console.error('Failed to parse integrations:', e);
    }
  }

  if (!data.model || !data.training_file) {
    throw new FineTuningError('Model and training_file are required', 'createFineTuningJob', 'MISSING_REQUIRED_FIELDS');
  }

  if (!SUPPORTED_MODELS.includes(data.model as SupportedModel)) {
    throw new FineTuningError('Invalid model specified', 'createFineTuningJob', 'INVALID_MODEL');
  }

  if (data.suffix && data.suffix.length > MAX_SUFFIX_LENGTH) {
    throw new FineTuningError(`suffix must be a string with max length ${MAX_SUFFIX_LENGTH}`, 'createFineTuningJob', 'INVALID_SUFFIX');
  }

  const finalHyperparameters = { ...DEFAULT_HYPERPARAMETERS, ...data.hyperparameters };

  try {
    const job = await handleRequest<FineTuningJob>('createFineTuningJob', 'POST', {
      ...data,
      hyperparameters: finalHyperparameters
    });
    revalidatePath('/fine-tuning');
    return job;
  } catch (error) {
    throw error instanceof FineTuningError ? error : new FineTuningError('Failed to create fine-tuning job', 'createFineTuningJob', 'CREATE_JOB_ERROR', error);
  }
}

/**
 * Lists fine-tuning jobs
 * @param params The parameters for listing jobs
 * @returns The list of fine-tuning jobs
 * @throws FineTuningError
 */
export async function listFineTuningJobs(params: ListFineTuningJobsRequest = {}): Promise<FineTuningJobResponse> {
  try {
    return await handleRequest<FineTuningJobResponse>('listFineTuningJobs', 'GET', params);
  } catch (error) {
    throw error instanceof FineTuningError ? error : new FineTuningError('Failed to list fine-tuning jobs', 'listFineTuningJobs', 'LIST_JOBS_ERROR', error);
  }
}

/**
 * Retrieves a specific fine-tuning job
 * @param jobId The ID of the job to retrieve
 * @returns The retrieved fine-tuning job
 * @throws FineTuningError
 */
export async function retrieveFineTuningJob(jobId: string): Promise<FineTuningJob> {
  try {
    return await handleRequest<FineTuningJob>('retrieveFineTuningJob', 'GET', { jobId });
  } catch (error) {
    throw error instanceof FineTuningError ? error : new FineTuningError('Failed to retrieve fine-tuning job', 'retrieveFineTuningJob', 'RETRIEVE_JOB_ERROR', error);
  }
}

/**
 * Cancels a fine-tuning job
 * @param jobId The ID of the job to cancel
 * @returns The cancelled fine-tuning job
 * @throws FineTuningError
 */
export async function cancelFineTuningJob(jobId: string): Promise<FineTuningJob> {
  try {
    const job = await handleRequest<FineTuningJob>('cancelFineTuningJob', 'POST', { jobId });
    revalidatePath('/fine-tuning');
    return job;
  } catch (error) {
    throw error instanceof FineTuningError ? error : new FineTuningError('Failed to cancel fine-tuning job', 'cancelFineTuningJob', 'CANCEL_JOB_ERROR', error);
  }
}

/**
 * Lists events for a fine-tuning job
 * @param jobId The ID of the job
 * @param params Additional parameters for listing events
 * @returns The list of fine-tuning events
 * @throws FineTuningError
 */
export async function listFineTuningEvents(jobId: string, params: Omit<ListFineTuningEventsRequest, 'jobId'> = {}): Promise<FineTuningEvent[]> {
  try {
    const response = await handleRequest<FineTuningEventResponse>('listFineTuningEvents', 'GET', { jobId, ...params });
    return response.data;
  } catch (error) {
    throw error instanceof FineTuningError ? error : new FineTuningError('Failed to list fine-tuning events', 'listFineTuningEvents', 'LIST_EVENTS_ERROR', error);
  }
}

/**
 * Lists checkpoints for a fine-tuning job
 * @param jobId The ID of the job
 * @param params Additional parameters for listing checkpoints
 * @returns The list of fine-tuning checkpoints
 * @throws FineTuningError
 */
export async function listFineTuningCheckpoints(jobId: string, params: Omit<ListFineTuningCheckpointsRequest, 'jobId'> = {}): Promise<FineTuningCheckpoint[]> {
  try {
    const response = await handleRequest<FineTuningCheckpointResponse>('listFineTuningCheckpoints', 'GET', { jobId, ...params });
    return response.data;
  } catch (error) {
    throw error instanceof FineTuningError ? error : new FineTuningError('Failed to list fine-tuning checkpoints', 'listFineTuningCheckpoints', 'LIST_CHECKPOINTS_ERROR', error);
  }
}