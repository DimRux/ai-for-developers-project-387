import axios, { AxiosError } from 'axios';
import type { components } from './types';

type ApiError = components['schemas']['ApiError'];

export interface NormalizedError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiRequestError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(normalized: NormalizedError) {
    super(normalized.message);
    this.name = 'ApiRequestError';
    this.status = normalized.status;
    this.code = normalized.code;
    this.details = normalized.details;
  }
}

function normalizeError(error: AxiosError): NormalizedError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data;

  if (data && typeof data === 'object' && 'code' in data) {
    const apiError = data as ApiError;
    return {
      status,
      code: apiError.code,
      message: apiError.message,
      details: apiError.details as Record<string, unknown> | undefined,
    };
  }

  if (status === 0) {
    return { status: 0, code: 'NETWORK_ERROR', message: 'Ошибка сети' };
  }

  return {
    status,
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Неизвестная ошибка',
  };
}

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    throw new ApiRequestError(normalizeError(error));
  },
);
