import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Textarea } from '../Textarea';
import '@testing-library/jest-dom';
import React from 'react';

describe('Textarea Component', () => {
  it('renders correctly with default props', () => {
    render(<Textarea placeholder="Enter text here" />);
    const textarea = screen.getByPlaceholderText('Enter text here');

    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('block', 'w-full', 'border'); // Check some base styles
  });

  it('renders a label when provided', () => {
    render(<Textarea label="My Label" name="my-textarea" />);

    const label = screen.getByText('My Label');
    const textarea = screen.getByRole('textbox', { name: 'My Label' });

    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'my-textarea');
    expect(textarea).toHaveAttribute('id', 'my-textarea');
  });

  it('renders required asterisk when required prop is true', () => {
    render(<Textarea label="Required Field" name="req-textarea" required />);

    // The asterisk is an element with aria-hidden="true" containing "*" inside the label
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-danger');
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');

    // Testing library calculates accessible name based on label text. Since asterisk has aria-hidden=true, it shouldn't be part of the accessible name.
    const textarea = screen.getByRole('textbox', { name: 'Required Field' });
    expect(textarea).toBeRequired();
  });

  it('renders an error message and applies error styles', () => {
    render(<Textarea name="error-textarea" error="This field is required" />);

    const errorMessage = screen.getByText('This field is required');
    const textarea = screen.getByRole('textbox');

    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-danger');

    expect(textarea).toHaveClass('border-danger');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', 'error-textarea-error');
    expect(errorMessage).toHaveAttribute('id', 'error-textarea-error');
  });

  it('handles user input correctly', async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Type something" />);

    const textarea = screen.getByPlaceholderText('Type something');
    await user.type(textarea, 'Hello World');

    expect(textarea).toHaveValue('Hello World');
  });

  it('applies custom className and wrapperClassName', () => {
    render(
      <div data-testid="wrapper-parent">
        <Textarea
          label="Custom"
          name="custom-textarea" // Needs name to associate label properly via htmlFor
          className="custom-textarea-class"
          wrapperClassName="custom-wrapper-class"
        />
      </div>
    );

    const textarea = screen.getByRole('textbox', { name: 'Custom' });
    expect(textarea).toHaveClass('custom-textarea-class');

    // The wrapper is the direct parent of the label and textarea
    const wrapper = textarea.parentElement;
    expect(wrapper).toHaveClass('custom-wrapper-class');
  });

  it('handles disabled state', () => {
    render(<Textarea disabled placeholder="Disabled" />);

    const textarea = screen.getByPlaceholderText('Disabled');
    expect(textarea).toBeDisabled();
    // The class 'disabled:opacity-50' is part of baseStyle
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} name="ref-test" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current?.name).toBe('ref-test');
  });
});
