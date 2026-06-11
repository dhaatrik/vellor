import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { BackupPromptModal } from '../BackupPromptModal';
import { useStore } from '../../store';
import localforage from 'localforage';

// Mock the store
vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('../../store', () => ({
  useStore: vi.fn(),
}));

// Mock the UI components used by BackupPromptModal directly using their actual paths if possible,
// or since they are exported from an index file, we can mock the index file.
vi.mock('../ui/Modal', () => ({
  Modal: ({ isOpen, children, title, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Close modal">Close</button>
        {children}
      </div>
    );
  }
}));

vi.mock('../ui/Button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>{children}</button>
  )
}));

vi.mock('../ui/Icon', () => ({
  Icon: ({ iconName }: any) => <span data-testid={`icon-${iconName}`} />
}));

vi.mock('../ui', () => ({
  Modal: ({ isOpen, children, title, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Close modal">Close</button>
        {children}
      </div>
    );
  },
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>{children}</button>
  ),
  Icon: ({ iconName }: any) => <span data-testid={`icon-${iconName}`} />,
}));

describe('BackupPromptModal', () => {
  const mockExportData = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    localforage.clear();
    vi.mocked(localforage.getItem).mockResolvedValue(null);

    // Setup store mock default return
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        exportData: mockExportData,
        addToast: mockAddToast,
        students: [{ id: '1', name: 'Test Student' }]
      };
      return selector(state);
    });

    // Also mock useStore.getState
    (useStore as any).getState = vi.fn(() => ({
      students: [{ id: '1', name: 'Test Student' }]
    }));
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  it('renders nothing initially before the timer fires', async () => {
    await act(async () => {
        render(<BackupPromptModal />);
    });
    await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
  });

  it('opens after 3 seconds if never backed up and students exist', async () => {
    await act(async () => {
        render(<BackupPromptModal />);
    });

    // Modal shouldn't be visible yet
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Time for a Backup')).toBeInTheDocument();
  });

  it('does not open if never backed up but no students exist', async () => {
    (useStore as any).getState = vi.fn(() => ({
      students: []
    }));
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        exportData: mockExportData,
        addToast: mockAddToast,
        students: []
      };
      return selector(state);
    });

    await act(async () => {
        render(<BackupPromptModal />);
    });

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('opens if last backup was more than 14 days ago', async () => {
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    vi.mocked(localforage.getItem).mockResolvedValue(twentyDaysAgo.toISOString());

    await act(async () => {
        render(<BackupPromptModal />);
    });

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('does not open if last backup was less than 14 days ago', async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    vi.mocked(localforage.getItem).mockResolvedValue(twoDaysAgo.toISOString());

    await act(async () => {
        render(<BackupPromptModal />);
    });

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('calls exportData and updates localforage when Export Backup is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await act(async () => {
        render(<BackupPromptModal />);
    });

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const exportBtn = screen.getByText('Export Backup');
    await user.click(exportBtn);

    expect(mockExportData).toHaveBeenCalled();
    expect(localforage.setItem).toHaveBeenCalledWith('lastBackupDate', expect.any(String));
    // Modal should close
    await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
  });

  it('opens if last backup date is an invalid string', async () => {
    vi.mocked(localforage.getItem).mockResolvedValue('invalid_date_string');

    await act(async () => {
        render(<BackupPromptModal />);
    });

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('updates localforage and shows toast when Remind Me Later is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await act(async () => {
        render(<BackupPromptModal />);
    });

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const dismissBtn = screen.getByText('Remind Me Later');
    await user.click(dismissBtn);

    expect(mockAddToast).toHaveBeenCalledWith('Backup postponed to tomorrow.', 'info');

    expect(localforage.setItem).toHaveBeenCalledWith('lastBackupDate', expect.any(String));

    // Modal should close
    await waitFor(() => expect(screen.queryByTestId('modal')).not.toBeInTheDocument());
  });
});
