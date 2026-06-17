
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LegalModals } from '../LegalModals';

describe('LegalModals', () => {
  const defaultProps = {
    aboutOpen: false,
    setAboutOpen: vi.fn(),
    privacyOpen: false,
    setPrivacyOpen: vi.fn(),
    termsOpen: false,
    setTermsOpen: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when all modals are closed', () => {
    render(<LegalModals {...defaultProps} />);

    expect(screen.queryByText('About Vellor')).not.toBeInTheDocument();
    expect(screen.queryByText('Privacy Policy')).not.toBeInTheDocument();
    expect(screen.queryByText('Terms & Conditions')).not.toBeInTheDocument();
  });

  it('renders the About modal when aboutOpen is true', () => {
    render(<LegalModals {...defaultProps} aboutOpen={true} />);

    expect(screen.getByText('About Vellor')).toBeInTheDocument();
    expect(screen.getByText(/Vellor \(from Vellum \+ Valor\)/i)).toBeInTheDocument();

    // There are multiple close buttons (one in the header with an icon, one in the footer with text)
    // We get the one with the text "Close"
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    // Click the actual 'Close' button inside the modal body, not the 'X'
    const closeButton = closeButtons.find(btn => btn.textContent === 'Close') || closeButtons[0];

    fireEvent.click(closeButton);
    expect(defaultProps.setAboutOpen).toHaveBeenCalledWith(false);
  });

  it('renders the Privacy Policy modal when privacyOpen is true', () => {
    render(<LegalModals {...defaultProps} privacyOpen={true} />);

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText(/We don't want your data, and we literally can't see it./i)).toBeInTheDocument();

    // Test understood button
    const understoodButton = screen.getByRole('button', { name: /understood/i });
    fireEvent.click(understoodButton);
    expect(defaultProps.setPrivacyOpen).toHaveBeenCalledWith(false);
  });

  it('renders the Terms & Conditions modal when termsOpen is true', () => {
    render(<LegalModals {...defaultProps} termsOpen={true} />);

    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    expect(screen.getByText(/"Zero Strings Attached"/i)).toBeInTheDocument();

    // Test got it button
    const gotItButton = screen.getByRole('button', { name: /got it/i });
    fireEvent.click(gotItButton);
    expect(defaultProps.setTermsOpen).toHaveBeenCalledWith(false);
  });

  it('renders multiple modals if multiple props are true', () => {
    render(<LegalModals {...defaultProps} aboutOpen={true} privacyOpen={true} />);

    expect(screen.getByText('About Vellor')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });
});
