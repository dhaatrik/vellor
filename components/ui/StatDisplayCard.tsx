/**
 * @file StatDisplayCard.tsx
 * Defines the StatDisplayCard component for showing key statistics.
 */

import React from 'react';
import { Card } from './Card';
import { Icon, IconProps } from './Icon';

/**
 * Props for the StatDisplayCard component.
 */
interface StatDisplayCardProps {
    /** Title of the statistic (e.g., "Total Unpaid"). */
    title: string;
    /** Value of the statistic (e.g., "$500.00" or 10). */
    value: string | number;
    /** Name of the icon to display in the card. */
    iconName: IconProps['iconName'];
    /** Optional Tailwind CSS class for the icon color (e.g., "text-green-500"). */
    iconColorClass?: string;
    /** Optional Tailwind CSS class for the icon's background circle (e.g., "bg-green-500 bg-opacity-20"). */
    iconBgClass?: string; 
    /** Optional CSS classes to apply to the card container. */
    className?: string;
    /** Optional click handler to make the card interactive. */
    onClick?: () => void;
}
/**
 * A specialized card component for displaying a single key statistic, such as a total amount or count.
 * It features a prominent value, a title, a decorative icon, and can be made clickable.
 *
 * @param {StatDisplayCardProps} props - The properties for the StatDisplayCard component.
 * @returns {React.ReactElement} A JSX element representing the statistic display card.
 */
export const StatDisplayCard: React.FC<StatDisplayCardProps> = ({ 
    title, 
    value, 
    iconName, 
    iconColorClass: customIconColorClass, 
    iconBgClass: customIconBgClass, 
    className = "",
    onClick 
}) => {
    const defaultIconColorClass = 'text-accent';
    const defaultIconBgClass = 'bg-accent/10';

    const finalIconColorClass = customIconColorClass || defaultIconColorClass;
    const finalIconBgClass = customIconBgClass || defaultIconBgClass;

    const cardClasses = `relative overflow-hidden group ${className} ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0' : ''}`;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <Card
            className={cardClasses}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={handleKeyDown}
        >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-transparent blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
                </div>
                <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl ${finalIconBgClass} shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon iconName={iconName} className={`w-6 h-6 ${finalIconColorClass}`} />
                </div>
            </div>
        </Card>
    );
};