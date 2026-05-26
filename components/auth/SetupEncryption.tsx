import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { generateSalt, deriveKey, exportKeyToBase64, importKeyFromBase64 } from '../../src/crypto';
import { Icon, Button } from '../ui';

export const SetupEncryption: React.FC<{ onUnlocked: () => void }> = ({ onUnlocked }) => {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saltString = localStorage.getItem('vellor-salt');
    setIsFirstTime(!saltString);
  }, []);

  const handleUnlock = async () => {
    setIsLoading(true);
    try {
      if (isFirstTime) {
        if (password.length < 12) { setError("Password must be at least 12 characters."); return; }
        const salt = generateSalt();
        localStorage.setItem('vellor-salt', btoa(String.fromCharCode(...salt)));
        const key = await deriveKey(password, salt);
        const exported = await exportKeyToBase64(key);
        useStore.getState().setMasterKey(key);
        setRecoveryKey(exported);
      } else {
        if (useRecovery) {
           if (recoveryInput.length < 20) { setError("Invalid recovery key format."); return; }
           const key = await importKeyFromBase64(recoveryInput);
           useStore.getState().setMasterKey(key);
           await useStore.persist.rehydrate();
           onUnlocked();
        } else {
           const saltString = localStorage.getItem('vellor-salt')!;
           if (!/^[A-Za-z0-9+/]*={0,2}$/.test(saltString)) {
             throw new Error("Invalid salt format.");
           }
           const saltStrDecoded = atob(saltString);
           // ⚡ Bolt Performance: Replace .split('').map() with a pre-allocated Uint8Array and a for loop
           // to eliminate intermediate array allocations during string-to-byte-array conversion.
           const salt = new Uint8Array(saltStrDecoded.length);
           for (let i = 0, len = saltStrDecoded.length; i < len; i++) {
             salt[i] = saltStrDecoded.charCodeAt(i);
           }
           const key = await deriveKey(password, salt);
           useStore.getState().setMasterKey(key);
           await useStore.persist.rehydrate();
           onUnlocked();
        }
      }
    } catch (err) {
      setError("Incorrect password or decryption failed. If you reset your cache, you must wipe the site data.");
      useStore.getState().setMasterKey(null);
    } finally {
      setIsLoading(false);
    }
  };

  const completeFirstTimeSetup = async () => {
      await useStore.persist.rehydrate();
      onUnlocked();
  };

  if (isFirstTime === null) return null;

  if (recoveryKey) {
     return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-md z-50">
          <div className="bg-white dark:bg-primary p-8 rounded-3xl shadow-2xl max-w-md w-full ml-4 mr-4">
            <h2 className="text-2xl font-display font-bold mb-4 text-gray-900 dark:text-white">
              Recovery Key
            </h2>
            <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl mb-6">
                <p className="text-danger text-sm font-semibold mb-2 flex items-center gap-2">
                   <Icon iconName="warning" className="w-5 h-5 flex-shrink-0" />
                   CRITICAL WARNING
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                   Your data is encrypted entirely on your device. We cannot reset your master password. If you lose your password, THIS RECOVERY KEY is your ONLY way to access your data.
                </p>
            </div>
            <div className="bg-gray-100 dark:bg-primary-dark p-4 rounded-xl flex items-center gap-3 mb-6">
                <code className="text-xs break-all text-gray-900 dark:text-white font-mono flex-1 select-all">{recoveryKey}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryKey);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className={`flex-shrink-0 ${isCopied ? 'px-3 py-1.5' : '!p-2'}`}
                  aria-label="Copy recovery key"
                  title="Copy recovery key"
                >
                   {isCopied ? (
                     <span className="flex items-center gap-1.5 text-success text-xs font-semibold">
                       <Icon iconName="check-circle" className="w-4 h-4" />
                       Copied!
                     </span>
                   ) : (
                     <Icon iconName="document-text" className="w-5 h-5 text-accent" />
                   )}
                </Button>
            </div>
            <button
              className="w-full py-3 bg-accent text-primary-dark font-bold rounded-xl hover:opacity-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary"
              onClick={completeFirstTimeSetup}
            >
              I have safely stored my recovery key
            </button>
          </div>
        </div>
     );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-md z-50">
      <div className="bg-white dark:bg-primary p-8 rounded-3xl shadow-2xl max-w-md w-full ml-4 mr-4">
        <h2 className="text-2xl font-display font-bold mb-4 text-gray-900 dark:text-white">
          {isFirstTime ? 'Set Master Password' : (useRecovery ? 'Recover Data' : 'Unlock Vellor')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
          {isFirstTime
            ? 'Your data is encrypted locally. Create a strong master password to secure it. If you forget this password, your data cannot be recovered.'
            : (useRecovery ? 'Enter your Recovery Key to restore access to your data.' : 'Enter your master password to decrypt your data.')}
        </p>
        <div className="space-y-4">
           {!useRecovery ? (
             <div className="relative">
               <input
                 type={showPassword ? 'text' : 'password'}
                 value={password}
                 onChange={e => { setPassword(e.target.value); setError(''); }}
                 className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                 placeholder="Master Password"
                 aria-label="Master Password"
                 onKeyDown={e => e.key === 'Enter' && handleUnlock()}
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary-dark rounded-full"
                 aria-label={showPassword ? "Hide password" : "Show password"}
                 title={showPassword ? "Hide password" : "Show password"}
               >
                 <Icon iconName={showPassword ? "eye-slash" : "eye"} className="w-5 h-5" />
               </button>
             </div>
           ) : (
             <div>
                <input
                 type="text"
                 value={recoveryInput}
                 onChange={e => { setRecoveryInput(e.target.value); setError(''); }}
                 className="w-full px-4 py-3 rounded-xl font-mono text-sm border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-primary-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                 placeholder="Paste your Recovery Key here"
                 aria-label="Recovery Key"
                 onKeyDown={e => e.key === 'Enter' && handleUnlock()}
               />
             </div>
           )}
           {error && <p className="text-danger text-sm">{error}</p>}
           <Button
             variant="primary"
             className="w-full py-3 text-lg rounded-xl shadow-lg shadow-accent/20"
             onClick={handleUnlock}
             isLoading={isLoading}
           >
             {isFirstTime ? 'Set Password & Start' : 'Unlock'}
           </Button>

           {!isFirstTime && (
              <div className="text-center mt-4">
                 <button onClick={() => { setUseRecovery(!useRecovery); setError(''); setPassword(''); setRecoveryInput(''); }} className="text-sm text-gray-500 hover:text-accent transition-colors rounded px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 dark:focus-visible:ring-offset-primary-dark">
                    {useRecovery ? 'Use Master Password Instead' : 'Forgot Password? Use Recovery Key'}
                 </button>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
