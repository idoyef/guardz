import React, { useEffect } from 'react';
import { EntryForm } from './components/EntryForm/EntryForm';
import { EntriesTable } from './components/EntriesTable/EntriesTable';
import { useEntries } from './hooks/useEntries';
import Logger from './services/logger.service';
import { APP_COPYRIGHT, APP_DESCRIPTION, APP_NAME } from './consts';
import { CreateEntryDto } from './types/entry.types';
import './App.css';

const App: React.FC = () => {
  const { entries, loading, error, createEntry, refreshEntries } = useEntries();

  useEffect(() => {
    if (error) {
      Logger.warn('Global error state updated', { error });
    }
  }, [error]);

  const handleFormSubmit = async (entryData: CreateEntryDto) => {
    Logger.info('App: Form submission initiated');

    try {
      await createEntry(entryData);
      Logger.info('App: Form submission completed successfully');
    } catch (error) {
      Logger.error('App: Form submission failed', error);
      throw error;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>{APP_NAME}</h1>
        <p>{APP_DESCRIPTION}</p>
      </header>

      <main className="app-main">
        <div className="container">
          {error && (
            <div className="global-error">
              <p>⚠️ {error}</p>
            </div>
          )}

          <EntryForm onSubmit={handleFormSubmit} loading={loading} />

          <EntriesTable
            entries={entries}
            loading={loading}
            error={error}
            onRefresh={refreshEntries}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; {APP_COPYRIGHT}</p>
      </footer>
    </div>
  );
};

export default App;
