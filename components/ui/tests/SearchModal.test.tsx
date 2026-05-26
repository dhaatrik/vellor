import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchModal } from '../SearchModal';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../store', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      students: [
        { id: '1', firstName: 'Alice', lastName: 'Smith' },
        { id: '2', firstName: 'Bob', lastName: 'Jones' },
        { id: '3', firstName: 'Charlie', lastName: 'Brown' },
        { id: '4', firstName: 'David', lastName: 'Williams' },
        { id: '5', firstName: 'Eve', lastName: 'Davis' },
        { id: '6', firstName: 'Frank', lastName: 'Miller' },
      ],
    };
    return selector(state);
  })
}));

describe('SearchModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <MemoryRouter>
        <SearchModal {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Search or enter command...')).toBeInTheDocument();
    expect(screen.getByText('Command Palette')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <MemoryRouter>
        <SearchModal {...defaultProps} isOpen={false} />
      </MemoryRouter>
    );
    expect(screen.queryByPlaceholderText('Search students...')).not.toBeInTheDocument();
  });

  it('filters students based on search query', async () => {
    render(
      <MemoryRouter>
        <SearchModal {...defaultProps} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search or enter command...');
    fireEvent.change(input, { target: { value: 'alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
  });

  it('limits results to 5 students', async () => {
    render(
      <MemoryRouter>
        <SearchModal {...defaultProps} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search or enter command...');
    fireEvent.change(input, { target: { value: 'i' } });

    await waitFor(() => {
      const results = screen.getAllByRole('button');
      expect(results.length).toBeGreaterThan(0);
    });

    const displayedNames = ['Alice Smith', 'Charlie Brown', 'David Williams', 'Eve Davis', 'Frank Miller', 'Bob Jones'].filter(
      name => screen.queryByText(name) !== null
    );
    expect(displayedNames.length).toBe(5);
  });

  it('displays "No results found" for unmatched queries', async () => {
    render(
      <MemoryRouter>
        <SearchModal {...defaultProps} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search or enter command...');
    fireEvent.change(input, { target: { value: 'xyz' } });

    await waitFor(() => {
      expect(screen.getByText('ERR: COMMAND_UNRECOGNIZED')).toBeInTheDocument();
      expect(screen.getByText(/No matching records or macros found for "xyz"/)).toBeInTheDocument();
    });
  });

  it('navigates to student and closes modal on selection (click)', async () => {
    render(
      <MemoryRouter>
        <SearchModal {...defaultProps} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search or enter command...');
    fireEvent.change(input, { target: { value: 'alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Alice Smith'));

    expect(mockNavigate).toHaveBeenCalledWith('/students/1');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('navigates to student and closes modal on selection (keyboard enter)', async () => {
    render(
      <MemoryRouter>
        <SearchModal {...defaultProps} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search or enter command...');
    fireEvent.change(input, { target: { value: 'alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const studentRow = screen.getByText('Alice Smith').closest('div[role="button"]');
    if (studentRow) {
      fireEvent.keyDown(studentRow, { key: 'Enter', code: 'Enter' });
    }

    expect(mockNavigate).toHaveBeenCalledWith('/students/1');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('navigates to student and closes modal on selection (keyboard space)', async () => {
    render(
      <MemoryRouter>
        <SearchModal {...defaultProps} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search or enter command...');
    fireEvent.change(input, { target: { value: 'alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const studentRow = screen.getByText('Alice Smith').closest('div[role="button"]');
    if (studentRow) {
      fireEvent.keyDown(studentRow, { key: ' ', code: 'Space' });
    }

    expect(mockNavigate).toHaveBeenCalledWith('/students/1');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });


  it('handles keyboard navigation that is not enter or space', async () => {
    render(
      <MemoryRouter>
        <SearchModal {...defaultProps} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search or enter command...');
    fireEvent.change(input, { target: { value: 'alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const studentRow = screen.getByText('Alice Smith').closest('div[role="button"]');
    if (studentRow) {
      fireEvent.keyDown(studentRow, { key: 'ArrowDown', code: 'ArrowDown' });
    }

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
