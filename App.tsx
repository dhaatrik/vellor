/**
 * @file App.tsx
 * This is the main application component file.
 * It sets up the global data provider, routing, and the main layout structure
 * including the sidebar and content area.
 */

import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store'; // Zustand hook
import { ToastContainer } from './components/ui';
import { MarketingPage } from './pages/MarketingPage';
import { PortalPage } from './pages/PortalPage';
import { Theme } from './types'; // Theme enum

// Extracted Components
import { AppContent } from './components/layout/AppContent';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { SetupEncryption } from './components/auth/SetupEncryption';

const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPortal, setIsPortal] = useState(window.location.hash.startsWith('#/portal'));
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Migrate vellor-salt
      const legacySalt = localStorage.getItem('vellor-salt');
      if (legacySalt) {
        await localforage.setItem('vellor-salt', legacySalt);
        localStorage.removeItem('vellor-salt');
      }

      // Migrate lastBackupDate
      const legacyBackupDate = localStorage.getItem('lastBackupDate');
      if (legacyBackupDate) {
        await localforage.setItem('lastBackupDate', legacyBackupDate);
        localStorage.removeItem('lastBackupDate');
      }

      const salt = await localforage.getItem('vellor-salt');
      setIsFirstTime(!salt);
    };
    init();
  }, []);

  useEffect(() => {
    const handleHashChange = () => setIsPortal(window.location.hash.startsWith('#/portal'));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const theme = useStore(s => s.settings.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === Theme.Dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  if (isPortal) {
    return (
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            <Route path="/portal" element={<PortalPage />} />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    );
  }

  if (isFirstTime === null) return null;

  return (
    <ErrorBoundary>
      <HashRouter>
        {!isUnlocked ? (
           (isFirstTime && !showSetup) ? (
               <MarketingPage onGetStarted={() => setShowSetup(true)} />
           ) : (
               <SetupEncryption onUnlocked={() => setIsUnlocked(true)} />
           )
        ) : (
          <>
            <AppContent />
            <ToastContainer />
          </>
        )}
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;