import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EntryForm } from './EntryForm';
import { CreateEntryDto } from '../../types/entry.types';

describe('EntryForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form fields correctly', () => {
    render(<EntryForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /submit entry/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(<EntryForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit entry/i });
    await user.click(submitButton);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<EntryForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/name \*/i);
    const emailInput = screen.getByLabelText(/email \*/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /submit entry/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(phoneInput, '123456789');
    await user.type(messageInput, 'Test message');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        message: 'Test message',
      });
    });
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<EntryForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/name \*/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email \*/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /submit entry/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });
  });

  it('disables form when loading', () => {
    render(<EntryForm onSubmit={mockOnSubmit} loading={true} />);

    const nameInput = screen.getByLabelText(/name \*/i);
    const emailInput = screen.getByLabelText(/email \*/i);
    const submitButton = screen.getByRole('button', { name: /submit entry/i });

    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('clears field error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<EntryForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/name \*/i);
    const submitButton = screen.getByRole('button', { name: /submit entry/i });

    await user.click(submitButton);
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();

    await user.type(nameInput, 'J');
    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
  });
});
