import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentProgressTab } from '../StudentProgressTab';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: any) => <div className={className} onClick={onClick} {...props}>{children}</div>,
    button: ({ children, className, onClick, ...props }: any) => <button className={className} onClick={onClick} {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('StudentProgressTab', () => {
  const mockSetShowReportModal = vi.fn();
  const mockFormatGrade = vi.fn((val: number) => val.toString());

  it('renders correctly with empty transactions', () => {
    render(
      <StudentProgressTab
        gradeChartData={[]}
        progressTransactions={[]}
        setShowReportModal={mockSetShowReportModal}
        formatGrade={mockFormatGrade}
      />
    );

    expect(screen.getByText('No progress records found.')).toBeInTheDocument();
    expect(screen.getByText('Add a grade or remark when logging lessons.')).toBeInTheDocument();
  });
});
