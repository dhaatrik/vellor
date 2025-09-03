
/**
 * @file App.tsx
 * This is the main application component file.
 * It sets up the global data provider, routing, and the main layout structure
 * including the sidebar and content area.
 */

import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { DataProvider, useData } from './store'; // Context provider and hook
import { NavbarLink, Icon, Button } from './components/UI'; // Reusable UI components
import { DashboardPage, StudentsPage, TransactionsPage, SettingsPage, AchievementsPage } from './pages/Pages'; // Page components
import { Theme } from './types'; // Theme enum

/**
 * Defines the main visual structure of the application, including a responsive sidebar
 * for navigation and a main content area where different pages are rendered.
 * It also handles mobile-specific layout adjustments, such as a collapsible sidebar.
 * @returns {React.ReactElement} A JSX element representing the complete application layout.
 */
const AppLayout: React.FC = () => {
  // Access data and functions from the global context
  const { settings, toggleTheme, gamification, achievements } = useData();
  // State for managing the visibility of the sidebar on mobile devices
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Calculate the number of achieved achievements to display a badge in the navbar
  const achievedCount = achievements.filter(a => a.achieved).length;

  /**
   * Handles clicks on navigation links, closing the mobile sidebar if it's open.
   * This ensures that after navigating to a new page on a mobile device,
   * the sidebar menu automatically hides.
   * @returns {void}
   */
  const handleNavLinkClick = () => {
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    // Main container div, applies theme class for dark/light mode styling
    <div className={`flex h-screen font-sans ${settings.theme}`}>
      {/* Hamburger button for opening mobile sidebar (visible only on small screens) */}
      <Button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2" // High z-index to be above content
        aria-label="Open navigation"
        variant="primary"
        size="sm"
      >
        <Icon iconName="bars" className="w-5 h-5"/>
      </Button>

      {/* Overlay for mobile sidebar (dims background when sidebar is open) */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)} // Close sidebar on overlay click
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 bg-white dark:bg-primary shadow-lg flex flex-col 
                   fixed md:static inset-y-0 left-0 z-30 
                   transform transition-transform duration-300 ease-in-out 
                   ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                   md:translate-x-0`} // Manages sidebar visibility and animation
        aria-label="Main Navigation"
      >
        {/* Sidebar Header: Logo, App Name, User Welcome */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-1">
            <Link 
              to="/dashboard" 
              onClick={handleNavLinkClick} 
              className="text-xl sm:text-2xl font-bold text-primary dark:text-secondary flex items-center" // dark:text-primary-light -> dark:text-secondary
            >
              <Icon iconName="academic-cap" className="w-6 h-6 sm:w-7 sm:h-7 mr-2" />
              TutorFlow
            </Link>
            {/* Close button for mobile sidebar */}
            <Button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden"
              variant="ghost"
              size="sm"
              aria-label="Close navigation"
            >
              <Icon iconName="x-mark" className="w-5 h-5"/>
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Welcome, {settings.userName}!</p>
        </div>
        
        {/* Main Navigation Links */}
        <nav className="flex-grow p-4 space-y-2">
          <NavbarLink to="/dashboard" iconName="chart-bar" onClick={handleNavLinkClick}>Dashboard</NavbarLink>
          <NavbarLink to="/students" iconName="users" onClick={handleNavLinkClick}>Students</NavbarLink>
          <NavbarLink to="/transactions" iconName="banknotes" onClick={handleNavLinkClick}>Transactions</NavbarLink>
          <NavbarLink to="/achievements" iconName="sparkles" onClick={handleNavLinkClick}>
            Achievements 
            {/* Badge for number of achieved achievements */}
            {achievedCount > 0 && <span className="ml-auto inline-block py-0.5 px-1.5 leading-none text-xs font-semibold bg-secondary text-primary rounded-full">{achievedCount}</span>}
          </NavbarLink>
          <NavbarLink to="/settings" iconName="cog" onClick={handleNavLinkClick}>Settings</NavbarLink>
        </nav>

        {/* Sidebar Footer: Gamification Stats and Theme Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                Level: {gamification.levelName} ({gamification.level})
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                Points: {gamification.points}
            </div>
            <Button
                onClick={toggleTheme} // Function to switch between light and dark themes
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={settings.theme === Theme.Dark ? 'sun' : 'moon'} // Icon changes based on current theme
            >
                Switch to {settings.theme === Theme.Dark ? 'Light' : 'Dark'} Mode
            </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100 dark:bg-neutral-800 transition-colors duration-300 md:pt-6 pt-16"> {/* Added pt-16 for mobile to avoid overlap with fixed hamburger */}
        {/* React Router Routes for different pages */}
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          {/* Route for viewing a specific student's details */}
          <Route path="/students/:studentId" element={<StudentsPage />} /> 
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Fallback route: navigates to dashboard for any unmatched paths */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

/**
 * The root component of the TutorFlow application.
 * This component is responsible for setting up the core context providers and routing.
 * It wraps the `AppLayout` with `DataProvider` to supply global state
 * and `HashRouter` to enable client-side navigation.
 * @returns {React.ReactElement} The root JSX element of the application.
 */
const App: React.FC = () => {
  return (
    // DataProvider makes global state (students, transactions, settings, etc.) available
    <DataProvider>
      {/* HashRouter is used for client-side routing, suitable for static hosting */}
      <HashRouter>
        <AppLayout /> {/* The main layout containing sidebar and content */}
      </HashRouter>
    </DataProvider>
  );
};

export default App;