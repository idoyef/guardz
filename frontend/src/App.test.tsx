import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

vi.mock('./hooks/useEntries', () => ({
  useEntries: () => ({
    entries: [],
    loading: false,
    error: null,
    createEntry: vi.fn(),
    refreshEntries: vi.fn(),
  }),
}));

vi.mock('./components/EntryForm/EntryForm', () => ({
  EntryForm: ({ onSubmit }: { onSubmit: Function }) => (
    <div data-testid="entry-form">Entry Form Component</div>
  ),
}));

vi.mock('./components/EntriesTable/EntriesTable', () => ({
  EntriesTable: ({ entries, loading, error, onRefresh }: any) => (
    <div data-testid="entries-table">Entries Table Component</div>
  ),
}));

describe('App', () => {
  it('renders main components', () => {
    render(<App />);

    expect(screen.getByText('User Entries Application')).toBeInTheDocument();
    expect(
      screen.getByText('Submit and view user information entries')
    ).toBeInTheDocument();
    expect(screen.getByTestId('entry-form')).toBeInTheDocument();
    expect(screen.getByTestId('entries-table')).toBeInTheDocument();
  });
});
