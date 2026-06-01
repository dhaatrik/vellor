import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingWizard } from '../OnboardingWizard';
import '@testing-library/jest-dom';

const mockUpdateSettings = vi.fn();

vi.mock('../../../store', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      updateSettings: mockUpdateSettings,
      settings: {
        monthlyGoal: 500,
        currencySymbol: '$',
      }
    };
    return selector(state);
  })
}));

describe('OnboardingWizard', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    render(<OnboardingWizard {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Welcome to Vellor!')).not.toBeInTheDocument();
  });

  it('renders initial state correctly when open', () => {
    render(<OnboardingWizard {...defaultProps} />);
    expect(screen.getByText('Welcome to Vellor!')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('calls updateSettings and onClose when skipping the wizard', () => {
    render(<OnboardingWizard {...defaultProps} />);

    const skipButton = screen.getByLabelText('Skip tutorial');
    fireEvent.click(skipButton);

    expect(mockUpdateSettings).toHaveBeenCalledWith({ hasCompletedOnboarding: true });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('navigates forward and backward through steps', async () => {
    render(<OnboardingWizard {...defaultProps} />);

    // Step 1
    expect(screen.getByText('Welcome to Vellor!')).toBeInTheDocument();

    // Go to Step 2
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText('Log Lessons in Seconds')).toBeInTheDocument();
    });

    // Go back to Step 1
    fireEvent.click(screen.getByText('Back'));
    await waitFor(() => {
      expect(screen.getByText('Welcome to Vellor!')).toBeInTheDocument();
    });
  });

  it('completes the full flow and sets the monthly goal', async () => {
    render(<OnboardingWizard {...defaultProps} />);

    // Step 1 to 2
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText('Log Lessons in Seconds')).toBeInTheDocument());

    // Step 2 to 3
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText('Level Up Your Tutoring')).toBeInTheDocument());

    // Step 3 to 4
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText('Set Your Monthly Goal')).toBeInTheDocument());

    // Update goal
    const goalInput = screen.getByLabelText('Monthly Target ($)');
    fireEvent.change(goalInput, { target: { value: '1000' } });

    // Finish setup
    fireEvent.click(screen.getByText('Finish Setup'));

    expect(mockUpdateSettings).toHaveBeenCalledWith({ monthlyGoal: 1000, hasCompletedOnboarding: true });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles invalid goal input by only completing onboarding', async () => {
    render(<OnboardingWizard {...defaultProps} />);

    // Navigate to step 4
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText('Log Lessons in Seconds')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText('Level Up Your Tutoring')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText('Set Your Monthly Goal')).toBeInTheDocument());

    // Set invalid goal
    const goalInput = screen.getByLabelText('Monthly Target ($)');
    fireEvent.change(goalInput, { target: { value: '' } });

    // Finish setup
    fireEvent.click(screen.getByText('Finish Setup'));

    expect(mockUpdateSettings).toHaveBeenCalledWith({ hasCompletedOnboarding: true });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
