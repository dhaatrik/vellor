/**
 * @file NavbarLink.tsx
 * Defines the NavbarLink component for sidebar navigation.
 */

import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, IconProps } from './Icon';
import { motion } from 'framer-motion';

/**
 * Props for the NavbarLink component.
 */
interface NavbarLinkProps {
  /** The path to navigate to when the link is clicked. */
  to: string;
  /** The content of the link, typically text. */
  children: ReactNode;
  /** Optional icon name to display to the left of the link text. */
  iconName?: IconProps['iconName'];
  /** Optional click handler. */
  onClick?: () => void;
}
/**
 * A navigation link component designed for use in sidebars or navigation menus.
 * It integrates with `react-router-dom`'s `NavLink` to automatically apply active
 * state styling when the link's route matches the current URL.
 *
 * @param {NavbarLinkProps} props - The properties for the NavbarLink component.
 * @returns {React.ReactElement} A JSX element representing the navigation link.
 */
export const NavbarLink: React.FC<NavbarLinkProps> = ({ to, children, iconName, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ease-out group overflow-hidden
        ${isActive
          ? 'text-primary-dark dark:text-accent bg-accent/10 dark:bg-accent/10'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-primary-light hover:text-gray-900 dark:hover:text-gray-200'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="navbar-active-bg"
              className="absolute inset-0 bg-accent/20 dark:bg-accent/10 rounded-2xl"
              initial={false}
              transition={{ type: "spring", stiffness: 220, damping: 29, mass: 1, restDelta: 0.001 }}
            />
          )}
          <span className="relative z-10 flex items-center w-full">
            {iconName && (
              <Icon 
                iconName={iconName} 
                className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-accent-dark dark:text-accent' : ''}`} 
              />
            )}
            {children}
          </span>
        </>
      )}
    </NavLink>
  );
};