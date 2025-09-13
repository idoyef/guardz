import { CustomField } from '../../types/entry.types';

export interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  customFields: CustomField[];
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  customFields?: { [index: number]: { key?: string; value?: string } };
}
