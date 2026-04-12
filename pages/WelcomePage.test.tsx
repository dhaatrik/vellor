import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { WelcomePage } from './WelcomePage';
import { DEFAULT_USER_NAME } from '../constants';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const { mockUpdateSettings } = vi.hoisted(() => ({
  mockUpdateSettings: vi.fn()
}));

vi.mock('../store', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      settings: {
        currencySymbol: '$',
      },
      updateSettings: mockUpdateSettings,
    };
    return selector(state);
  }),
}));

vi.mock('framer-motion', () => {
  const ActualMotion = {
    div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
    li: ({ children, className }: any) => <li className={className}>{children}</li>,
  };
  return {
    motion: ActualMotion,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('WelcomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders correctly and shows form inputs', () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to Vellor')).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Currency/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
  });

  it('prevents submission with empty name', async () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    const form = screen.getByRole('button', { name: /Get Started/i }).closest('form');
    fireEvent.submit(form!);

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid name.');
    expect(mockUpdateSettings).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('prevents submission with DEFAULT_USER_NAME', async () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Your Name/i);
    fireEvent.change(nameInput, { target: { value: DEFAULT_USER_NAME } });

    const form = screen.getByRole('button', { name: /Get Started/i }).closest('form');
    fireEvent.submit(form!);

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid name.');
    expect(mockUpdateSettings).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('submits successfully with valid data', async () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Your Name/i);
    fireEvent.change(nameInput, { target: { value: 'Rahul Sharma' } });

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'rahul@example.com' } });

    const form = screen.getByRole('button', { name: /Get Started/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        userName: 'Rahul Sharma',
        currencySymbol: '$',
        country: 'United States',
        phone: { countryCode: '+1', number: '' },
        email: 'rahul@example.com',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('updates phone country code when country changes', async () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    const countrySelect = screen.getByLabelText(/Country/i);
    fireEvent.change(countrySelect, { target: { value: 'India' } });

    const nameInput = screen.getByLabelText(/Your Name/i);
    fireEvent.change(nameInput, { target: { value: 'Rahul Sharma' } });

    const form = screen.getByRole('button', { name: /Get Started/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({
        country: 'India',
        phone: { countryCode: '+91', number: '' },
      }));
    });
  });
});
