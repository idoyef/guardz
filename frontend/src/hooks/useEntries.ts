import { useState, useEffect, useCallback } from 'react';
import { Entry, CreateEntryDto } from '../types/entry.types';
import { ApiService } from '../services/api.service';
import Logger from '../services/logger.service';

interface UseEntriesReturn {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  createEntry: (entryData: CreateEntryDto) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

export const useEntries = (): UseEntriesReturn => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    Logger.info('useEntries: Starting to fetch entries');

    try {
      setLoading(true);
      setError(null);
      const fetchedEntries = await ApiService.getAllEntries();

      Logger.info('useEntries: Entries fetched successfully', {
        count: fetchedEntries.length,
      });

      setEntries(fetchedEntries);
    } catch (err) {
      Logger.error('useEntries: Failed to fetch entries', err);
      setError('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = async (entryData: CreateEntryDto): Promise<void> => {
    Logger.info('useEntries: Creating new entry', {
      name: entryData.name,
      email: entryData.email,
      customFieldsCount: entryData.customFields?.length || 0,
    });

    try {
      setError(null);
      const newEntry = await ApiService.createEntry(entryData);

      Logger.info('useEntries: Entry created successfully', {
        entryId: newEntry.id,
        totalEntriesAfter: entries.length + 1,
      });

      setEntries((prevEntries) => [newEntry, ...prevEntries]);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create entry';
      Logger.error('useEntries: Failed to create entry', err, {
        errorMessage,
        entryData,
      });
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshEntries = useCallback(async () => {
    Logger.logUserAction('refresh_entries', {
      currentEntriesCount: entries.length,
    });
    await fetchEntries();
  }, [fetchEntries, entries.length]);

  useEffect(() => {
    Logger.logComponent('useEntries', 'initial_fetch_triggered');
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    createEntry,
    refreshEntries,
  };
};
