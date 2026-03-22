import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import * as Accordion from '@radix-ui/react-accordion';
import { motion, useInView } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Github, Linkedin } from 'lucide-react';
import { Button, Icon } from '../components/ui';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary text-gray-900 dark:text-gray-100 overflow-x-hidden font-sans custom-scrollbar">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <Helmet>
        <title>Vellor - The Ultimate Tutoring OS</title>
        <meta name="description" content="Manage your tutoring business like a pro with Vellor. Zero subscriptions, offline-first, local storage." />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Vellor",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web, iOS, Android (PWA)",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              },
              "description": "The ultimate operating system for private educators. Zero subscriptions, zero tracking. 100% yours.",
              "creator": {
                "@type": "Person",
                "name": "Dhaatrik Chowdhury"
              }
            }
          `}
        </script>
      </Helmet>
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white/70 dark:bg-primary/70 backdrop-blur-lg z-50 flex items-center justify-between px-4 md:px-8 border-b border-gray-200/50 dark:border-white/5">
         <div className="flex items-center gap-2 font-display font-bold text-xl cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-primary-dark">
                <Icon iconName="academic-cap" className="w-5 h-5" />
            </div>
            Vellor
         </div>
         
         <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
             <button onClick={() => scrollTo('features')} className="hover:text-accent transition-colors">Features</button>
             <button onClick={() => scrollTo('gamification')} className="hover:text-accent transition-colors">Gamification</button>
             <button onClick={() => scrollTo('privacy')} className="hover:text-accent transition-colors">Privacy</button>
         </nav>

         <div className="flex items-center gap-4">
            <a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <Github className="w-5 h-5" />
            </a>
            <a href="https://x.com/dhaatrik" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <XIcon className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/dhaatrik-chowdhury" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0A66C2] dark:text-gray-400 dark:hover:text-[#0A66C2] transition-colors">
                <Linkedin className="w-5 h-5" />
            </a>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 ml-2 mr-1"></div>
            <Button
                onClick={toggleTheme}
                variant="ghost"
                className="!p-2 shadow-none border-none hover:bg-black/5 dark:hover:bg-white/5"
                aria-label={`Switch to ${settings.theme === Theme.Dark ? 'Light' : 'Dark'} Mode`}
            >
                <Icon iconName={settings.theme === Theme.Dark ? 'sun' : 'moon'} className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
         </div>
      </header>

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm mb-8 text-sm font-semibold text-accent animate-pulse">
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

          {/* Hero Device Mockups */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 mx-auto relative max-w-5xl h-[400px] hidden md:block"
          >
             {/* MacBook Frame */}
             <motion.div 
                animate={{ y: [-10, 10, -10] }} 
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute left-1/2 -translate-x-1/2 w-[800px] h-[480px] bg-white dark:bg-[#0f172a] rounded-t-2xl shadow-2xl border-[8px] border-gray-900 border-b-0 overflow-hidden z-10"
             >
                {/* Mockup Top Bar */}
                <div className="h-6 w-full bg-gray-900 flex items-center px-4 gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                {/* Dashboard Mock UI */}
                <div className="flex h-full bg-gray-50 dark:bg-primary-dark">
                   <div className="w-48 bg-white dark:bg-primary border-r border-gray-200 dark:border-white/5 p-4 flex flex-col gap-4">
                      {/* Sidebar */}
                      <div className="w-full flex items-center gap-2 mb-4"><div className="w-6 h-6 bg-accent rounded-md"></div><div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded"></div></div>
                      <div className="w-full h-8 bg-accent/10 rounded-lg"></div>
                      <div className="w-full h-8 bg-gray-100 dark:bg-white/5 rounded-lg"></div>
                      <div className="w-full h-8 bg-gray-100 dark:bg-white/5 rounded-lg"></div>
                   </div>
                   <div className="flex-1 p-6 flex flex-col gap-6">
                      <div className="h-20 w-full bg-white dark:bg-primary rounded-xl border border-gray-200 dark:border-white/5 p-4 flex justify-between items-center group">
                          <div className="h-8 w-32 bg-gray-200 dark:bg-white/10 rounded"></div>
                          <div className="h-8 w-24 bg-accent/20 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                          <div className="h-32 bg-white dark:bg-primary rounded-xl border border-gray-200 dark:border-white/5 p-4"><div className="h-4 w-16 bg-gray-200 dark:bg-white/10 rounded mb-2"></div><div className="h-8 w-24 bg-gray-300 dark:bg-white/20 rounded"></div></div>
                          <div className="col-span-2 h-32 bg-white dark:bg-primary rounded-xl border border-gray-200 dark:border-white/5 p-4"><div className="w-full h-full border-b border-gray-100 dark:border-white/5 relative"><div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-accent/20 to-transparent"></div></div></div>
                      </div>
                   </div>
                </div>
             </motion.div>

             {/* iPhone Frame */}
             <motion.div 
                animate={{ y: [10, -10, 10] }} 
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute right-0 top-32 w-[220px] h-[450px] bg-white dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden z-20"
             >
                {/* Dynamic Island Mock */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-full z-30"></div>
                <div className="h-full w-full bg-gray-50 dark:bg-primary-dark pt-12 p-4 flex flex-col gap-4 relative">
                    <div className="flex justify-between items-center bg-white dark:bg-primary p-3 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                       <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded"></div>
                       <div className="h-8 w-8 rounded-full bg-accent/20"></div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                        {[...Array(7)].map((_, i) => <div key={i} className={`h-8 rounded-lg ${i===3 ? 'bg-accent/80' : 'bg-gray-200 dark:bg-white/10'}`}></div>)}
                    </div>
                    <div className="flex-1 bg-white dark:bg-primary rounded-2xl border border-gray-200 dark:border-white/5 p-3 mt-2 flex flex-col gap-3">
                         <div className="h-12 bg-gray-50 dark:bg-white/5 rounded-xl"></div>
                         <div className="h-12 bg-gray-50 dark:bg-white/5 rounded-xl"></div>
                    </div>
                </div>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Vellor Section */}
      <section id="features" className="py-24 px-4 bg-white dark:bg-primary-dark/50 relative z-20">
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

      {/* Edu-preneur Stepper Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-primary relative z-20 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white">Your Business in 4 Steps</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">A simple, seamless workflow designed specifically for independent tutors.</p>
          </motion.div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent -translate-y-1/2 z-0"></div>

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: 1, title: "Onboard Students", desc: "Add student details and set custom goals instantly.", icon: "user-add" },
                { step: 2, title: "Log Lessons", desc: "Track hours, topics, and performance with a single click.", icon: "clock" },
                { step: 3, title: "Auto-Invoice", desc: "Generate PDFs and send WhatsApp reminders effortlessly.", icon: "document-text" },
                { step: 4, title: "Track Growth", desc: "Monitor revenue and earn gamified achievements.", icon: "trending-up" }
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
                  className="bg-white dark:bg-primary-light border border-gray-100 dark:border-white/10 rounded-3xl p-6 text-center shadow-lg shadow-gray-200/50 dark:shadow-none relative group hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-md ring-4 ring-white dark:ring-primary-dark z-10 relative">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center justify-center mx-auto mb-4 group-hover:text-accent transition-colors">
                    <Icon iconName={item.icon as any} className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
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
               className="lg:col-span-2 row-span-1 rounded-[2rem] p-8 relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 group hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] dark:hover:shadow-[0_0_40px_rgba(34,197,94,0.1)]"
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
               className="col-span-1 row-span-1 rounded-[2rem] p-8 bg-white dark:bg-primary-light border border-gray-100 dark:border-white/10 relative overflow-hidden group hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]"
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
               className="col-span-1 row-span-1 rounded-[2rem] p-8 bg-white dark:bg-primary-light border border-gray-100 dark:border-white/10 relative overflow-hidden group hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]"
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
               className="lg:col-span-2 row-span-1 border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 bg-white dark:bg-primary-light relative overflow-hidden group hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_0_40px_rgba(139,92,246,0.1)] flex flex-col justify-between"
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
      <section id="gamification" ref={gamificationRef} className="py-24 px-4 bg-accent text-primary-dark relative z-20 overflow-hidden">
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-50"></div>
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
            >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl relative">
                    <Icon iconName="trophy" className="w-10 h-10 text-white" />
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={isGamificationInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: 1, type: "spring", bounce: 0.6 }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-accent"
                    >
                        1
                    </motion.div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-white">Level Up Your Teaching</h2>
                <p className="text-xl text-primary-dark/80 mb-10 max-w-2xl mx-auto font-medium">
                    Unlock over 25+ achievements. Progress from Novice Tutor to Scholarly Sensei. Running your business shouldn't be boring.
                </p>

                {/* Simulated Progress Bar */}
                <div className="max-w-md mx-auto mb-10 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-left">
                    <div className="flex justify-between items-end mb-2 text-white">
                        <div>
                           <div className="text-sm opacity-80 font-medium">Current Level</div>
                           <div className="font-bold text-xl flex items-center gap-2">Novice Tutor <Icon iconName="arrow-right" className="w-4 h-4 opacity-50"/> <motion.span initial={{ opacity: 0 }} animate={isGamificationInView ? { opacity: 1 } : {opacity:0}} transition={{ delay: 2.5 }}>Scholarly Sensei</motion.span></div>
                        </div>
                        <div className="font-bold text-sm bg-white/20 px-2 py-1 rounded-lg">Level Up!</div>
                    </div>
                    <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden relative">
                        <motion.div 
                            className="h-full bg-white rounded-full relative"
                            initial={{ width: "70%" }}
                            animate={isGamificationInView ? { width: "100%" } : { width: "70%" }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                        >
                            <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/50 animate-pulse"></div>
                        </motion.div>
                    </div>
                    <div className="text-xs text-white/70 mt-2 text-right relative h-4">
                        <motion.span className="absolute right-0" initial={{ opacity: 1 }} animate={isGamificationInView ? { opacity: 0 } : {}} transition={{ delay: 1.8 }}>+50 XP needed</motion.span>
                        <motion.span className="absolute right-0 font-bold text-white shadow-sm" initial={{ opacity: 0 }} animate={isGamificationInView ? { opacity: 1 } : {}} transition={{ delay: 2 }}>Awesome!</motion.span>
                    </div>
                </div>

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

      {/* Command Palette Teaser */}
      <section className="py-24 px-4 bg-gray-900 text-white relative z-20 overflow-hidden border-t border-gray-800">
         <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-30"></div>
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
             <div className="flex-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6 text-sm font-semibold text-accent-light">
                    <Icon iconName="sparkles" className="w-4 h-4" /> Power User Tools
                 </div>
                 <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display">Move at the speed of thought.</h2>
                 <p className="text-gray-400 text-lg mb-8 max-w-lg">
                    Never leave the keyboard. The built-in global command palette lets you search students, log lessons, and configure settings instantly.
                 </p>
                 <div className="flex gap-4 items-center">
                     <span className="text-gray-500">Try it out:</span>
                     <div className="flex gap-2 font-mono">
                         <kbd className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-sm font-bold shadow-black">Ctrl</kbd>
                         <span className="text-gray-500 pt-2">+</span>
                         <kbd className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-sm font-bold shadow-black">K</kbd>
                     </div>
                 </div>
             </div>
             <div className="flex-1 w-full max-w-md relative pb-10">
                 {/* Visual Mockup of Command Palette */}
                 <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ margin: "-100px" }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                    className="w-full bg-gray-800 rounded-2xl shadow-2xl shadow-black/50 border border-gray-700 overflow-hidden flex flex-col"
                 >
                     <div className="flex items-center gap-3 p-4 border-b border-gray-700 bg-gray-800/80 backdrop-blur-md">
                         <Icon iconName="search" className="w-5 h-5 text-gray-400" />
                         <input type="text" placeholder="Search students, commands..." disabled className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 font-mono text-sm" value="Log lesson" />
                         <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400 font-mono shadow-sm">ESC</kbd>
                     </div>
                     <div className="p-2 space-y-1 bg-gray-900 border-t border-gray-800/50">
                         <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Suggested Actions</div>
                         <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20 cursor-pointer border border-accent/10">
                             <div className="flex items-center gap-3 text-white">
                                 <Icon iconName="clock" className="w-4 h-4 text-accent-light" />
                                 <span className="font-semibold text-sm">Log new lesson for...</span>
                             </div>
                             <kbd className="px-2 py-1 bg-gray-900/80 rounded text-xs text-gray-400 font-mono shadow-sm">↵</kbd>
                         </div>
                         <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                             <div className="flex items-center gap-3 text-gray-300">
                                 <Icon iconName="user-plus" className="w-4 h-4 text-gray-400" />
                                 <span className="font-medium text-sm">Add new student</span>
                             </div>
                         </div>
                     </div>
                 </motion.div>
             </div>
         </div>
      </section>

      {/* Social Proof Marquee */}
      <section className="py-24 bg-white dark:bg-primary-dark overflow-hidden border-t border-gray-100 dark:border-white/5 relative z-20">
         <div className="text-center mb-12 px-4">
             <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Loved by Tutors Worldwide</h2>
             <p className="text-gray-500 dark:text-gray-400">Join a community of independent educators taking back control.</p>
         </div>
         <div className="relative flex overflow-x-hidden w-full group py-4">
             <div className="flex animate-marquee w-max">
                 {/* Double the list to ensure seamless looping */}
                 {[
                     "Ditched my messy spreadsheets in 10 minutes. The automated PDFs are a lifesaver.",
                     "Finally, software that doesn't steal my data or charge $30/mo.",
                     "The WhatsApp integration saves me 2 hours every week asking for payments.",
                     "My students love the gamification. They actually want to book more lessons!",
                     "I feel like a professional business owner now. The client portal is a game changer.",
                     "Ditched my messy spreadsheets in 10 minutes. The automated PDFs are a lifesaver.",
                     "Finally, software that doesn't steal my data or charge $30/mo.",
                     "The WhatsApp integration saves me 2 hours every week asking for payments.",
                     "My students love the gamification. They actually want to book more lessons!",
                     "I feel like a professional business owner now. The client portal is a game changer."
                 ].map((quote, i) => (
                     <div key={i} className="mx-3 bg-gray-50 dark:bg-primary-light border border-gray-100 dark:border-white/5 p-6 rounded-2xl w-[350px] flex-shrink-0 flex flex-col gap-4 whitespace-normal transition hover:shadow-lg dark:hover:shadow-white/5">
                         <div className="flex text-yellow-500 gap-1">
                           <Icon iconName="star" className="w-4 h-4 fill-current"/><Icon iconName="star" className="w-4 h-4 fill-current"/><Icon iconName="star" className="w-4 h-4 fill-current"/><Icon iconName="star" className="w-4 h-4 fill-current"/><Icon iconName="star" className="w-4 h-4 fill-current"/>
                         </div>
                         <p className="text-gray-700 dark:text-gray-300 italic font-medium flex-1">"{quote}"</p>
                         <div className="mt-auto flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">{(i % 5 + 10).toString(36).toUpperCase()}{(i % 5 + 11).toString(36).toUpperCase()}</div>
                             <div>
                                 <div className="text-sm font-bold text-gray-900 dark:text-white">Verified Tutor</div>
                                 <div className="text-xs text-gray-500">Independent Educator</div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      </section>

      {/* White-Label Customization */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-primary relative z-20 border-t border-gray-100 dark:border-white/5 overflow-hidden">
         <div className="max-w-6xl mx-auto flex flex-col items-center">
             <div className="text-center mb-16">
                 <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-400">
                     <Icon iconName="brush" className="w-8 h-8" />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white">Your Brand, Your Rules</h2>
                 <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">Vellor gets out of your way. Customize the UI to match your business aesthetic instantly.</p>
             </div>
             
             {/* Demo UI with Custom Color Context */}
             <div className="w-full max-w-4xl bg-white dark:bg-primary-dark rounded-[2rem] shadow-xl border border-gray-200 dark:border-white/10 relative overflow-hidden flex flex-col md:flex-row group" style={{ '--color-accent': 'var(--custom-brand, #8b5cf6)' } as React.CSSProperties}>
                 {/* Sidebar Mock */}
                 <div className="w-full md:w-64 bg-gray-50 dark:bg-primary border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 p-6 flex flex-col gap-6 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none z-10 relative">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] transition-colors duration-500 text-white flex items-center justify-center shadow-md"><Icon iconName="academic-cap" className="w-5 h-5"/></div>
                        <span className="font-bold text-gray-900 dark:text-white text-lg">My Academy</span>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Themes</div>
                        <div className="flex gap-2">
                           {['#8b5cf6', '#10b981', '#f43f5e', '#3b82f6'].map(color => (
                               <button 
                                 key={color} 
                                 onClick={(e) => {
                                    const parent = (e.currentTarget as HTMLElement).closest('[style*="--color-accent"]');
                                    if(parent) (parent as HTMLElement).style.setProperty('--custom-brand', color);
                                 }}
                                 className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                                 style={{ backgroundColor: color }}
                                 aria-label={`Switch theme color to ${color}`}
                               />
                           ))}
                        </div>
                     </div>
                     <div className="mt-auto hidden md:block text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Click a color above to see the entire UI adapt seamlessly to your brand.</div>
                 </div>
                 {/* Main Content Mock */}
                 <div className="flex-1 p-6 md:p-8 bg-white dark:bg-primary-dark relative">
                     <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h3>
                         <div className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-1.5 rounded-lg text-sm font-bold transition-colors duration-500 border border-[var(--color-accent)]/20">Premium</div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-primary relative overflow-hidden group-hover:border-[var(--color-accent)]/30 transition-colors duration-500">
                             <div className="text-gray-500 text-sm">Monthly Revenue</div>
                             <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$4,250</div>
                             <Icon iconName="trending-up" className="absolute bottom-4 right-4 w-12 h-12 text-[var(--color-accent)] opacity-10 transition-colors duration-500" />
                         </div>
                         <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-primary relative overflow-hidden group-hover:border-[var(--color-accent)]/30 transition-colors duration-500">
                             <div className="text-gray-500 text-sm">Active Students</div>
                             <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">24</div>
                             <Icon iconName="users" className="absolute bottom-4 right-4 w-12 h-12 text-[var(--color-accent)] opacity-10 transition-colors duration-500" />
                         </div>
                     </div>
                     <button className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white font-bold shadow-lg shadow-[var(--color-accent)]/30 opacity-90 hover:opacity-100 transition-all duration-500">
                         Log New Lesson
                     </button>
                 </div>
             </div>
         </div>
      </section>

      {/* Uncompromising Privacy Section */}
      <section id="privacy" className="py-24 px-4 bg-white dark:bg-primary-dark/50 relative z-20">
         <div className="max-w-4xl mx-auto text-center">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner text-gray-700 dark:text-gray-400">
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

      {/* Knowledge Base FAQ Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-primary relative z-20 border-t border-gray-200/50 dark:border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Everything you need to know about Vellor.</p>
          </motion.div>

          <Accordion.Root type="single" collapsible className="space-y-4">
            {[
              {
                q: "How does 100% offline storage work?",
                a: "Vellor uses IndexedDB in your browser to store all data locally on your device. Nothing is sent to our servers. You can even install Vellor as a PWA and use it without the internet."
              },
              {
                q: "Can I use Vellor on my phone?",
                a: "Absolutely! Vellor is designed to be fully responsive. You can install it on your iOS or Android device by tapping 'Add to Home Screen' in your mobile browser."
              },
              {
                q: "Is it really free without hidden costs?",
                a: "Yes. Vellor is an open-source tool built to help solo educators. There are no subscriptions, paywalls, or premium tiers. The complete feature set is free."
              },
              {
                q: "How do the WhatsApp reminders work?",
                a: "Instead of a complex backend integration, Vellor generates pre-filled links. When you click 'Send Reminder', it instantly opens WhatsApp on your device with the message ready to go."
              }
            ].map((faq, i) => (
              <Accordion.Item key={i} value={`item-${i}`} className="bg-white dark:bg-primary-light border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <Accordion.Header className="flex">
                  <Accordion.Trigger className="group flex flex-1 items-center justify-between py-5 px-6 font-semibold transition-all hover:bg-gray-50 dark:hover:bg-white/5 text-left w-full outline-none">
                    <span className="text-gray-900 dark:text-white text-lg">{faq.q}</span>
                    <Icon iconName="chevron-down" className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden text-gray-600 dark:text-gray-400 text-base">
                  <div className="pb-5 px-6 leading-relaxed">
                    {faq.a}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-4 text-center relative z-20 border-t border-gray-100 dark:border-white/5">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Ready to take control?</h2>
          <Button onClick={onGetStarted} size="lg" className="rounded-full shadow-lg shadow-accent/20 py-4 px-10 text-lg mb-16">
             Manage Your Business Now
          </Button>

          {/* Actual Footer */}
          <footer className="mt-20 pt-16 pb-8 border-t border-gray-200/50 dark:border-white/5 max-w-6xl mx-auto text-left">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                  <div className="col-span-2 md:col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center">
                              <Icon iconName="academic-cap" className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white text-xl">Vellor</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs">
                          The powerful, offline-first operating system designed exclusively for independent tutors.
                      </p>
                      <div className="flex items-center gap-4">
                          <a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                          <a href="https://x.com/dhaatrik" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><XIcon className="w-5 h-5" /></a>
                          <a href="https://www.linkedin.com/in/dhaatrik-chowdhury" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors"><Linkedin className="w-5 h-5" /></a>
                      </div>
                  </div>
                  
                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4">Product</h4>
                      <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                          <li><button onClick={() => scrollTo('features')} className="hover:text-accent transition-colors">Features</button></li>
                          <li><button onClick={() => {}} className="hover:text-accent transition-colors">Download PWA</button></li>
                          <li><a href="https://github.com/DhaatuTheGamer/vellor/releases" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Changelog (v4.0)</a></li>
                      </ul>
                  </div>

                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4">Resources</h4>
                      <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                          <li><a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Developer API</a></li>
                          <li><button onClick={() => {}} className="hover:text-accent transition-colors">Tutor Advice Blog</button></li>
                          <li><a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Open Source</a></li>
                      </ul>
                  </div>

                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
                      <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                          <li><button onClick={() => scrollTo('privacy')} className="hover:text-accent transition-colors">Privacy Policy</button></li>
                          <li><button onClick={() => {}} className="hover:text-accent transition-colors">Terms of Service</button></li>
                      </ul>
                  </div>
              </div>
              
              <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 dark:text-gray-500">
                  <p>&copy; {new Date().getFullYear()} Vellor. All rights reserved.</p>
                  <p className="mt-2 md:mt-0 flex items-center gap-1">Built with <Icon iconName="heart" className="w-4 h-4 text-red-500" /> for educators.</p>
              </div>
          </footer>
      </section>

    </div>
  );
};
