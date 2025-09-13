import { FormData, FormErrors } from './types';
import Logger from '../../services/logger.service';

export const DEFAULT_FORM_DATA: FormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
  customFields: [],
};

export const validateForm = (
  formData: FormData
): { isValid: boolean; errors: FormErrors } => {
  Logger.logForm('EntryForm', 'validation_started', {
    hasName: !!formData.name.trim(),
    hasEmail: !!formData.email.trim(),
    hasPhone: !!formData.phone.trim(),
    hasMessage: !!formData.message.trim(),
    customFieldsCount: formData.customFields.length,
  });

  const newErrors: FormErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
  } else if (formData.name.length > 100) {
    newErrors.name = 'Name must be less than 100 characters';
  }

  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email address';
  } else if (formData.email.length > 255) {
    newErrors.email = 'Email must be less than 255 characters';
  }

  if (formData.phone) {
    if (formData.phone.length > 20) {
      newErrors.phone = 'Phone must be less than 20 characters';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Phone must contain only numbers';
    }
  }

  if (formData.message && formData.message.length > 500) {
    newErrors.message = 'Message must be less than 500 characters';
  }

  const customFieldErrors: {
    [index: number]: { key?: string; value?: string };
  } = {};
  formData.customFields.forEach((field, index) => {
    if (field.key.trim() && !field.value.trim()) {
      customFieldErrors[index] = {
        value: 'Value is required when key is provided',
      };
    } else if (!field.key.trim() && field.value.trim()) {
      customFieldErrors[index] = {
        key: 'Key is required when value is provided',
      };
    } else if (field.key.length > 50) {
      customFieldErrors[index] = {
        key: 'Key must be less than 50 characters',
      };
    } else if (field.value.length > 100) {
      customFieldErrors[index] = {
        value: 'Value must be less than 100 characters',
      };
    }
  });

  if (Object.keys(customFieldErrors).length > 0) {
    newErrors.customFields = customFieldErrors;
  }

  const isValid = Object.keys(newErrors).length === 0;
  Logger.logForm('EntryForm', 'validation_completed', {
    isValid,
    errorCount: Object.keys(newErrors).length,
    errorFields: Object.keys(newErrors),
  });

  return { isValid, errors: newErrors };
};
