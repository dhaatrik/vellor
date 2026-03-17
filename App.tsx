/**
 * @file App.tsx
 * This is the main application component file.
 * It sets up the global data provider, routing, and the main layout structure
 * including the sidebar and content area.
 */

import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { DataProvider, useData } from './store'; // Context provider and hook
import { NavbarLink, Icon, Button, ToastContainer, FAB, LegalModals } from './components/ui'; // Reusable UI components
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { WelcomePage } from './pages/WelcomePage';
import { ProfilePage } from './pages/ProfilePage';
import { Theme } from './types'; // Theme enum
import { DEFAULT_USER_NAME } from './constants';

/**
 * Defines the main visual structure of the application, including a responsive sidebar
 * for navigation and a main content area where different pages are rendered.
 * It also handles mobile-specific layout adjustments, such as a collapsible sidebar.
 * @returns {React.ReactElement} A JSX element representing the complete application layout.
 */
const AppLayout: React.FC = () => {
  // Access data and functions from the global context
  const { settings, toggleTheme, gamification, achievements, logout } = useData();
  // State for managing the visibility of the sidebar on mobile devices
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

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
      {/* Overlay for mobile sidebar (dims background when sidebar is open) */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)} // Close sidebar on overlay click
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`w-72 bg-white dark:bg-primary border-r border-gray-100 dark:border-white/5 flex flex-col 
                   fixed md:static inset-y-0 left-0 z-50 
                   transform transition-transform duration-300 ease-in-out 
                   ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                   md:translate-x-0`} // Manages sidebar visibility and animation
        aria-label="Main Navigation"
      >
        {/* Sidebar Header: Logo, App Name */}
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <Link 
              to="/dashboard" 
              onClick={handleNavLinkClick} 
              className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-primary-dark group-hover:scale-105 transition-transform">
                <Icon iconName="academic-cap" className="w-6 h-6" />
              </div>
              Vellor
            </Link>
            {/* Close button for mobile sidebar */}
            <Button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden !p-2 rounded-full"
              variant="ghost"
              size="sm"
              aria-label="Close navigation"
            >
              <Icon iconName="x-mark" className="w-5 h-5"/>
            </Button>
          </div>
        </div>
        
        {/* Main Navigation Links */}
        <nav className="flex-grow px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <NavbarLink to="/dashboard" iconName="chart-bar" onClick={handleNavLinkClick}>Dashboard</NavbarLink>
          <NavbarLink to="/students" iconName="users" onClick={handleNavLinkClick}>Students</NavbarLink>
          <NavbarLink to="/transactions" iconName="banknotes" onClick={handleNavLinkClick}>Transactions</NavbarLink>
          <NavbarLink to="/achievements" iconName="sparkles" onClick={handleNavLinkClick}>
            Achievements 
            {/* Badge for number of achieved achievements */}
            {achievedCount > 0 && <span className="ml-auto inline-block py-0.5 px-2 leading-none text-xs font-bold bg-accent text-primary-dark rounded-full">{achievedCount}</span>}
          </NavbarLink>
          <NavbarLink to="/profile" iconName="user-circle" onClick={handleNavLinkClick}>Profile & Settings</NavbarLink>
        </nav>

        {/* Sidebar Footer: Gamification Stats */}
        <div className="p-6 m-4 mt-auto bg-gray-50 dark:bg-primary-light rounded-3xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Icon iconName="star" className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level {gamification.level}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{gamification.levelName}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Points</span>
                <span className="font-bold text-accent">{gamification.points}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-primary rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${(gamification.points % 100)}%` }}></div>
              </div>
            </div>
        </div>

        {/* Sidebar Footer: Legal Links */}
        <div className="px-6 pb-6 text-xs text-center text-gray-500 dark:text-gray-400 space-x-3">
          <button onClick={() => setAboutOpen(true)} className="hover:text-accent transition-colors">About</button>
          <span>&middot;</span>
          <button onClick={() => setPrivacyOpen(true)} className="hover:text-accent transition-colors">Privacy</button>
          <span>&middot;</span>
          <button onClick={() => setTermsOpen(true)} className="hover:text-accent transition-colors">Terms</button>
        </div>
      </aside>

      {/* Main Content Wrapper (includes Topbar and Page Content) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-secondary dark:bg-primary-dark">
        {/* Topbar */}
        <header className="flex-shrink-0 h-16 bg-white/50 dark:bg-primary-dark/50 backdrop-blur-md border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
          <div className="flex items-center">
            {/* Hamburger button for opening mobile sidebar */}
            <Button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden mr-4 !p-2 rounded-full"
              aria-label="Open navigation"
              variant="ghost"
              size="sm"
            >
              <Icon iconName="bars" className="w-5 h-5"/>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                aria-label={`Switch to ${settings.theme === Theme.Dark ? 'Light' : 'Dark'} Mode`}
                className="!p-2 rounded-full"
            >
                <Icon iconName={settings.theme === Theme.Dark ? 'sun' : 'moon'} className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Button>
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary-dark font-bold text-sm" title={settings.userName}>
                {settings.userName.charAt(0).toUpperCase()}
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                aria-label="Logout"
                className="!p-2 rounded-full text-danger hover:bg-danger/10"
                title="Logout"
              >
                <Icon iconName="arrow-right-on-rectangle" className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative">
          {/* React Router Routes for different pages */}
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            {/* Route for viewing a specific student's details */}
            <Route path="/students/:studentId" element={<StudentsPage />} /> 
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Fallback route: navigates to dashboard for any unmatched paths */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <FAB />
        </main>
      </div>

      {/* Legal Modals */}
      <LegalModals 
        aboutOpen={aboutOpen} setAboutOpen={setAboutOpen}
        privacyOpen={privacyOpen} setPrivacyOpen={setPrivacyOpen}
        termsOpen={termsOpen} setTermsOpen={setTermsOpen}
      />
    </div>
  );
};


/**
 * A component that conditionally renders either the Welcome page or the main
 * application layout based on whether the user has completed the initial setup.
 * @returns {React.ReactElement} Either the Welcome page or the main AppLayout.
 */
const AppContent: React.FC = () => {
  const { settings } = useData();

  // If the user hasn't set their name yet (i.e., it's still the default),
  // show the welcome page and restrict access to other parts of the app.
  if (settings.userName === DEFAULT_USER_NAME) {
    return (
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        {/* Redirect any other path to the welcome page */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    );
  }

  // Otherwise, the user is set up, so show the main app layout.
  return <AppLayout />;
};


/**
 * The root component of the Vellor application.
 * This component is responsible for setting up the core context providers and routing.
 * It wraps the `AppContent` with `DataProvider` to supply global state
 * and `HashRouter` to enable client-side navigation.
 * @returns {React.ReactElement} The root JSX element of the application.
 */
const App: React.FC = () => {
  return (
    // DataProvider makes global state (students, transactions, settings, etc.) available
    <DataProvider>
      {/* HashRouter is used for client-side routing, suitable for static hosting */}
      <HashRouter>
        <AppContent /> {/* Renders Welcome or AppLayout based on setup status */}
        <ToastContainer /> {/* Global toast container available on all pages */}
      </HashRouter>
    </DataProvider>
  );
};

export default App;