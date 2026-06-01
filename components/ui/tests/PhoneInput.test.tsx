
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PhoneInput } from '../PhoneInput';

describe('PhoneInput Component', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    name: 'phone',
    value: { countryCode: '+1', number: '1234567890' },
    onChange: mockOnChange,
  };

  it('renders correctly with given props', () => {
    render(<PhoneInput {...defaultProps} label="Phone Number" />);

    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
  });

  it('calls onChange when the input value changes', () => {
    render(<PhoneInput {...defaultProps} />);

    const input = screen.getByDisplayValue('1234567890');
    fireEvent.change(input, { target: { value: '9876543210' } });

    expect(mockOnChange).toHaveBeenCalledWith('phone', { countryCode: '+1', number: '9876543210' });
  });

  it('removes non-digit characters from the input', () => {
    render(<PhoneInput {...defaultProps} />);

    const input = screen.getByDisplayValue('1234567890');
    fireEvent.change(input, { target: { value: 'a1b2c3d4e5' } });

    expect(mockOnChange).toHaveBeenCalledWith('phone', { countryCode: '+1', number: '12345' });
  });

  it('limits the input to 10 digits', () => {
    render(<PhoneInput {...defaultProps} />);

    const input = screen.getByDisplayValue('1234567890');
    fireEvent.change(input, { target: { value: '1234567890123' } });

    expect(mockOnChange).toHaveBeenCalledWith('phone', { countryCode: '+1', number: '1234567890' });
  });

  it('handles empty input properly', () => {
    render(<PhoneInput {...defaultProps} />);

    const input = screen.getByDisplayValue('1234567890');
    fireEvent.change(input, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith('phone', { countryCode: '+1', number: '' });
  });

  it('handles invalid inputs properly', () => {
    render(<PhoneInput {...defaultProps} />);

    const input = screen.getByDisplayValue('1234567890');
    fireEvent.change(input, { target: { value: 'invalid_string' } });

    expect(mockOnChange).toHaveBeenCalledWith('phone', { countryCode: '+1', number: '' });
  });
});
