import React, { useState, useEffect } from 'react';
import { Entry, CustomField } from '../../types/entry.types';
import { ApiService } from '../../services/api.service';
import Logger from '../../services/logger.service';
import {
  LOADING_ENTRIES_TEXT,
  NO_CUSTOM_FIELDS_TEXT,
  NO_ENTRIES_FOUND_TEXT,
  REFRESH_BUTTON_TEXT,
  SUBMITTED_ENTRIES_TEXT,
  TRY_AGAIN_BUTTON_TEXT,
} from '../../consts';
import './EntriesTable.css';

interface EntriesTableProps {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const EntriesTable: React.FC<EntriesTableProps> = ({
  entries,
  loading,
  error,
  onRefresh,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [customFieldsData, setCustomFieldsData] = useState<
    Record<string, CustomField[]>
  >({});
  const [loadingCustomFields, setLoadingCustomFields] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    Logger.logComponent('EntriesTable', 'entries_updated', {
      entriesCount: entries.length,
      hasError: !!error,
      isLoading: loading,
    });
  }, [entries, error, loading]);

  const toggleRow = async (entryId: string) => {
    const isExpanding = !expandedRows.has(entryId);
    Logger.logUserAction('toggle_row', {
      entryId,
      action: isExpanding ? 'expand' : 'collapse',
      hasCustomFieldsData: !!customFieldsData[entryId],
    });

    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(entryId)) {
      newExpandedRows.delete(entryId);
    } else {
      newExpandedRows.add(entryId);

      if (!customFieldsData[entryId]) {
        Logger.info('Fetching custom fields for row expansion', { entryId });

        const newLoadingStates = new Set(loadingCustomFields);
        newLoadingStates.add(entryId);
        setLoadingCustomFields(newLoadingStates);

        try {
          const customFields = await ApiService.getCustomFieldsByEntryId(
            entryId
          );

          setCustomFieldsData((prev) => ({
            ...prev,
            [entryId]: customFields,
          }));
        } catch (error) {
          Logger.error(
            'Failed to fetch custom fields for row expansion',
            error,
            { entryId }
          );
          setCustomFieldsData((prev) => ({
            ...prev,
            [entryId]: [],
          }));
        } finally {
          const updatedLoadingStates = new Set(loadingCustomFields);
          updatedLoadingStates.delete(entryId);
          setLoadingCustomFields(updatedLoadingStates);
        }
      }
    }
    setExpandedRows(newExpandedRows);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="entries-table-container">
        <div className="table-header">
          <h2>{SUBMITTED_ENTRIES_TEXT}</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{LOADING_ENTRIES_TEXT}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="entries-table-container">
        <div className="table-header">
          <h2>{SUBMITTED_ENTRIES_TEXT}</h2>
          <button onClick={onRefresh} className="refresh-button">
            {REFRESH_BUTTON_TEXT}
          </button>
        </div>
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={onRefresh} className="retry-button">
            {TRY_AGAIN_BUTTON_TEXT}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="entries-table-container">
      <div className="table-header">
        <h2>
          {SUBMITTED_ENTRIES_TEXT} ({entries.length})
        </h2>
        <button onClick={onRefresh} className="refresh-button">
          Refresh
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <p>{NO_ENTRIES_FOUND_TEXT}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="entries-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: Entry) => (
                <React.Fragment key={entry.id}>
                  <tr className="main-row">
                    <td className="expand-cell">
                      <button
                        className="expand-button"
                        onClick={() => toggleRow(entry.id)}
                        aria-label={
                          expandedRows.has(entry.id)
                            ? 'Collapse row'
                            : 'Expand row'
                        }
                      >
                        {expandedRows.has(entry.id) ? '−' : '+'}
                      </button>
                    </td>
                    <td className="name-cell">
                      <span title={entry.name}>
                        {truncateText(entry.name, 30)}
                      </span>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${entry.email}`} title={entry.email}>
                        {truncateText(entry.email, 35)}
                      </a>
                    </td>
                    <td className="phone-cell">
                      {entry.phone ? (
                        <a href={`tel:${entry.phone}`} title={entry.phone}>
                          {entry.phone}
                        </a>
                      ) : (
                        <span className="no-data">—</span>
                      )}
                    </td>
                    <td className="message-cell">
                      {entry.message ? (
                        <span title={entry.message}>
                          {truncateText(entry.message, 50)}
                        </span>
                      ) : (
                        <span className="no-data">—</span>
                      )}
                    </td>
                    <td className="date-cell">
                      <span title={new Date(entry.createdAt).toISOString()}>
                        {formatDate(entry.createdAt)}
                      </span>
                    </td>
                  </tr>
                  {expandedRows.has(entry.id) && (
                    <tr className="expanded-row">
                      <td colSpan={6} className="expanded-content">
                        <div className="expanded-details">
                          <h4>Additional Details</h4>
                          {loadingCustomFields.has(entry.id) ? (
                            <div className="custom-fields-loading">
                              <div className="loading-spinner-small">
                                <div className="spinner-small"></div>
                                <p>Loading custom fields...</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              {customFieldsData[entry.id] &&
                              customFieldsData[entry.id].length > 0 ? (
                                <div className="custom-fields-expanded">
                                  <h5>Custom Fields:</h5>
                                  <div className="custom-fields-grid">
                                    {customFieldsData[entry.id].map(
                                      (field, index) => (
                                        <div
                                          key={index}
                                          className="custom-field-item-expanded"
                                        >
                                          <span className="field-key">
                                            {field.key}:
                                          </span>
                                          <span className="field-value">
                                            {field.value}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="no-custom-fields">
                                  {NO_CUSTOM_FIELDS_TEXT}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
