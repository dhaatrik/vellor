import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { NavbarLink, Icon, Button, FAB, LegalModals, Modal, SearchModal, TerminalBackground } from '../ui';
import { useReminders } from '../../useReminders';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { QuickLogModal } from '../transactions/QuickLogModal';
import { DashboardPage } from '../../pages/DashboardPage';
import { StudentsPage } from '../../pages/StudentsPage';
import { BackupPromptModal } from '../BackupPromptModal';
import { TransactionsPage } from '../../pages/TransactionsPage';
import { CalendarPage } from '../../pages/CalendarPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { AchievementsPage } from '../../pages/AchievementsPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { TutorAdvicePage } from '../../pages/TutorAdvicePage';
import { TUTOR_RANK_LEVELS } from '../../constants';

export const AppLayout: React.FC = () => {
  // Access data and functions from the store
  const settings = useStore(s => s.settings);
  const gamification = useStore(s => s.gamification);
  const achievements = useStore(s => s.achievements);
  const logout = useStore(s => s.logout);
  // State for managing the visibility of the sidebar on mobile devices
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  useKeyboardShortcuts(
    () => setIsSearchOpen(true),
    () => setIsQuickLogOpen(true),
    () => setAboutOpen(true)
  );

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      useStore.getState().addToast('Back online! Please consider exporting a backup of your data.', 'info');
    };
    const handleOffline = () => {
      setIsOffline(true);
      useStore.getState().addToast('You are offline. Changes will be saved locally.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (settings.brandColor) {
      document.documentElement.style.setProperty('--color-accent', settings.brandColor);
    } else {
      document.documentElement.style.removeProperty('--color-accent');
    }
  }, [settings.brandColor]);

  // Initialize background reminders check
  useReminders();

  // Calculate the number of achieved achievements to display a badge in the navbar
  let achievedCount = 0;
  for (let i = 0, len = achievements.length; i < len; i++) {
    if (achievements[i].achieved) {
      achievedCount++;
    }
  }

  /**
   * Handles clicks on navigation links, closing the mobile sidebar if it's open.
   * This ensures that after navigating to a new page on a mobile device,
   * the sidebar menu automatically hides.
   * @returns {void}
   */
  const handleNavLinkClick = () => setIsMobileSidebarOpen(false);

  return (
    // Main container div, applies theme class for dark/light mode styling
    <div className={`flex h-screen font-sans ${settings.theme} relative overflow-hidden`}>\n      <TerminalBackground />
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
        className={`will-change-transform transform-gpu contain-layout contain-paint w-72 bg-black/30 backdrop-blur-md border-r border-gray-100 dark:border-white/5 flex flex-col z-10 relative
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
              {settings.brandLogoBase64 ? (
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-primary-dark flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm group-hover:scale-105 transition-transform">
                  <img src={settings.brandLogoBase64} alt="Brand Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <img src="/logo.png" alt="Vellor" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform dark:bg-white/90 dark:rounded-xl dark:p-1" />
              )}
              {settings.userName.split(' ')[0] || 'Vellor'}
            </Link>
            {/* Close button for mobile sidebar */}
            <Button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden !p-2 rounded-full"
              variant="ghost"
              size="sm"
              aria-label="Close navigation"
              title="Close navigation"
            >
              <Icon iconName="x-mark" className="w-5 h-5"/>
            </Button>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-grow px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <NavbarLink to="/dashboard" iconName="chart-bar" onClick={handleNavLinkClick}>Dashboard</NavbarLink>
          <NavbarLink to="/students" iconName="users" onClick={handleNavLinkClick}>Students</NavbarLink>
          <NavbarLink to="/calendar" iconName="calendar" onClick={handleNavLinkClick}>Calendar</NavbarLink>
          <NavbarLink to="/transactions" iconName="banknotes" onClick={handleNavLinkClick}>Transactions</NavbarLink>
          <NavbarLink to="/achievements" iconName="sparkles" onClick={handleNavLinkClick}>
            Achievements
            {/* Badge for number of achieved achievements */}
            {achievedCount > 0 && <span className="ml-auto inline-block py-0.5 px-2 leading-none text-xs font-bold bg-accent text-primary-dark rounded-full">{achievedCount}</span>}
          </NavbarLink>
          <NavbarLink to="/profile" iconName="user-circle" onClick={handleNavLinkClick}>Profile</NavbarLink>
          <NavbarLink to="/settings" iconName="cog" onClick={handleNavLinkClick}>Settings</NavbarLink>
          <NavbarLink to="/tutor-advice" iconName="book-open" onClick={handleNavLinkClick}>Tutor Advice</NavbarLink>
        </nav>

        {/* Sidebar Footer: Gamification Stats */}
        {settings.gamificationEnabled !== false && (
          <div
            className="p-6 m-4 mt-auto bg-gray-50 dark:bg-primary-light rounded-3xl border border-gray-100 dark:border-white/5 cursor-pointer hover:border-accent/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary"
            onClick={() => setRankModalOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setRankModalOpen(true);
              }
            }}
          >
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
                <div className="mt-2 text-xs text-gray-500 font-medium">
                  {gamification.points} Points • {gamification.streak} Day Streak
                </div>
              </div>
          </div>
        )}

        {/* Sidebar Footer: Legal Links */}
        <div className="flex justify-center mb-3">
          <img src="/logo.png" alt="Vellor" className="w-8 h-8 object-contain rounded-md dark:p-1 dark:bg-white/90" style={{ filter: 'grayscale(1) opacity(0.4)' }} />
        </div>
        <div className="px-6 pb-6 text-xs text-center text-gray-500 dark:text-gray-400 space-x-3">
          <button onClick={() => setAboutOpen(true)} className="hover:text-accent transition-colors rounded px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary-dark">About</button>
          <span>&middot;</span>
          <button onClick={() => setPrivacyOpen(true)} className="hover:text-accent transition-colors rounded px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary-dark">Privacy</button>
          <span>&middot;</span>
          <button onClick={() => setTermsOpen(true)} className="hover:text-accent transition-colors rounded px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary-dark">Terms</button>
        </div>
      </aside>

      {/* Main Content Wrapper (includes Topbar and Page Content) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black/30 backdrop-blur-md border-l border-white/5 z-10 relative">
        {/* Topbar */}
        <header className="flex-shrink-0 h-16 bg-white/50 dark:bg-primary-dark/50 backdrop-blur-md border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
          <div className="flex items-center">
            {/* Hamburger button for opening mobile sidebar */}
            <Button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden mr-4 !p-2 rounded-full"
              aria-label="Open navigation"
              title="Open navigation"
              variant="ghost"
              size="sm"
            >
              <Icon iconName="bars" className="w-5 h-5"/>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {isOffline && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-bold whitespace-nowrap" title="Changes are saved locally">
                <Icon iconName="bolt" className="w-4 h-4" />
                Offline Mode
              </div>
            )}
            {/* System Secure Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-gray-700 dark:text-gray-300">SYS_SECURE</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary-dark font-bold text-sm" title={settings.userName}>
                {settings.userName.charAt(0).toUpperCase()}
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                aria-label="Logout"
                title="Logout"
                className="!p-2 rounded-full text-danger hover:bg-danger/10"
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
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tutor-advice" element={<TutorAdvicePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Fallback route: navigates to dashboard for any unmatched paths */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <FAB />
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <QuickLogModal isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} />
        </main>
      </div>

      {/* Target points modal */}
      <Modal isOpen={rankModalOpen} onClose={() => setRankModalOpen(false)} title="Your Tutor Journey">
         <div className="space-y-4">
            {TUTOR_RANK_LEVELS.map((rank, index) => {
                const isCurrent = gamification.level === index + 1;
                const isPassed = gamification.level > index + 1;
                const nextRankPts = TUTOR_RANK_LEVELS[index+1]?.points;
                return (
                   <div key={rank.name} className={`p-4 rounded-2xl flex items-center justify-between border ${isCurrent ? 'border-accent bg-accent/5' : isPassed ? 'border-success/30 bg-success/5' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-primary/50 opacity-60'}`}>
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent ? 'bg-accent/20 text-accent' : isPassed ? 'bg-success/20 text-success' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                             {isPassed ? <Icon iconName="check-circle" className="w-5 h-5" /> : (isCurrent ? <Icon iconName="star" className="w-5 h-5" /> : <Icon iconName="lock-closed" className="w-5 h-5" />)}
                         </div>
                         <div>
                            <h4 className={`font-bold ${isCurrent ? 'text-accent' : isPassed ? 'text-success' : 'text-gray-500'}`}>Level {index + 1}: {rank.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{rank.points} points needed</p>
                         </div>
                      </div>
                      {isCurrent && nextRankPts && (
                          <div className="text-right">
                              <p className="text-xs font-semibold text-accent mb-1">{gamification.points} / {nextRankPts}</p>
                              <div className="w-24 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-accent" style={{width: `${Math.max(0, Math.min(100, ((gamification.points - rank.points) / (nextRankPts - rank.points)) * 100))}%`}}></div>
                              </div>
                          </div>
                      )}
                      {isCurrent && !nextRankPts && (
                          <span className="text-xs font-bold text-accent uppercase tracking-wider">Max Level</span>
                      )}
                   </div>
                )
            })}
         </div>
      </Modal>

      {/* Legal Modals */}
      <LegalModals
        aboutOpen={aboutOpen} setAboutOpen={setAboutOpen}
        privacyOpen={privacyOpen} setPrivacyOpen={setPrivacyOpen}
        termsOpen={termsOpen} setTermsOpen={setTermsOpen}
      />

      {/* Automated Backup Prompt */}
      <BackupPromptModal />
    </div>
  );
};


/**
 * A component that conditionally renders either the Welcome page or the main
 * application layout based on whether the user has completed the initial setup.
 * @returns {React.ReactElement} Either the Welcome page or the main AppLayout.
 */
