import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EntriesTable } from './EntriesTable';
import { Entry } from '../../types/entry.types';
import { ApiService } from '../../services/api.service';
import Logger from '../../services/logger.service';

vi.mock('../../services/api.service');
vi.mock('../../services/logger.service');

const mockApiService = vi.mocked(ApiService);
const mockLogger = vi.mocked(Logger);

describe('EntriesTable', () => {
  const mockOnRefresh = vi.fn();

  const mockEntries: Entry[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123456789',
      message: 'Test message 1',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T14:20:00Z',
    },
  ];

  const mockCustomFields = [
    { key: 'company', value: 'Acme Corp' },
    { key: 'department', value: 'Engineering' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnRefresh.mockClear();
  });

  it('displays loading state', () => {
    render(
      <EntriesTable
        entries={[]}
        loading={true}
        error={null}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText(/loading entries/i)).toBeInTheDocument();
    expect(screen.getByText('Submitted Entries')).toBeInTheDocument();
  });

  it('displays error state with retry button', async () => {
    const user = userEvent.setup();
    render(
      <EntriesTable
        entries={[]}
        loading={false}
        error="Failed to fetch entries"
        onRefresh={mockOnRefresh}
      />
    );

    expect(
      screen.getByText(/error: failed to fetch entries/i)
    ).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('displays empty state when no entries', () => {
    render(
      <EntriesTable
        entries={[]}
        loading={false}
        error={null}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText(/no entries found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/submit the first entry above/i)
    ).toBeInTheDocument();
  });

  it('displays entries in table format', () => {
    render(
      <EntriesTable
        entries={mockEntries}
        loading={false}
        error={null}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText(/submitted entries \(2\)/i)).toBeInTheDocument();

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText('Test message 1')).toBeInTheDocument();

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();

    const noDashElements = screen.getAllByText('—');
    expect(noDashElements).toHaveLength(2);
  });

  it('creates mailto links for email addresses', () => {
    render(
      <EntriesTable
        entries={mockEntries}
        loading={false}
        error={null}
        onRefresh={mockOnRefresh}
      />
    );

    const emailLink = screen.getByRole('link', { name: /john@example.com/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');
  });

  it('creates tel links for phone numbers', () => {
    render(
      <EntriesTable
        entries={mockEntries}
        loading={false}
        error={null}
        onRefresh={mockOnRefresh}
      />
    );

    const phoneLink = screen.getByRole('link', { name: /123456789/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:123456789');
  });

  it('calls onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EntriesTable
        entries={mockEntries}
        loading={false}
        error={null}
        onRefresh={mockOnRefresh}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('truncates long text content', () => {
    const longEntry: Entry = {
      id: '3',
      name: 'This is a very long name that should be truncated when displayed in the table',
      email: 'verylongemailaddress@verylongdomainname.com',
      message:
        'This is a very long message that should be truncated when displayed in the table to prevent layout issues',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    };

    render(
      <EntriesTable
        entries={[longEntry]}
        loading={false}
        error={null}
        onRefresh={mockOnRefresh}
      />
    );

    expect(
      screen.getByText('This is a very long name that ...')
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is a very long message that should be truncat...')
    ).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(
      <EntriesTable
        entries={mockEntries}
        loading={false}
        error={null}
        onRefresh={mockOnRefresh}
      />
    );

    const janElements = screen.getAllByText(/Jan/);
    expect(janElements.length).toBeGreaterThan(0);
  });

  describe('Row expansion functionality', () => {
    it('shows expand button for each row', () => {
      render(
        <EntriesTable
          entries={mockEntries}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const expandButtons = screen.getAllByRole('button', {
        name: /expand row/i,
      });
      expect(expandButtons).toHaveLength(2);
    });

    it('expands row when expand button is clicked', async () => {
      const user = userEvent.setup();
      mockApiService.getCustomFieldsByEntryId.mockResolvedValue(
        mockCustomFields
      );

      render(
        <EntriesTable
          entries={mockEntries}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const expandButton = screen.getAllByRole('button', {
        name: /expand row/i,
      })[0];
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Additional Details')).toBeInTheDocument();
      });

      expect(mockApiService.getCustomFieldsByEntryId).toHaveBeenCalledWith('1');
    });

    it('displays custom fields when expanded', async () => {
      const user = userEvent.setup();
      mockApiService.getCustomFieldsByEntryId.mockResolvedValue(
        mockCustomFields
      );

      render(
        <EntriesTable
          entries={mockEntries}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const expandButton = screen.getAllByRole('button', {
        name: /expand row/i,
      })[0];
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Custom Fields:')).toBeInTheDocument();
        expect(screen.getByText('company:')).toBeInTheDocument();
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('department:')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });
    });

    it('shows no custom fields message when entry has no custom fields', async () => {
      const user = userEvent.setup();
      mockApiService.getCustomFieldsByEntryId.mockResolvedValue([]);

      render(
        <EntriesTable
          entries={mockEntries}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const expandButton = screen.getAllByRole('button', {
        name: /expand row/i,
      })[0];
      await user.click(expandButton);

      await waitFor(() => {
        expect(
          screen.getByText('No custom fields for this entry.')
        ).toBeInTheDocument();
      });
    });

    it('handles custom fields fetch error gracefully', async () => {
      const user = userEvent.setup();
      mockApiService.getCustomFieldsByEntryId.mockRejectedValue(
        new Error('API Error')
      );

      render(
        <EntriesTable
          entries={mockEntries}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const expandButton = screen.getAllByRole('button', {
        name: /expand row/i,
      })[0];
      await user.click(expandButton);

      await waitFor(() => {
        expect(
          screen.getByText('No custom fields for this entry.')
        ).toBeInTheDocument();
      });

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('collapses row when expand button is clicked again', async () => {
      const user = userEvent.setup();
      mockApiService.getCustomFieldsByEntryId.mockResolvedValue(
        mockCustomFields
      );

      render(
        <EntriesTable
          entries={mockEntries}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const expandButton = screen.getAllByRole('button', {
        name: /expand row/i,
      })[0];

      await user.click(expandButton);
      await waitFor(() => {
        expect(screen.getByText('Additional Details')).toBeInTheDocument();
      });

      const collapseButton = screen.getByRole('button', {
        name: /collapse row/i,
      });
      await user.click(collapseButton);

      expect(screen.queryByText('Additional Details')).not.toBeInTheDocument();
    });

    it('does not refetch custom fields if already loaded', async () => {
      const user = userEvent.setup();
      mockApiService.getCustomFieldsByEntryId.mockResolvedValue(
        mockCustomFields
      );

      render(
        <EntriesTable
          entries={mockEntries}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const expandButton = screen.getAllByRole('button', {
        name: /expand row/i,
      })[0];

      await user.click(expandButton);
      await waitFor(() => {
        expect(screen.getByText('Custom Fields:')).toBeInTheDocument();
      });

      const collapseButton = screen.getByRole('button', {
        name: /collapse row/i,
      });
      await user.click(collapseButton);

      const expandButtonsAgain = screen.getAllByRole('button', {
        name: /expand row/i,
      });
      await user.click(expandButtonsAgain[0]);

      expect(mockApiService.getCustomFieldsByEntryId).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for expand buttons', () => {
      render(
        <EntriesTable
          entries={mockEntries}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const expandButtons = screen.getAllByRole('button', {
        name: /expand row/i,
      });
      expect(expandButtons).toHaveLength(2);
    });

    it('updates ARIA label when row is expanded', async () => {
      const user = userEvent.setup();
      mockApiService.getCustomFieldsByEntryId.mockResolvedValue(
        mockCustomFields
      );

      render(
        <EntriesTable
          entries={mockEntries}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const expandButton = screen.getAllByRole('button', {
        name: /expand row/i,
      })[0];
      await user.click(expandButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /collapse row/i })
        ).toBeInTheDocument();
      });
    });

    it('has proper title attributes for truncated text', () => {
      const longEntry: Entry = {
        id: '3',
        name: 'This is a very long name that should be truncated',
        email: 'verylongemail@example.com',
        message: 'This is a very long message that should be truncated',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      };

      render(
        <EntriesTable
          entries={[longEntry]}
          loading={false}
          error={null}
          onRefresh={mockOnRefresh}
        />
      );

      const nameElement = screen.getByTitle(
        'This is a very long name that should be truncated'
      );
      const emailElement = screen.getByTitle('verylongemail@example.com');
      const messageElement = screen.getByTitle(
        'This is a very long message that should be truncated'
      );

      expect(nameElement).toBeInTheDocument();
      expect(emailElement).toBeInTheDocument();
      expect(messageElement).toBeInTheDocument();
    });
  });
});
