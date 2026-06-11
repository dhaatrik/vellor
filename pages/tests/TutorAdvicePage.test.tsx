import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TutorAdvicePage } from '../TutorAdvicePage';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => <div className={className} data-testid="motion-div" {...props}>{children}</div>,
    },
}));

// Mock the Icon component
vi.mock('../../components/ui', () => ({
    Icon: ({ iconName, className }: any) => <span data-testid={`icon-${iconName}`} className={className} />,
}));

describe('TutorAdvicePage', () => {
    it('renders the main heading correctly', () => {
        render(<TutorAdvicePage />);
        expect(screen.getByText('Friendly Advices to be a Great Tutor')).toBeInTheDocument();
        expect(screen.getByTestId('icon-book-open')).toBeInTheDocument();
        expect(screen.getByText('Elevate your teaching quality, build strong relationships with your students, and maximize your impact.')).toBeInTheDocument();
    });

    it('renders all advice sections', () => {
        render(<TutorAdvicePage />);

        // Test a few specific advice titles to ensure the list renders
        expect(screen.getByText('1. Don\'t Be a "Teacher." Be a Friend (and a Mentor).')).toBeInTheDocument();
        expect(screen.getByText('2. Make AI Your Ultimate Teaching Co-Pilot.')).toBeInTheDocument();
        expect(screen.getByText('7. Flip the Script (The Feynman Technique).')).toBeInTheDocument();
        expect(screen.getByText('15. Stay Insanely Curious Yourself.')).toBeInTheDocument();
    });
});
