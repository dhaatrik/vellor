import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { Input } from '../Input';

describe('Input component', () => {
  it('renders correctly with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('renders a label when provided', () => {
    render(<Input label="Username" name="username" />);
    const label = screen.getByText('Username');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'username');

    // The input should be accessible via the label
    const input = screen.getByLabelText('Username');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'username');
  });

  it('renders a required asterisk when required is true and label is provided', () => {
    render(<Input label="Password" name="password" required />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-danger');
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');

    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('renders helper text when provided without an error', () => {
    render(<Input name="email" helperText="We will never share your email." />);
    const helperText = screen.getByText('We will never share your email.');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveAttribute('id', 'email-helper');

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'email-helper');
  });

  it('renders error message and applies error styles and aria attributes', () => {
    render(<Input name="username" error="Username is required" helperText="This should not show" />);

    const errorMessage = screen.getByText('Username is required');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('id', 'username-error');
    expect(errorMessage).toHaveClass('text-danger');

    // Helper text should NOT be rendered if there's an error
    expect(screen.queryByText('This should not show')).not.toBeInTheDocument();

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'username-error');
    expect(input).toHaveClass('border-danger');
  });

  it('handles custom className and wrapperClassName', () => {
    render(
      <Input
        name="test"
        className="custom-input-class"
        wrapperClassName="custom-wrapper-class"
        data-testid="test-input"
      />
    );

    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('custom-input-class');

    const wrapper = input.parentElement;
    expect(wrapper).toHaveClass('custom-wrapper-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input name="test" ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('INPUT');
  });

  it('forwards standard input attributes', () => {
    render(<Input name="test" disabled data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toBeDisabled();
  });

  it('calls onChange handler when value changes', () => {
    const onChangeMock = vi.fn();
    render(<Input name="test" onChange={onChangeMock} data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });
});
