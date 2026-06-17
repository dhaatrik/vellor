import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Icon } from '../Icon';
import '@testing-library/jest-dom';

describe('Icon Component', () => {
  it('renders a mapped icon correctly', () => {
    // Render the 'user' icon which maps to LucideIcons.User
    const { container } = render(<Icon iconName="user" />);
    // lucide-react renders an svg with the class "lucide" and a specific class for the icon, like "lucide-user"
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('lucide-user');
  });

  it('renders the fallback icon (HelpCircle) for unknown iconName', () => {
    const { container } = render(<Icon iconName={'unknown-icon-name' as any} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    // HelpCircle maps to lucide-circle-question-mark
    expect(svgElement).toHaveClass('lucide-circle-question-mark');
  });

  it('applies default classes and aria-hidden="true"', () => {
    const { container } = render(<Icon iconName="user" />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveClass('w-6', 'h-6');
    expect(svgElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies custom className and additional props', () => {
    const { container } = render(
      <Icon iconName="star" className="custom-icon-class text-yellow-500" data-testid="custom-icon" />
    );
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveClass('custom-icon-class', 'text-yellow-500');
    expect(svgElement).toHaveAttribute('data-testid', 'custom-icon');
  });
});
