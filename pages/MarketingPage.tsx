import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Button, Icon } from '../components/ui';
import { useStore } from '../store';
import { Theme } from '../types';

interface MarketingPageProps {
  onGetStarted: () => void;
}

const data = [
  { month: 'Jan', revenue: 400 },
  { month: 'Feb', revenue: 600 },
  { month: 'Mar', revenue: 1000 },
  { month: 'Apr', revenue: 1400 },
  { month: 'May', revenue: 2100 },
  { month: 'Jun', revenue: 2800 },
];

export const MarketingPage: React.FC<MarketingPageProps> = ({ onGetStarted }) => {
  const gamificationRef = useRef<HTMLElement>(null);
  const isGamificationInView = useInView(gamificationRef, { once: true, amount: 0.5 });
  const settings = useStore(s => s.settings);
  const toggleTheme = useStore(s => s.toggleTheme);

  useEffect(() => {
    if (isGamificationInView) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#8b5cf6', '#d8b4fe', '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8b5cf6', '#d8b4fe', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isGamificationInView]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary text-gray-900 dark:text-gray-100 overflow-x-hidden font-sans custom-scrollbar">
      
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <Button
            onClick={toggleTheme}
            variant="ghost"
            className="!p-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm border border-gray-200 dark:border-white/10 transition-colors"
            aria-label={`Switch to ${settings.theme === Theme.Dark ? 'Light' : 'Dark'} Mode`}
        >
            <Icon iconName={settings.theme === Theme.Dark ? 'sun' : 'moon'} className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] -z-10 animate-pulse delay-1000"></div>
        
        <div className="max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm mb-8 text-sm font-semibold text-accent">
              <Icon iconName="sparkles" className="w-4 h-4" />
              <span>Vellor 4.0 is now live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-design font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Manage Your Tutoring <br className="hidden md:block" />
              Business Like a <span className="text-accent">Pro.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
              The ultimate operating system for private educators. Zero subscriptions, zero tracking. 100% yours.
            </p>
            
            <Button 
                onClick={onGetStarted} 
                className="rounded-full shadow-lg shadow-accent/20 text-lg py-4 px-8 transform transition hover:scale-105"
                rightIcon="arrow-right"
            >
              Start for Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Vellor Section */}
      <section className="py-24 px-4 bg-white dark:bg-primary-dark/50 relative z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white">Built for Solo Educators</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">Leave behind the spreadsheets and expensive subscriptions. Vellor gives you everything you need, completely free.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "No Subscriptions", desc: "Most tutoring software costs $30+ a month. Vellor is 100% free forever.", icon: "currency-dollar" },
              { title: "Lightning Fast", desc: "Built on React 19 and Vite. Feel the 60fps animations and instant interactions.", icon: "rocket" },
              { title: "Offline First", desc: "No internet? No problem. Install as a native app and manage your business anywhere.", icon: "bolt" }
            ].map((item, i) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-gray-50 dark:bg-primary border border-gray-100 dark:border-white/5 hover:border-accent/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                  <Icon iconName={item.icon as any} className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Bento Box */}
      <section className="py-24 px-4 relative z-20">
        <div className="max-w-6xl mx-auto">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white">Enterprise-Grade Features</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">A powerful toolkit designed directly into one seamless interface.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
             {/* WhatsApp Integration (Wide) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="lg:col-span-2 row-span-1 rounded-[2rem] p-8 relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 group hover:border-green-500/40 transition-colors"
             >
                <div className="relative z-10 w-2/3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
                        <Icon iconName="share" className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">One-Click Reminders</h3>
                    <p className="text-gray-600 dark:text-gray-300">Generate pre-filled WhatsApp messages instantly to remind parents of overdue payments or upcoming classes.</p>
                </div>
                <div className="absolute right-[-40px] bottom-[-40px] w-64 h-48 bg-white dark:bg-primary-dark rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 p-4 transform rotate-[-5deg] group-hover:rotate-0 transition-transform">
                     {/* Mockup UI */}
                     <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/10 pb-3 mb-3">
                         <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"><Icon iconName="check-circle" className="w-4 h-4" /></div>
                         <div className="text-sm font-bold text-gray-900 dark:text-white">WhatsApp Preview</div>
                     </div>
                     <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                         <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg rounded-tr-none text-green-900 dark:text-green-100">Hi Parent, just a reminder for the $120 balance...</div>
                     </div>
                </div>
             </motion.div>

             {/* Invoicing (Square) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="col-span-1 row-span-1 rounded-[2rem] p-8 bg-white dark:bg-primary-light border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:border-accent/30 transition-colors"
             >
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <Icon iconName="document-text" className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Automated PDF Invoices</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Generate beautiful, branded multi-page PDFs instantly using robust client-side processing.</p>
             </motion.div>

             {/* Client Portals (Square) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="col-span-1 row-span-1 rounded-[2rem] p-8 bg-white dark:bg-primary-light border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:border-accent/30 transition-colors"
             >
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <Icon iconName="globe" className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Secure Portals</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Share live, read-only dashboard snapshots with parents via secure Base64 URLs.</p>
             </motion.div>

             {/* Financial Forecasting (Wide) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3 }}
               className="lg:col-span-2 row-span-1 border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 bg-white dark:bg-primary-light relative overflow-hidden group hover:border-accent/30 transition-colors flex flex-col justify-between"
             >
                <div className="flex justify-between items-start relative z-10 mb-4">
                   <div>
                       <div className="text-gray-500 mb-1 font-medium text-sm">Financial Forecasting</div>
                       <div className="text-2xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
                           $2,800 <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">+14% Growth</span>
                       </div>
                   </div>
                   <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                        <Icon iconName="trending-up" className="w-6 h-6" />
                   </div>
                </div>
                
                <div className="h-24 w-full translate-y-4">
                    <ResponsiveContainer width="100%" height={96} minWidth={0} minHeight={0}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" hide />
                            <YAxis hide />
                            <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section ref={gamificationRef} className="py-24 px-4 bg-accent text-primary-dark relative z-20 overflow-hidden">
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-50"></div>
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
            >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl">
                    <Icon iconName="trophy" className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-white">Level Up Your Teaching</h2>
                <p className="text-xl text-primary-dark/80 mb-10 max-w-2xl mx-auto font-medium">
                    Unlock over 25+ achievements. Progress from Novice Tutor to Scholarly Sensei. Running your business shouldn't be boring.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-left">
                    {['First $100 Earned', '30-Day Streak', 'Client Retained', '100 Lessons Logged'].map(achievement => (
                        <div key={achievement} className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex flex-col items-center text-center justify-center gap-2 text-white">
                             <Icon iconName="star" className="w-6 h-6" />
                             <span className="text-xs font-bold">{achievement}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
         </div>
      </section>

      {/* Uncompromising Privacy Section */}
      <section className="py-24 px-4 bg-white dark:bg-primary-dark/50 relative z-20">
         <div className="max-w-4xl mx-auto text-center">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner text-gray-500 dark:text-gray-400">
                    <Icon iconName="lock-closed" className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display text-gray-900 dark:text-white">Uncompromising Privacy</h2>
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">What happens on your device, stays on your device.</p>
                <div className="bg-gray-50 dark:bg-primary rounded-3xl p-8 border border-gray-100 dark:border-white/5 text-left flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Local Storage & Encryption</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vellor never sends your financial data to the cloud. Everything is encrypted using AES-GCM and stored locally on your device. Automated alerts remind you to backup your data every 14 days.</p>
                    </div>
                    <div className="flex-shrink-0">
                        <Button variant="outline" rightIcon="check-circle" className="opacity-100 pointer-events-none border-success text-success">100% Secure</Button>
                    </div>
                </div>
             </motion.div>
         </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 text-center relative z-20 border-t border-gray-100 dark:border-white/5">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Ready to take control?</h2>
          <Button onClick={onGetStarted} size="lg" className="rounded-full shadow-lg shadow-accent/20 py-4 px-10 text-lg">
             Manage Your Business Now
          </Button>
      </section>

    </div>
  );
};
