import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

// Mock matchMedia to fix Dialog errors in test environments
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Framer Motion / Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Modal component', () => {
  it('does not render content when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Title">
        <div data-testid="modal-content">Content</div>
      </Modal>
    );

    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('renders children and title when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title">
        <div data-testid="modal-content">Content</div>
      </Modal>
    );

    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders footer if provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} footer={<button>Footer Button</button>}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <Modal isOpen={true} onClose={onCloseMock} title="Test Title">
        <div>Content</div>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('applies custom maxWidthClass to the modal container', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title" maxWidthClass="max-w-2xl">
        <div data-testid="modal-content">Content</div>
      </Modal>
    );

    const dialogContent = screen.getByRole('dialog');
    expect(dialogContent).toHaveClass('max-w-2xl');
  });
});
