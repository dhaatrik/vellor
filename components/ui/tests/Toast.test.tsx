
import { render, screen } from '@testing-library/react';
import { ToastContainer } from '../Toast';
import { useStore } from '../../../store';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the store
vi.mock('../../../store', () => ({
  useStore: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className} data-testid="motion-div">{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the Icon component
vi.mock('../Icon', () => ({
  Icon: ({ iconName }: { iconName: string }) => <span data-testid="icon" data-icon-name={iconName} />,
}));

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when there are no toasts', () => {
    // Mock store to return empty toasts array
    (useStore as any).mockImplementation((selector: any) => selector({ toasts: [] }));

    const { container } = render(<ToastContainer />);

    // Should render the container but no toasts
    expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
    expect(screen.queryByTestId('motion-div')).not.toBeInTheDocument();
  });

  it('renders a success toast correctly', () => {
    const mockToasts = [
      { id: '1', message: 'Success message', type: 'success' }
    ];

    (useStore as any).mockImplementation((selector: any) => selector({ toasts: mockToasts }));

    render(<ToastContainer />);

    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Check if the success icon is rendered
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('data-icon-name', 'check-circle');
  });

  it('renders an error toast correctly', () => {
    const mockToasts = [
      { id: '2', message: 'Error message', type: 'error' }
    ];

    (useStore as any).mockImplementation((selector: any) => selector({ toasts: mockToasts }));

    render(<ToastContainer />);

    expect(screen.getByText('Error message')).toBeInTheDocument();

    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('data-icon-name', 'x-circle');
  });

  it('renders an info toast correctly', () => {
    const mockToasts = [
      { id: '3', message: 'Info message', type: 'info' }
    ];

    (useStore as any).mockImplementation((selector: any) => selector({ toasts: mockToasts }));

    render(<ToastContainer />);

    expect(screen.getByText('Info message')).toBeInTheDocument();

    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('data-icon-name', 'information-circle');
  });

  it('renders multiple toasts', () => {
    const mockToasts = [
      { id: '1', message: 'Message 1', type: 'success' },
      { id: '2', message: 'Message 2', type: 'error' },
      { id: '3', message: 'Message 3', type: 'info' },
    ];

    (useStore as any).mockImplementation((selector: any) => selector({ toasts: mockToasts }));

    render(<ToastContainer />);

    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.getByText('Message 2')).toBeInTheDocument();
    expect(screen.getByText('Message 3')).toBeInTheDocument();

    const icons = screen.getAllByTestId('icon');
    expect(icons).toHaveLength(3);
    expect(icons[0]).toHaveAttribute('data-icon-name', 'check-circle');
    expect(icons[1]).toHaveAttribute('data-icon-name', 'x-circle');
    expect(icons[2]).toHaveAttribute('data-icon-name', 'information-circle');
  });
});
