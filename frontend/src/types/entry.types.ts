export interface CustomField {
  key: string;
  value: string;
}

export interface Entry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryDto {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  customFields?: CustomField[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
