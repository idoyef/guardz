import axios, { AxiosResponse } from 'axios';
import { Entry, CreateEntryDto, CustomField } from '../types/entry.types';
import Logger from './logger.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    Logger.logApiRequest(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || '',
      config.data
    );
    return config;
  },
  (error) => {
    Logger.logApiError('REQUEST', 'interceptor', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    Logger.logApiResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || '',
      response.status,
      response.data
    );
    return response;
  },
  (error) => {
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'unknown';
    const status = error.response?.status || 'NO_STATUS';
    Logger.logApiError(method, `${url} [${status}]`, error);
    return Promise.reject(error);
  }
);

export class ApiService {
  static async createEntry(entryData: CreateEntryDto): Promise<Entry> {
    const startTime = performance.now();
    try {
      Logger.info('Creating new entry', {
        name: entryData.name,
        email: entryData.email,
        customFieldsCount: entryData.customFields?.length || 0,
      });

      const response: AxiosResponse<Entry> = await apiClient.post(
        '/entries',
        entryData
      );

      const duration = performance.now() - startTime;
      Logger.logPerformance('createEntry', duration, {
        entryId: response.data.id,
      });
      Logger.info('Entry created successfully', { entryId: response.data.id });

      return response.data;
    } catch (error) {
      const duration = performance.now() - startTime;
      Logger.logPerformance('createEntry_failed', duration);
      Logger.error('Failed to create entry', error, { entryData });
      throw error;
    }
  }

  static async getAllEntries(): Promise<Entry[]> {
    const startTime = performance.now();
    try {
      Logger.info('Fetching all entries');

      const response: AxiosResponse<Entry[]> = await apiClient.get('/entries');

      const duration = performance.now() - startTime;
      Logger.logPerformance('getAllEntries', duration, {
        count: response.data.length,
      });
      Logger.info('Entries fetched successfully', {
        count: response.data.length,
      });

      return response.data;
    } catch (error) {
      const duration = performance.now() - startTime;
      Logger.logPerformance('getAllEntries_failed', duration);
      Logger.error('Failed to fetch entries', error);
      throw error;
    }
  }

  static async getCustomFieldsByEntryId(
    entryId: string
  ): Promise<CustomField[]> {
    const startTime = performance.now();
    try {
      Logger.info('Fetching custom fields for entry', { entryId });

      const response: AxiosResponse<CustomField[]> = await apiClient.get(
        `/entries/${entryId}/custom-fields`
      );

      const duration = performance.now() - startTime;
      Logger.logPerformance('getCustomFieldsByEntryId', duration, {
        entryId,
        count: response.data.length,
      });
      Logger.info('Custom fields fetched successfully', {
        entryId,
        count: response.data.length,
      });

      return response.data;
    } catch (error) {
      const duration = performance.now() - startTime;
      Logger.logPerformance('getCustomFieldsByEntryId_failed', duration, {
        entryId,
      });
      Logger.error('Failed to fetch custom fields', error, { entryId });
      throw error;
    }
  }
}
