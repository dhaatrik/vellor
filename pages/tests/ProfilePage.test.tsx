import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePage } from '../ProfilePage';
import { Theme } from '../../types';
import '@testing-library/jest-dom';

const mockUpdateSettings = vi.fn();
const mockAddToast = vi.fn();

const defaultSettings = {
  userName: 'Test User',
  email: 'test@example.com',
  country: 'United States',
  phone: { countryCode: '+1', number: '1234567890' },
  currencySymbol: '$',
  monthlyGoal: 1000,
  theme: Theme.Light,
  customRankTitles: [],
};

vi.mock('../../store', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      settings: defaultSettings,
      updateSettings: mockUpdateSettings,
      addToast: mockAddToast,
    };
    return selector(state);
  })
}));

// Mock inner components to isolate testing if needed, but integration test is better here.
// Let's rely on actual UI components for now as they are just simple wrappers mostly.

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.share
    Object.assign(navigator, {
      share: undefined, // Default to undefined to test fallback, we can override in specific tests
    });

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders correctly with initial settings', () => {
    render(<ProfilePage />);

    expect(screen.getByText('Profile & Settings')).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Your Name (Tutor)');
    expect(nameInput).toHaveValue('Test User');

    const emailInput = screen.getByLabelText('Email Address');
    expect(emailInput).toHaveValue('test@example.com');

    // Monthly Goal input
    const goalInput = screen.getByLabelText('Monthly Income Goal');
    expect(goalInput).toHaveValue(1000);
  });

  it('updates form fields correctly and saves changes', async () => {
    render(<ProfilePage />);

    const nameInput = screen.getByLabelText('Your Name (Tutor)');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    const goalInput = screen.getByLabelText('Monthly Income Goal');
    fireEvent.change(goalInput, { target: { value: '2000' } });

    // Click Save
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({
        userName: 'New Name',
        monthlyGoal: 2000, // Should be parsed to number
      }));
    });
  });

  it('handles country change and updates phone country code', async () => {
     render(<ProfilePage />);

     const countrySelect = screen.getByLabelText('Country');
     fireEvent.change(countrySelect, { target: { value: 'India' } });

     const saveButton = screen.getByRole('button', { name: /Save Changes/i });
     fireEvent.click(saveButton);

     await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({
            country: 'India',
            phone: { countryCode: '+91', number: '1234567890' }
        }));
     });
  });

  it('opens and closes the visiting card modal', async () => {
    render(<ProfilePage />);

    const viewCardButton = screen.getByRole('button', { name: /View Visiting Card/i });
    fireEvent.click(viewCardButton);

    // Wait for Modal to be visible
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Your Visiting Card')).toBeInTheDocument();
    expect(screen.getByText('Tutor / Educator')).toBeInTheDocument(); // Inner text

    // Close modal (assuming Modal component has a close button or we can just trigger onClose)
    // Looking at common Modal implementations, it might have a generic close button, or we can click outside.
    // The easiest way is to mock Modal if it's complex, or just find the close button.
    const closeButton = screen.getByRole('button', { name: /Close/i }); // Common aria-label
    if(closeButton) {
        fireEvent.click(closeButton);
    }
  });

  it('shares card via navigator.clipboard fallback when share is not available', async () => {
    render(<ProfilePage />);

    const viewCardButton = screen.getByRole('button', { name: /View Visiting Card/i });
    fireEvent.click(viewCardButton);

    // Within modal
    const shareButton = await screen.findByRole('button', { name: /Share Card/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(mockAddToast).toHaveBeenCalledWith('Contact details copied to clipboard!', 'info');
      expect(screen.getByText('Copied!')).toBeInTheDocument(); // Button text changes temporarily
    });
  });

  it('shares card via navigator.share when available', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share: mockShare });

    render(<ProfilePage />);

    const viewCardButton = screen.getByRole('button', { name: /View Visiting Card/i });
    fireEvent.click(viewCardButton);

    const shareButton = await screen.findByRole('button', { name: /Share Card/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalled();
      expect(mockAddToast).toHaveBeenCalledWith('Contact shared successfully!', 'success');
    });
  });
});
