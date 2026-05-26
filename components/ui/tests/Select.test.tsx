import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Select } from '../Select';

describe('Select component', () => {
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  it('renders correctly with default props', () => {
    render(<Select options={options} name="fruits" />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Check if options are rendered
    const optionElements = screen.getAllByRole('option');
    expect(optionElements).toHaveLength(3);
    expect(optionElements[0]).toHaveTextContent('Apple');
    expect(optionElements[0]).toHaveValue('apple');
  });

  it('renders label and handles required prop', () => {
    render(<Select label="Favorite Fruit" name="fruits" options={options} required />);

    const label = screen.getByText('Favorite Fruit');
    expect(label).toBeInTheDocument();

    // Check for required asterisk
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-danger');
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');

    const select = screen.getByRole('combobox', { name: /Favorite Fruit/i });
    expect(select).toBeRequired();
  });

  it('renders placeholder correctly', () => {
    render(<Select options={options} name="fruits" placeholder="Choose a fruit" defaultValue="" />);

    const select = screen.getByRole('combobox');
    const optionElements = screen.getAllByRole('option', { hidden: true });

    // 3 options + 1 placeholder (placeholder is hidden, so we use hidden: true for query)
    expect(optionElements).toHaveLength(4);

    // First option should be the placeholder
    expect(optionElements[0]).toHaveTextContent('Choose a fruit');
    expect(optionElements[0]).toHaveValue('');
    expect(optionElements[0]).toBeDisabled();

    // It should be selected by default if no value is provided and defaultValue="" is set
    expect((select as HTMLSelectElement).value).toBe('');
  });

  it('handles error state correctly', () => {
    render(
      <Select
        options={options}
        name="fruits"
        error="Please select a fruit"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveClass('border-danger');

    const errorMessage = screen.getByText('Please select a fruit');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-danger');
    expect(errorMessage.id).toBe('fruits-error');

    expect(select).toHaveAttribute('aria-describedby', 'fruits-error');
  });

  it('applies custom classes correctly', () => {
    render(
      <Select
        options={options}
        name="fruits"
        className="custom-select-class"
        wrapperClassName="custom-wrapper-class"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-select-class');

    // The wrapper is the parent div
    const wrapper = select.parentElement?.parentElement;
    expect(wrapper).toHaveClass('custom-wrapper-class');
  });

  it('handles selection changes', () => {
    const onChangeMock = vi.fn();
    render(<Select options={options} name="fruits" onChange={onChangeMock} />);

    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'banana' } });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect((select as HTMLSelectElement).value).toBe('banana');
  });

  it('supports disabled state', () => {
    render(<Select options={options} name="fruits" disabled />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:opacity-50');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Select options={options} name="fruits" ref={ref} />);

    expect(ref.current).not.toBeNull();
    expect((ref.current as any).tagName).toBe('SELECT');
  });
});
