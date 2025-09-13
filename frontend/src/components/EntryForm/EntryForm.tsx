import React, { useState, useEffect } from 'react';
import { CreateEntryDto } from '../../types/entry.types';
import Logger from '../../services/logger.service';
import { FormData, FormErrors } from './types';
import { DEFAULT_FORM_DATA, validateForm } from './helper';
import './EntryForm.css';
import {
  ADD_FIELD_BUTTON_TEXT,
  SUBMIT_BUTTON_TEXT,
  SUBMITTING_BUTTON_TEXT,
} from '../../consts';

interface EntryFormProps {
  onSubmit: (entryData: CreateEntryDto) => Promise<void>;
  loading?: boolean;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    Logger.logComponent('EntryForm', 'mounted');
    return () => {
      Logger.logComponent('EntryForm', 'unmounted');
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCustomFieldChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) =>
        i === index ? { ...cf, [field]: value } : cf
      ),
    }));

    // Clear error for this custom field when user starts typing
    if (errors.customFields?.[index]) {
      setErrors((prev) => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [index]: {
            ...prev.customFields![index],
            [field]: undefined,
          },
        },
      }));
    }
  };

  const addCustomField = () => {
    Logger.logUserAction('add_custom_field', {
      currentCount: formData.customFields.length,
    });
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { key: '', value: '' }],
    }));
  };

  const removeCustomField = (index: number) => {
    Logger.logUserAction('remove_custom_field', {
      index,
      currentCount: formData.customFields.length,
    });
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));

    // Clear errors for this field
    if (errors.customFields?.[index]) {
      setErrors((prev) => {
        const newCustomFieldErrors = { ...prev.customFields };
        delete newCustomFieldErrors[index];
        return {
          ...prev,
          customFields:
            Object.keys(newCustomFieldErrors).length > 0
              ? newCustomFieldErrors
              : undefined,
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    Logger.logForm('EntryForm', 'submit_started', {
      hasName: !!formData.name.trim(),
      hasEmail: !!formData.email.trim(),
      hasPhone: !!formData.phone.trim(),
      hasMessage: !!formData.message.trim(),
      customFieldsCount: formData.customFields.length,
    });

    const { isValid, errors: validationErrors } = validateForm(formData);
    setErrors(validationErrors);

    if (!isValid) {
      Logger.logForm('EntryForm', 'submit_validation_failed');
      return;
    }

    setIsSubmitting(true);

    try {
      const validCustomFields = formData.customFields.filter(
        (field) => field.key.trim() && field.value.trim()
      );

      const submitData: CreateEntryDto = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...(formData.phone.trim() && { phone: formData.phone.trim() }),
        ...(formData.message.trim() && { message: formData.message.trim() }),
        ...(validCustomFields.length > 0 && {
          customFields: validCustomFields,
        }),
      };

      Logger.logForm('EntryForm', 'submit_data_prepared', {
        hasPhone: !!submitData.phone,
        hasMessage: !!submitData.message,
        validCustomFieldsCount: validCustomFields.length,
      });

      await onSubmit(submitData);

      Logger.logForm('EntryForm', 'submit_success');

      setFormData(DEFAULT_FORM_DATA);
      setErrors({});
    } catch (error) {
      Logger.error('Form submission failed', error, { formData });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="entry-form-container">
      <h2>Submit Your Information</h2>
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? 'error' : ''}
            disabled={isSubmitting || loading}
            maxLength={100}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            disabled={isSubmitting || loading}
            maxLength={255}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone ? 'error' : ''}
            disabled={isSubmitting || loading}
            maxLength={20}
          />
          {errors.phone && (
            <span className="error-message">{errors.phone}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className={errors.message ? 'error' : ''}
            disabled={isSubmitting || loading}
            maxLength={500}
            rows={4}
          />
          {errors.message && (
            <span className="error-message">{errors.message}</span>
          )}
        </div>

        <div className="custom-fields-section">
          <div className="custom-fields-header">
            <h3>Custom Fields</h3>
            <button
              type="button"
              onClick={addCustomField}
              className="add-field-button"
              disabled={isSubmitting || loading}
            >
              {ADD_FIELD_BUTTON_TEXT}
            </button>
          </div>

          {formData.customFields.map((field, index) => (
            <div key={index} className="custom-field-group">
              <div className="custom-field-inputs">
                <div className="custom-field-input">
                  <input
                    type="text"
                    placeholder="Field name"
                    value={field.key}
                    onChange={(e) =>
                      handleCustomFieldChange(index, 'key', e.target.value)
                    }
                    className={errors.customFields?.[index]?.key ? 'error' : ''}
                    disabled={isSubmitting || loading}
                    maxLength={50}
                  />
                  {errors.customFields?.[index]?.key && (
                    <span className="error-message">
                      {errors.customFields[index].key}
                    </span>
                  )}
                </div>
                <div className="custom-field-input">
                  <input
                    type="text"
                    placeholder="Field value"
                    value={field.value}
                    onChange={(e) =>
                      handleCustomFieldChange(index, 'value', e.target.value)
                    }
                    className={
                      errors.customFields?.[index]?.value ? 'error' : ''
                    }
                    disabled={isSubmitting || loading}
                    maxLength={100}
                  />
                  {errors.customFields?.[index]?.value && (
                    <span className="error-message">
                      {errors.customFields[index].value}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeCustomField(index)}
                  className="remove-field-button"
                  disabled={isSubmitting || loading}
                  aria-label="Remove custom field"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? SUBMITTING_BUTTON_TEXT : SUBMIT_BUTTON_TEXT}
        </button>
      </form>
    </div>
  );
};
