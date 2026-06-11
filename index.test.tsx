import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  },
}));

// Mock the App component to avoid rendering issues
vi.mock('./App', () => ({
  default: () => <div data-testid="app-mock" />
}));

describe('index.tsx entry point', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('renders without crashing if root element exists', async () => {
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    const ReactDOM = await import('react-dom/client');
    const renderMock = vi.fn();
    vi.mocked(ReactDOM.default.createRoot).mockReturnValue({
      render: renderMock,
      unmount: vi.fn(),
    } as any);

    // Import index.tsx dynamically
    await import('./index.tsx');

    expect(ReactDOM.default.createRoot).toHaveBeenCalledWith(rootElement);
    expect(renderMock).toHaveBeenCalled();
  });

  it('throws an error if root element does not exist', async () => {
    // Intentionally no root element
    document.body.innerHTML = '';

    // reset modules so it gets executed again
    vi.resetModules();
    await expect(import('./index.tsx')).rejects.toThrow('Could not find root element to mount to');
  });
});
