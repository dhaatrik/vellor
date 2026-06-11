import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SetupEncryption } from '../SetupEncryption';
import { useStore } from '../../../store';
import * as crypto from '../../../src/crypto';
import localforage from 'localforage';

// Mock localforage
vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  }
}));

// Mock store
vi.mock('../../../store', () => ({
  useStore: {
    getState: vi.fn(() => ({
      setMasterKey: vi.fn(),
    })),
    persist: {
      rehydrate: vi.fn(),
    },
  },
}));

// Mock crypto
vi.mock('../../../src/crypto', () => ({
  generateSalt: vi.fn(() => new Uint8Array([1, 2, 3])),
  deriveKey: vi.fn(),
  exportKeyToBase64: vi.fn(() => Promise.resolve('mock-recovery-key')),
  importKeyFromBase64: vi.fn(),
}));

// Mock useCybertext to immediately return the static text during tests
vi.mock('../../../hooks/useCybertext', () => ({
  useCybertext: vi.fn((text) => text),
}));

describe('SetupEncryption', () => {
  let mockSetMasterKey: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // localforage mock is cleared below
    mockSetMasterKey = vi.fn();
    (useStore.getState as any).mockReturnValue({
      setMasterKey: mockSetMasterKey,
    });
  });

  it('handles incorrect password or decryption failure', async () => {
    // Setup for "not first time"
    vi.mocked(localforage.getItem).mockResolvedValueOnce(btoa(String.fromCharCode(1, 2, 3)));

    // Mock deriveKey to throw an error
    (crypto.deriveKey as any).mockRejectedValue(new Error('Decryption failed'));

    const mockOnUnlocked = vi.fn();
    render(<SetupEncryption onUnlocked={mockOnUnlocked} />);

    // Wait for the form to appear
    await screen.findByText('Unlock Vellor');

    // Type a password
    const input = screen.getByPlaceholderText('Master Password');
    await userEvent.type(input, 'wrong-password');

    // Click unlock
    const button = screen.getByRole('button', { name: 'Unlock' });
    await userEvent.click(button);

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Incorrect password or decryption failed. If you reset your cache, you must wipe the site data.')).toBeInTheDocument();
      expect(mockSetMasterKey).toHaveBeenCalledWith(null);
      expect(mockOnUnlocked).not.toHaveBeenCalled();
    });
  });

  it('enforces 12-character minimum password length during first-time setup', async () => {
    // Setup for "first time"
    vi.mocked(localforage.getItem).mockResolvedValueOnce(null);

    const mockOnUnlocked = vi.fn();
    render(<SetupEncryption onUnlocked={mockOnUnlocked} />);

    // Wait for the form to appear
    await screen.findByText('Set Master Password');

    // Type a short password (6 characters)
    const input = screen.getByPlaceholderText('Master Password');
    await userEvent.type(input, '123456');

    // Click set password
    const button = screen.getByRole('button', { name: 'Set Password & Start' });
    await userEvent.click(button);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 12 characters.')).toBeInTheDocument();
      expect(crypto.deriveKey).not.toHaveBeenCalled();
    });

    // Type a 12-character password
    await userEvent.clear(input);
    await userEvent.type(input, 'password1234');
    await userEvent.click(button);

    // Verify it proceeds
    await waitFor(() => {
      expect(screen.queryByText('Password must be at least 12 characters.')).not.toBeInTheDocument();
      expect(crypto.deriveKey).toHaveBeenCalled();
    });
  });

  it('handles crypto errors during first-time setup', async () => {
    // Setup for "first time"
    vi.mocked(localforage.getItem).mockResolvedValueOnce(null);

    // Mock deriveKey to throw an error
    (crypto.deriveKey as any).mockRejectedValue(new Error('Crypto failed'));

    const mockOnUnlocked = vi.fn();
    render(<SetupEncryption onUnlocked={mockOnUnlocked} />);

    // Wait for the form to appear
    await screen.findByText('Set Master Password');

    // Type a valid password
    const input = screen.getByPlaceholderText('Master Password');
    await userEvent.type(input, 'validpassword123');

    // Click set password
    const button = screen.getByRole('button', { name: 'Set Password & Start' });
    await userEvent.click(button);

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Incorrect password or decryption failed. If you reset your cache, you must wipe the site data.')).toBeInTheDocument();
      expect(mockSetMasterKey).toHaveBeenCalledWith(null);
      expect(mockOnUnlocked).not.toHaveBeenCalled();
    });
  });
});
