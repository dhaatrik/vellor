import React, { useEffect, useRef, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import * as Accordion from '@radix-ui/react-accordion';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';
import { Github, Linkedin, X, Menu } from 'lucide-react';
import { Button, Icon } from '../components/ui';

// Lazy-load heavy chart component for improved Time to Interactive
const LazyRevenueChart = lazy(() =>
  import('recharts').then((mod) => ({
    default: ({ data }: { data: { month: string; revenue: number }[] }) => {
      const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } = mod;
      return (
        <ResponsiveContainer width="100%" height={96} minWidth={0} minHeight={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" hide />
            <YAxis hide />
            <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    },
  }))
);

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

const BeforeAfterSlider = () => {
  const [sliderPos, setSliderPos] = React.useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.buttons !== 1) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2rem] overflow-hidden cursor-ew-resize select-none bg-white shadow-2xl border border-gray-200 dark:border-white/10 group"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Before Image (Messy Spreadsheet) */}
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4 md:p-8">
         <div className="w-full h-full bg-white dark:bg-gray-900 shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex items-center px-2 gap-1 overflow-hidden">
               {['File', 'Edit', 'View', 'Insert', 'Format', 'Data'].map(m => <div key={m} className="px-2 py-0.5 text-[10px] text-gray-600 dark:text-gray-400">{m}</div>)}
            </div>
            <div className="flex-1 grid grid-cols-6 grid-rows-8 gap-px bg-gray-300 dark:bg-gray-700 p-px">
               {Array.from({length: 48}).map((_, i) => (
                  <div key={i} className={`bg-white dark:bg-gray-900 p-1 md:p-2 text-[8px] md:text-[10px] text-gray-500 font-mono truncate ${i%6===0 ? 'font-bold bg-gray-50 dark:bg-gray-800' : ''}`}>
                     {i===0?'ID' : i===1?'Student' : i===2?'Date' : i===3?'Hours' : i===4?'Rate' : i===5?'Paid?' : (i%6===0 ? i/6 : i%6===5 ? (i%3===0 ? 'NO' : 'YES') : `Data ${i}`)}
                  </div>
               ))}
            </div>
         </div>
         <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm transform -rotate-3 transition-transform group-hover:scale-110">Chaotic Spreadsheet</div>
      </div>

      {/* After Image (Vellor Dashboard) */}
      <div 
         className="absolute inset-0 bg-white dark:bg-primary-dark overflow-hidden flex items-center justify-center p-4 md:p-8"
         style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
         <div className="w-full h-full bg-gray-50 dark:bg-primary border border-gray-200 dark:border-white/10 rounded-xl shadow-xl flex flex-col overflow-hidden">
             <img src="/dashboard.png" alt="Vellor OS Dashboard" className="w-full h-full object-cover object-left-top" loading="lazy" decoding="async" />
         </div>
         <div className="absolute top-6 right-6 bg-accent text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm transform rotate-3 transition-transform group-hover:scale-110">Vellor OS</div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-12 flex items-center justify-center -ml-6 z-10"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="w-1.5 h-full bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center">
           <div className="w-12 h-12 bg-white rounded-full shadow-2xl border-2 border-gray-200 flex items-center justify-center text-accent ring-4 ring-white/50 backdrop-blur-md transition-transform active:scale-95 group-hover:scale-110 focus-visible:ring-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 rotate-90 text-gray-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
           </div>
        </div>
      </div>
      {/* Accessible range input for crawlers and touch devices */}
      <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => setSliderPos(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-50 focus:outline-none" aria-label="Compare messy spreadsheet with Vellor dashboard" />
    </div>
  );
};

// Magnetic button wrapper - subtly pulls toward cursor on hover
const MagneticButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string; rightIcon?: string }> = ({ children, onClick, className, rightIcon }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <Button 
        onClick={onClick} 
        className={className}
        rightIcon={rightIcon as any}
      >
        {children}
      </Button>
    </motion.div>
  );
};

// Improvement #7: JSON-LD schema as a maintainable typed object
const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Vellor",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android (PWA)",
      offers: {
        "@type": "Offer",
        price: "0.00",
        priceCurrency: "USD",
      },
      description: "The ultimate operating system for private educators. Zero subscriptions, zero tracking. 100% yours.",
      creator: {
        "@type": "Person",
        name: "Dhaatrik Chowdhury",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "I'm currently using a massive, messy Excel spreadsheet. How hard is it to switch?", acceptedAnswer: { "@type": "Answer", text: "It takes less than two minutes. Vellor includes a built-in CSV import wizard, allowing you to seamlessly migrate your entire student roster and history without manually typing a thing." } },
        { "@type": "Question", name: "Do my students or their parents need to download an app or create accounts?", acceptedAnswer: { "@type": "Answer", text: "Nope! Vellor is your personal command center. To share updates or request payments, you simply generate a beautiful PDF invoice or a secure, read-only web portal link to send them directly." } },
        { "@type": "Question", name: "If everything is stored locally, what happens if I lose my laptop or phone?", acceptedAnswer: { "@type": "Answer", text: "Your peace of mind is built-in. Vellor features a one-click backup system that lets you download a highly secure, encrypted file of your entire database. Just upload that file to a new device, and you're instantly back in business." } },
        { "@type": "Question", name: "Why is this completely free? What's the catch?", acceptedAnswer: { "@type": "Answer", text: "There is no catch. Vellor is an open-source project built by an independent educator, for independent educators. The goal is to provide enterprise-grade tools to solo tutors without the predatory $30/month subscription fees." } },
        { "@type": "Question", name: "Do you take a percentage or transaction fee from my student payments?", acceptedAnswer: { "@type": "Answer", text: "Absolutely not. Vellor is a management and organizational operating system, not a payment processor. You keep 100% of the money you earn through your preferred payment methods (Cash, Zelle, Venmo, UPI, etc.)." } },
        { "@type": "Question", name: "I'm not very tech-savvy. Is there a steep learning curve?", acceptedAnswer: { "@type": "Answer", text: "Not at all. Vellor was designed to feel as intuitive as your favorite smartphone apps. There are no cluttered enterprise menus or complex database setups—just a clean, simple workflow that makes sense for tutoring." } },
        { "@type": "Question", name: "Can I use my own tutoring brand's logo and colors?", acceptedAnswer: { "@type": "Answer", text: "Yes! Vellor gets out of your way. Our white-label customization engine lets you change the application's entire color scheme and branding to match your unique academy aesthetic in seconds." } },
        { "@type": "Question", name: "Will you sell my data or my students' contact info to advertisers?", acceptedAnswer: { "@type": "Answer", text: "Never. Because Vellor is an offline-first application, your data literally never touches our servers. We couldn't look at your student data or financial records even if we wanted to." } },
        { "@type": "Question", name: "Can I manage multiple subjects and different hourly rates?", acceptedAnswer: { "@type": "Answer", text: "Yes. Every tutoring business is different. You can set custom hourly rates, specific learning goals, and distinct subjects for every individual student on your roster." } },
        { "@type": "Question", name: "Does this require a constant internet connection to work?", acceptedAnswer: { "@type": "Answer", text: "No. Whether you are tutoring in a cafe with spotty Wi-Fi or in a student's home with no service, Vellor's offline-first architecture means you can log lessons, generate invoices, and manage your business without skipping a beat." } },
      ],
    },
  ],
};

export const MarketingPage: React.FC<MarketingPageProps> = ({ onGetStarted }) => {
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
  const [isAdviceOpen, setIsAdviceOpen] = React.useState(false);
  const [monthlyCost, setMonthlyCost] = React.useState(35);
  const [isManifestoExpanded, setIsManifestoExpanded] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMac, setIsMac] = React.useState(false);
  const [showFab, setShowFab] = React.useState(false);
  const gamificationRef = useRef<HTMLElement>(null);
  const isGamificationInView = useInView(gamificationRef, { once: true, amount: 0.5 });
  const settings = useStore(s => s.settings);
  const toggleTheme = useStore(s => s.toggleTheme);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Improvement #2: Detect macOS for OS-aware keyboard shortcut
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const { scrollY } = useScroll();
  const yBg1 = useTransform(scrollY, [0, 1000], [0, 250]);
  const yBg2 = useTransform(scrollY, [0, 1000], [0, -250]);
  const yMacBook = useTransform(scrollY, [0, 1000], [0, 150]);
  const yIphone = useTransform(scrollY, [0, 1000], [0, -100]);

  // Improvement #3: Show floating CTA after scrolling past 800px
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setShowFab(latest > 800);
  });

  useEffect(() => {
    if (isGamificationInView) {
      import('canvas-confetti').then(({ default: confetti }) => {
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
      });
    }
  }, [isGamificationInView]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Improvement #1: Mobile menu nav handler
  const scrollToAndClose = (id: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-primary text-gray-900 dark:text-gray-100 overflow-x-hidden font-sans custom-scrollbar">
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
        <meta property="og:title" content="Vellor - Private Educator Dashboard" />
        <meta property="og:description" content="Manage your tutoring business like a pro with Vellor. Zero subscriptions, offline-first, local storage." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      </Helmet>
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white/70 dark:bg-primary/70 backdrop-blur-lg z-50 flex items-center justify-between px-4 md:px-8 border-b border-gray-200/50 dark:border-white/5">
         <div className="flex items-center gap-2 font-display font-bold text-xl cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <img src="/logo.png" alt="Vellor" className="w-10 h-10 object-contain dark:bg-white/90 dark:rounded-xl dark:p-1" />
            Vellor
         </div>
         
         <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
             <button onClick={() => scrollTo('features')} className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary rounded-md">Features</button>
             <button onClick={() => scrollTo('gamification')} className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary rounded-md">Gamification</button>
             <button onClick={() => scrollTo('privacy')} className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary rounded-md">Privacy</button>
             <button onClick={() => scrollTo('open-source')} className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary rounded-md">Open Source</button>
             <button onClick={() => scrollTo('faq')} className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary rounded-md">FAQ</button>
         </nav>

         <div className="flex items-center gap-4">
            <a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary rounded-md">
                <Github className="w-5 h-5" />
            </a>
            <a href="https://x.com/dhaatrik" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary rounded-md">
                <XIcon className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/dhaatrik-chowdhury" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#0A66C2] dark:text-gray-400 dark:hover:text-[#0A66C2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary rounded-md">
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
            <div className="hidden sm:block ml-2">
                <Button onClick={onGetStarted} className="rounded-full px-5 text-sm font-bold shadow-lg shadow-accent/20 tracking-wide">
                    Get Started
                </Button>
            </div>
            {/* Improvement #1: Mobile Hamburger Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Open navigation menu"
            >
                <Menu className="w-6 h-6" />
            </button>
         </div>
      </header>

      {/* Hero Section */}
      <section data-pomelli-section="hero" data-crawler-intent="awareness" className="relative min-h-screen flex items-center justify-center pt-32 pb-40 px-4 overflow-hidden">
        <motion.div style={{ y: yBg1 }} className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse transform-gpu will-change-transform"></motion.div>
        <motion.div style={{ y: yBg2 }} className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] -z-10 animate-pulse delay-1000 transform-gpu will-change-transform"></motion.div>
        
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
            
            <h1 className="text-5xl md:text-[4.5rem] lg:text-[6rem] leading-[1.05] font-display font-extrabold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-gray-500">
              Manage Your Tutoring <br className="hidden md:block" />
              Business Like a <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-light">Pro.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight text-pretty">
              The ultimate operating system for private educators. Zero subscriptions, zero tracking. 100% yours.
            </p>
            
            <MagneticButton 
                onClick={onGetStarted} 
                className="rounded-full shadow-lg shadow-accent/20 text-lg py-4 px-8 transform transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary"
                rightIcon="arrow-right"
            >
              Start for Free
            </MagneticButton>
          </motion.div>

          {/* Hero Device Mockups */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 mx-auto relative max-w-5xl h-[400px] hidden md:block"
          >
             {/* MacBook Frame Wrapper for Parallax */}
             <motion.div style={{ y: yMacBook }} className="absolute left-1/2 -translate-x-1/2 z-10 hidden lg:block">
                <motion.div 
                    animate={{ y: [-15, 15, -15] }} 
                    transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                    className="w-[850px] h-[510px] bg-white/40 dark:bg-[#0f172a]/40 backdrop-blur-3xl rounded-t-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-[8px] border-white/60 dark:border-white/10 border-b-0 overflow-hidden relative"
                >
                    {/* Pomelli Semantic Image Crawler Hook */}
                    <figure aria-label="Vellor Student Dashboard Interface">
                    <img src="/vellor-student-dashboard.png" alt="Vellor Student Dashboard - Premium Tutor Management Interface showing revenue and student metrics" className="sr-only" fetchPriority="high" loading="eager" />
                    <figcaption className="sr-only">A highly intuitive dashboard displaying active students, pending invoices, and weekly lesson logs.</figcaption>
                    </figure>
                    
                    {/* High-end Photorealistic Glare Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/5 to-transparent pointer-events-none z-50"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-white/20 blur-[80px] -rotate-45 transform pointer-events-none z-40 rounded-full"></div>
                    
                    {/* Mockup Top Bar */}
                    <div className="h-7 w-full bg-white/60 dark:bg-black/60 backdrop-blur-md flex items-center px-5 gap-2.5 border-b border-white/30 dark:border-white/10">
                       <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></div>
                       <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
                       <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                    </div>

                    {/* Dashboard Mock UI */}
                    <div className="flex h-full bg-gray-50/90 dark:bg-primary-dark/90 backdrop-blur-md">
                       <div className="w-52 bg-white/70 dark:bg-primary/70 border-r border-gray-200/50 dark:border-white/5 p-5 flex flex-col gap-4">
                          {/* Sidebar */}
                          <div className="w-full flex items-center gap-3 mb-6"><div className="w-7 h-7 bg-accent rounded-md shadow-[0_0_15px_var(--color-accent)]"></div><div className="h-4 w-24 bg-gray-200/80 dark:bg-white/10 rounded"></div></div>
                          <div className="w-full h-10 bg-accent/20 rounded-xl relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div></div>
                          <div className="w-full h-10 bg-gray-100/80 dark:bg-white/5 rounded-xl"></div>
                          <div className="w-full h-10 bg-gray-100/80 dark:bg-white/5 rounded-xl"></div>
                       </div>
                       <div className="flex-1 p-8 flex flex-col gap-8 relative z-10">
                          <div className="h-24 w-full bg-white/90 dark:bg-primary/90 rounded-2xl border border-gray-200/50 dark:border-white/5 p-5 flex justify-between items-center group shadow-sm backdrop-blur-md">
                              <div className="space-y-2"><div className="h-4 w-24 bg-gray-200/80 dark:bg-white/10 rounded"></div><div className="h-8 w-40 bg-gray-300/80 dark:bg-white/20 rounded"></div></div>
                              <div className="h-10 w-32 bg-accent/30 rounded-full shadow-inner"></div>
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                              <div className="h-40 bg-white/90 dark:bg-primary/90 rounded-2xl border border-gray-200/50 dark:border-white/5 p-5 shadow-sm"><div className="h-4 w-20 bg-gray-200/80 dark:bg-white/10 rounded mb-4"></div><div className="h-10 w-28 bg-gray-300/80 dark:bg-white/20 rounded"></div></div>
                              <div className="col-span-2 h-40 bg-white/90 dark:bg-primary/90 rounded-2xl border border-gray-200/50 dark:border-white/5 p-5 shadow-sm"><div className="w-full h-full border-b border-gray-100/80 dark:border-white/5 relative"><div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-accent/30 to-transparent"></div></div></div>
                          </div>
                       </div>
                    </div>
                </motion.div>
             </motion.div>

             {/* iPhone Frame Wrapper for Parallax */}
             <motion.div style={{ y: yIphone }} className="absolute right-0 lg:-right-10 xl:-right-20 top-40 z-20 hidden md:block">
                <motion.div 
                    animate={{ y: [12, -12, 12] }} 
                    transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1 }}
                    className="w-[240px] h-[500px] bg-white/40 dark:bg-[#0f172a]/40 backdrop-blur-3xl rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-[6px] border-white/60 dark:border-white/10 overflow-hidden relative ring-1 ring-gray-900/5"
                >
                    {/* Pomelli Semantic Image Crawler Hook */}
                    <figure aria-label="Vellor Mobile Dashboard">
                    <img src="/vellor-mobile-dashboard.png" alt="Vellor Mobile Application Client Portal - schedule and manage lessons on the go" className="sr-only" fetchPriority="high" loading="eager" />
                    <figcaption className="sr-only">A mobile-first dashboard for tutors to manage schedules, track payments, and communicate with parents on any device.</figcaption>
                    </figure>

                    {/* iPhone Dynamic Glare */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/50 via-white/10 to-transparent pointer-events-none z-50"></div>
                    <div className="absolute top-0 right-[-50px] w-[150px] h-[300px] bg-white/30 blur-[40px] rotate-45 transform pointer-events-none z-40"></div>
                    
                    {/* Dynamic Island Mock */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-50 shadow-inner flex items-center justify-between px-2.5 outline outline-1 outline-white/10">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                    </div>

                    <div className="h-full w-full bg-gray-50/90 dark:bg-primary-dark/90 pt-14 p-5 flex flex-col gap-4 relative z-10">
                        <div className="flex justify-between items-center bg-white/90 dark:bg-primary/90 p-4 rounded-2xl border border-gray-200/50 dark:border-white/5 shadow-sm backdrop-blur-md">
                           <div className="h-6 w-20 bg-gray-200/80 dark:bg-white/10 rounded"></div>
                           <div className="h-10 w-10 rounded-full bg-accent/30 shadow-[0_0_15px_var(--color-accent)] border border-accent/20"></div>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5 mt-2">
                            {[...Array(7)].map((_, i) => <div key={i} className={`h-10 rounded-lg shadow-sm ${i===3 ? 'bg-accent/90 shadow-[0_0_10px_var(--color-accent)]' : 'bg-white/70 dark:bg-white/10'}`}></div>)}
                        </div>
                        <div className="flex-1 bg-white/90 dark:bg-primary/90 rounded-2xl border border-gray-200/50 dark:border-white/5 p-4 mt-2 flex flex-col gap-4 backdrop-blur-md shadow-sm">
                             <div className="h-14 bg-gray-50/80 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-transparent"></div>
                             <div className="h-14 bg-gray-50/80 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-transparent"></div>
                        </div>
                    </div>
                </motion.div>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Before & After Showcase */}
      <section data-pomelli-section="before-after" data-crawler-intent="demonstration" className="py-16 md:py-24 px-4 bg-white dark:bg-primary-dark/50 relative z-20 overflow-hidden border-t border-gray-100 dark:border-white/5">
         <div className="max-w-6xl mx-auto">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-center mb-12"
            >
               <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display text-gray-900 dark:text-white tracking-tighter">Stop Wasting Time on Admin</h2>
               <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 text-pretty">Slide to instantly upgrade your workflow from a cluttered mess to a streamlined command center.</p>
            </motion.div>
            
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ type: 'spring', bounce: 0.2 }}
            >
               <BeforeAfterSlider />
            </motion.div>
         </div>
      </section>

      {/* Why Vellor Section */}
      <section id="features" data-pomelli-section="features" data-crawler-intent="education" className="py-24 px-4 bg-white dark:bg-primary-dark/50 relative z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white tracking-tighter">Built for Solo Educators</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg text-pretty">Leave behind the spreadsheets and expensive subscriptions. Vellor gives you everything you need, completely free.</p>
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
      <section data-pomelli-section="edu-preneur-workflow" className="py-24 px-4 bg-gray-50 dark:bg-primary relative z-20 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white tracking-tighter">Your Business in 4 Steps</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg text-pretty">A simple, seamless workflow designed specifically for independent tutors.</p>
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
      <section data-pomelli-section="premium-features" data-crawler-intent="education" className="py-24 px-4 relative z-20">
        <div className="max-w-6xl mx-auto">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white tracking-tighter">Enterprise-Grade Features</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg text-pretty">A powerful toolkit designed directly into one seamless interface.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
             {/* WhatsApp Integration (Wide) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="lg:col-span-2 row-span-1 rounded-[2rem] p-8 relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 ring-1 ring-inset ring-white/10 group hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] dark:hover:shadow-[0_0_40px_rgba(34,197,94,0.1)]"
               data-pomelli-feature-name="whatsapp-reminders"
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
               className="col-span-1 row-span-1 rounded-[2rem] p-8 bg-white dark:bg-primary-light border border-gray-100 dark:border-white/10 ring-1 ring-inset ring-white/10 relative overflow-hidden group hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]"
               data-pomelli-feature-name="auto-invoice"
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
               className="col-span-1 row-span-1 rounded-[2rem] p-8 bg-white dark:bg-primary-light border border-gray-100 dark:border-white/10 ring-1 ring-inset ring-white/10 relative overflow-hidden group hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]"
               data-pomelli-feature-name="secure-portals"
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
               className="lg:col-span-2 row-span-1 border border-gray-100 dark:border-white/10 ring-1 ring-inset ring-white/10 rounded-[2rem] p-8 bg-white dark:bg-primary-light relative overflow-hidden group hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_0_40px_rgba(139,92,246,0.1)] flex flex-col justify-between"
               data-pomelli-feature-name="financial-forecasting"
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
                    <Suspense fallback={<div className="w-full h-full bg-accent/5 rounded-xl animate-pulse" />}>
                      <LazyRevenueChart data={data} />
                    </Suspense>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section id="gamification" ref={gamificationRef} data-pomelli-section="gamification" className="py-24 px-4 bg-accent text-primary-dark relative z-20 overflow-hidden">
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
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-white tracking-tighter">Level Up Your Teaching</h2>
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
      <section data-pomelli-section="command-palette" className="py-24 px-4 bg-gray-900 text-white relative z-20 overflow-hidden border-t border-gray-800">
         <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-30"></div>
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
             <div className="flex-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6 text-sm font-semibold text-accent-light">
                    <Icon iconName="sparkles" className="w-4 h-4" /> Power User Tools
                 </div>
                 <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display tracking-tighter">Move at the speed of thought.</h2>
                 <p className="text-gray-400 text-lg mb-8 max-w-lg">
                    Never leave the keyboard. The built-in global command palette lets you search students, log lessons, and configure settings instantly.
                 </p>
                 <div className="flex gap-4 items-center">
                     <span className="text-gray-500">Try it out:</span>
                     <div className="flex gap-2 font-mono">
                         <kbd className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-sm font-bold shadow-black">{isMac ? '⌘' : 'Ctrl'}</kbd>
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



      {/* White-Label Customization */}
      <section data-pomelli-section="white-label" className="py-24 px-4 bg-gray-50 dark:bg-primary relative z-20 border-t border-gray-100 dark:border-white/5 overflow-hidden">
         <div className="max-w-6xl mx-auto flex flex-col items-center">
             <div className="text-center mb-16">
                 <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-400">
                     <Icon iconName="brush" className="w-8 h-8" />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white tracking-tighter">Your Brand, Your Rules</h2>
                 <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto text-pretty">Vellor gets out of your way. Customize the UI to match your business aesthetic instantly.</p>
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

      {/* Interactive Savings Calculator */}
      <section data-pomelli-section="savings-calculator" data-pomelli-value-prop="lifetime-free-savings" data-crawler-intent="conversion" className="py-24 px-4 bg-white dark:bg-primary-dark/50 relative z-20 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white tracking-tighter">The Cost of the Status Quo</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-12 text-pretty">See how much you'd save by switching to Vellor from any paid tutoring software.</p>
          </motion.div>

          <div className="bg-gray-50 dark:bg-primary rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-inset ring-white/10">
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 block">What you currently pay per month</label>
              <motion.div key={monthlyCost} initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-bold font-display text-accent mb-6">${monthlyCost}</motion.div>
              <input
                type="range"
                min="0"
                max="100"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-primary"
                aria-label="Current monthly software cost"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>$0</span>
                <span>$100/mo</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[
                { label: "1-Year Savings", value: monthlyCost * 12 },
                { label: "3-Year Savings", value: monthlyCost * 36 },
                { label: "5-Year Savings", value: monthlyCost * 60 },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  className="bg-white dark:bg-primary-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm"
                  initial={{ scale: 0.95, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</div>
                  <motion.div
                    key={item.value}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl md:text-4xl font-bold font-display text-accent"
                  >
                    ${item.value.toLocaleString()}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <p className="mt-8 text-gray-500 dark:text-gray-400 text-sm">That's money back in your pocket. Vellor is <strong className="text-accent">free forever</strong>.</p>
          </div>
        </div>
      </section>

      {/* Educator's Manifesto */}
      <section data-pomelli-section="founder-story" data-crawler-intent="trust" className="py-24 px-4 bg-gray-50 dark:bg-primary relative z-20 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-accent/10 rounded-full mx-auto flex items-center justify-center mb-6">
                <Icon iconName="heart" className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 font-display text-gray-900 dark:text-white tracking-tighter">A Letter from the Creator</h2>
              <div className="w-16 h-0.5 bg-accent/30 mx-auto mt-4"></div>
            </div>

            <div className="space-y-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                Let's be honest about something that people rarely admit: nobody really starts private tutoring because they have a burning, poetic desire to teach. We start because we need the money.
              </p>
              <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                I started teaching right after my Class 10 final exams. Like most young tutors, I didn't have a grand vision; I just needed pocket money to cover transport, basic needs, and the little necessities you just can't ignore. The genuine love for teaching? That is something that comes later.
              </p>

              {/* Collapsible section */}
              <div className="relative">
                <AnimatePresence initial={false}>
                  {isManifestoExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="overflow-hidden space-y-6"
                    >
                      <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                        For years, my entire "business" ran on flimsy notepads. I would write down class plans, contact numbers, and track who had paid what. But one sudden downpour during a commute, and those pages would be soaked, the ink bleeding into an unreadable mess, taking all my notes and contacts with it. Other days, I'd simply forget the notepad at home.
                      </p>
                      <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                        When I finally upgraded to spreadsheets, the workload somehow got worse. I would still take notes on paper during the day, then come home exhausted, open my laptop, and manually type everything out. It was a massive, soul-sucking drain of hours. It was time I could have spent crafting better study lessons, making custom notes, or just working on my own passion projects.
                      </p>
                      <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                        I built Vellor because I was tired of this irony. I would spend an hour teaching a student the elegance of physics or the beauty of mathematics, only to spend another hour wrestling with administrative overhead that was quietly stealing my joy. And when I looked for software to help? Every "solution" wanted $30 to $50 a month. They wanted my students' data. They wanted a cut of my earnings.
                      </p>
                      <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                        When I finally stopped teaching in the 2024-2025 academic year, after ten long years, I looked back and realized something profound. This deeply underappreciated profession had given me far more than just remuneration. It taught me how to communicate, how to plan, and how to take absolute responsibility. I learned human psychology. I learned how to negotiate, how to talk about money, and how to build reward systems. I made a lot of mistakes, and I learned how to survive and grow from them.
                      </p>
                      <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                        Ten years gave me countless interactions, countless memories, countless treats, countless gifts... and countless punishments (okay, I could actually count those, but it ruins the rhyme!). I started out of financial need, but words aren't enough to express the gratitude I feel today. I tell everyone now: <em className="text-accent font-semibold not-italic">teach at least once in your life</em>. The compounding effect it has on your personal and professional growth is exponential.
                      </p>
                      <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                        Today, equipped with the knowledge of modern tech-stacks and AI, I felt a moral obligation to solve the exact problems I used to face. I wanted to make a contribution to this community with absolutely zero hidden motives. If I am building tools for educators, the tool itself must embody the ethics of education. Knowledge should be free, and the tools to share it should be too.
                      </p>
                      <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                        Vellor is for the independent tutors who are tight on finances but possess massive ambitions. It's for the people who refuse to just be another carbon footprint, who want to do something great, and who are actively shaping a better future. No cloud servers harvesting your data. No subscription traps. Just a tool, built by a tutor, for tutors. Open-source, offline-first, and yours forever.
                      </p>
                      <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-pretty">
                        I may have stepped away from the daily grind, but once a teacher, always a teacher. I still love it. This is just the start, and the story continues...
                      </p>
                      <p className="text-lg leading-relaxed text-gray-500 dark:text-gray-400 italic mt-4">
                        Take care, take love. And all the best to all of you who are out there actually shaping the world.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Gradient fade + toggle */}
                {!isManifestoExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-primary to-transparent pointer-events-none" />
                )}
              </div>

              <button
                onClick={() => setIsManifestoExpanded(!isManifestoExpanded)}
                className="inline-flex items-center gap-2 text-accent font-semibold text-base hover:underline underline-offset-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-primary rounded-md mt-2"
              >
                {isManifestoExpanded ? 'Show less' : 'Read the full story'}
                <Icon iconName={isManifestoExpanded ? 'chevron-up' as any : 'chevron-down' as any} className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-4 pt-8 border-t border-gray-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">D</div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">Dhaatrik Chowdhury</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Creator of Vellor &bull; Independent Educator</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Uncompromising Privacy Section */}
      <section id="privacy" data-pomelli-section="privacy" className="py-24 px-4 bg-white dark:bg-primary-dark/50 relative z-20">
         <div className="max-w-4xl mx-auto text-center">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner text-gray-700 dark:text-gray-400">
                    <Icon iconName="lock-closed" className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display text-gray-900 dark:text-white tracking-tighter">Uncompromising Privacy</h2>
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 text-pretty">What happens on your device, stays on your device.</p>
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

      {/* Open Source / Community Section */}
      <section id="open-source" data-pomelli-section="open-source" className="py-24 px-4 bg-gray-900 border-t border-gray-800 relative z-20 overflow-hidden text-center text-white">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         <div className="max-w-4xl mx-auto relative z-10">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8 text-sm font-semibold text-accent-light shadow-lg">
                <Github className="w-4 h-4" /> Proudly Open-Source
             </div>
             <h2 className="text-4xl md:text-6xl font-bold mb-8 font-display tracking-tighter text-white">Built by Educators, <br className="hidden md:block"/> for Educators</h2>
             <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                 Vellor is open-core and community-driven. Inspect our code, contribute features, and trust that your tool won't unexpectedly disappear or get fully paywalled.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-800 border border-gray-700 px-8 py-5 rounded-2xl hover:bg-gray-700 transition group w-full sm:w-auto shadow-2xl hover:-translate-y-1 duration-300">
                     <div className="text-left">
                         <div className="text-sm text-gray-400 font-medium mb-1">Join the Movement</div>
                         <div className="flex items-center gap-3 text-2xl font-bold text-white group-hover:text-accent-light transition"><Github className="w-7 h-7"/> Star on Github</div>
                     </div>
                 </a>

             </div>
         </div>
      </section>

      {/* Knowledge Base FAQ Section */}
      <section id="faq" data-pomelli-section="faq" data-crawler-intent="support" className="py-24 px-4 bg-gray-50 dark:bg-primary relative z-20 border-t border-gray-200/50 dark:border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-white tracking-tighter">Frequently Asked Questions</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg text-pretty">Everything you need to know about Vellor.</p>
          </motion.div>

          <Accordion.Root type="single" collapsible className="space-y-4">
            {[
              {
                q: "I’m currently using a massive, messy Excel spreadsheet. How hard is it to switch?",
                a: "It takes less than two minutes. Vellor includes a built-in CSV import wizard, allowing you to seamlessly migrate your entire student roster and history without manually typing a thing."
              },
              {
                q: "Do my students or their parents need to download an app or create accounts?",
                a: "Nope! Vellor is your personal command center. To share updates or request payments, you simply generate a beautiful PDF invoice or a secure, read-only web portal link to send them directly."
              },
              {
                q: "If everything is stored locally, what happens if I lose my laptop or phone?",
                a: "Your peace of mind is built-in. Vellor features a one-click backup system that lets you download a highly secure, encrypted file of your entire database. Just upload that file to a new device, and you're instantly back in business."
              },
              {
                q: "Why is this completely free? What’s the catch?",
                a: "There is no catch. Vellor is an open-source project built by an independent educator, for independent educators. The goal is to provide enterprise-grade tools to solo tutors without the predatory $30/month subscription fees."
              },
              {
                q: "Do you take a percentage or transaction fee from my student payments?",
                a: "Absolutely not. Vellor is a management and organizational operating system, not a payment processor. You keep 100% of the money you earn through your preferred payment methods (Cash, Zelle, Venmo, UPI, etc.)."
              },
              {
                q: "I’m not very tech-savvy. Is there a steep learning curve?",
                a: "Not at all. Vellor was designed to feel as intuitive as your favorite smartphone apps. There are no cluttered enterprise menus or complex database setups—just a clean, simple workflow that makes sense for tutoring."
              },
              {
                q: "Can I use my own tutoring brand’s logo and colors?",
                a: "Yes! Vellor gets out of your way. Our white-label customization engine lets you change the application's entire color scheme and branding to match your unique academy aesthetic in seconds."
              },
              {
                q: "Will you sell my data or my students' contact info to advertisers?",
                a: "Never. Because Vellor is an offline-first application, your data literally never touches our servers. We couldn't look at your student data or financial records even if we wanted to."
              },
              {
                q: "Can I manage multiple subjects and different hourly rates?",
                a: "Yes. Every tutoring business is different. You can set custom hourly rates, specific learning goals, and distinct subjects for every individual student on your roster."
              },
              {
                q: "Does this require a constant internet connection to work?",
                a: "No. Whether you are tutoring in a cafe with spotty Wi-Fi or in a student's home with no service, Vellor's offline-first architecture means you can log lessons, generate invoices, and manage your business without skipping a beat."
              }
            ].map((faq, i) => (
              <Accordion.Item key={i} value={`item-${i}`} className="bg-white dark:bg-primary-light border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <Accordion.Header className="flex">
                  <Accordion.Trigger className="group flex flex-1 items-center justify-between py-5 px-6 font-semibold transition-all hover:bg-gray-50 dark:hover:bg-white/5 text-left w-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset rounded-2xl">
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
      <section data-pomelli-section="footer-cta" data-crawler-intent="conversion" className="py-24 px-4 text-center relative z-20 border-t border-gray-100 dark:border-white/5">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white tracking-tighter">Ready to take control?</h2>
          <Button onClick={onGetStarted} size="lg" className="rounded-full shadow-lg shadow-accent/20 py-4 px-10 text-lg mb-16">
             Manage Your Business Now
          </Button>

          {/* Actual Footer */}
          <footer className="mt-20 pt-16 pb-8 border-t border-gray-200/50 dark:border-white/5 max-w-6xl mx-auto text-left">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                  <div className="col-span-2 md:col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                          <img src="/logo.png" alt="Vellor" className="w-10 h-10 object-contain dark:bg-white/90 dark:rounded-xl dark:p-1" />
                          <span className="font-bold text-gray-900 dark:text-white text-xl">Vellor</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs">
                          The powerful, offline-first operating system designed exclusively for independent tutors.
                      </p>
                      <div className="flex items-center gap-4">
                          <a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                          <a href="https://x.com/dhaatrik" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><XIcon className="w-5 h-5" /></a>
                          <a href="https://www.linkedin.com/in/dhaatrik-chowdhury" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors"><Linkedin className="w-5 h-5" /></a>
                      </div>
                  </div>
                  
                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4">Product</h4>
                      <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                          <li><button onClick={() => scrollTo('features')} className="hover:text-accent transition-colors">Features</button></li>
                          <li><button onClick={() => {}} className="hover:text-accent transition-colors">Download PWA</button></li>
                          <li><a href="https://github.com/DhaatuTheGamer/vellor/releases" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Changelog (v4.0)</a></li>
                      </ul>
                  </div>

                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4">Resources</h4>
                      <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                          <li><a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Developer API</a></li>
                          <li><button onClick={() => setIsAdviceOpen(true)} className="hover:text-accent transition-colors">Friendly Tutor Advice</button></li>
                          <li><a href="https://github.com/DhaatuTheGamer/vellor" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Open Source</a></li>
                      </ul>
                  </div>

                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
                      <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                          <li><button onClick={() => setIsPrivacyOpen(true)} className="hover:text-accent transition-colors">Privacy Policy</button></li>
                          <li><button onClick={() => setIsTermsOpen(true)} className="hover:text-accent transition-colors">Terms of Service</button></li>
                      </ul>
                  </div>
              </div>
              
              <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 dark:text-gray-500">
                  <p className="flex items-center gap-2"><img src="/logo.png" alt="Vellor" className="w-6 h-6 object-contain rounded dark:bg-white/90 dark:p-0.5" style={{ filter: 'grayscale(1) opacity(0.5)' }} />&copy; {new Date().getFullYear()} Vellor. All rights reserved.</p>
                  <p className="mt-2 md:mt-0 flex items-center gap-1">Built with <Icon iconName="heart" className="w-4 h-4 text-red-500" /> for educators.</p>
              </div>
          </footer>
      </section>

      <AnimatePresence>
        {isPrivacyOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-primary rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col"
            >
              <div className="bg-gray-50 dark:bg-primary-light p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
                <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">The "Anti-Spying" Privacy Policy</h2>
                <button onClick={() => setIsPrivacyOpen(false)} className="p-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-full transition-colors self-start">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6 text-gray-600 dark:text-gray-300 text-base md:text-lg overflow-y-auto custom-scrollbar">
                <p>Most privacy policies are written by corporate lawyers to explain exactly how a company plans to legally harvest and sell your data.</p>
                <p>Ours is simple: <strong className="text-accent">We don't want your data, and we literally can't see it.</strong></p>
                
                <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">1. We Have No Servers</h3>
                  <p>Vellor is an "offline-first" application. When you add a student, log a lesson, or track a payment, that information is saved locally inside your device's browser using industry-standard encryption. It is never transmitted to our servers, because we don't have any.</p>
                </div>

                <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">2. Zero Third-Party Tracking</h3>
                  <p>We do not use tracking pixels, behavioral analytics, or ad-targeting scripts. We have no idea how many students you have, how much money you make, or how often you use the app. Your business metrics are none of our business.</p>
                </div>

                <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">3. Total Financial Privacy</h3>
                  <p>Vellor helps you generate invoices and track your income, but it does not connect to your bank or process payments. Your financial records exist only on your screen.</p>
                </div>

                <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">4. Verifiably Transparent</h3>
                  <p>Because Vellor is 100% open-source, our entire codebase is public. You (or any software engineer) can inspect the code at any time to verify that your data never leaves your device.</p>
                </div>

                <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
                  <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-4">The Bottom Line:</h3>
                  <p className="max-w-md mx-auto italic text-gray-600 dark:text-gray-400">What happens on your device, stays on your device. Run your tutoring business with total peace of mind.</p>
                  <Button onClick={() => setIsPrivacyOpen(false)} className="mt-8 w-full md:w-auto px-10 py-4 text-lg rounded-full font-bold shadow-lg shadow-accent/20">Understood</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isAdviceOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-primary rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col"
            >
              <div className="bg-gray-50 dark:bg-primary-light p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">The Modern Educator's Playbook</h2>
                  <p className="text-accent font-semibold mt-1">15 Golden Rules from Your Friendly Neighborhood Tutor</p>
                </div>
                <button onClick={() => setIsAdviceOpen(false)} className="p-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-full transition-colors self-start">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6 text-gray-600 dark:text-gray-300 text-base md:text-lg overflow-y-auto custom-scrollbar">
                <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-8">
                  Teaching isn't just about transferring information from a textbook to a brain; it's about debugging how a student thinks and helping them upgrade their own mental software. Whether you're teaching advanced calculus, Python, or middle school history, here are 15 rules to elevate your sessions from "just another class" to a transformative experience.
                </p>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Don't Be a "Teacher." Be a Friend (and a Mentor).</h3>
                    <p>The traditional power dynamic of "I speak, you listen" is outdated. Sit beside them, not across from them. When a student views you as an older sibling or a trusted friend rather than a strict authority figure, their defensive walls drop. They become open to making mistakes, which is the exact moment real learning begins.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Make AI Your Ultimate Teaching Co-Pilot.</h3>
                    <p>You don't have to build every lesson plan from scratch. Lean into AI tools like Gemini, NotebookLM, Grok, or ChatGPT to act as your brainstorming partners. Use them to generate highly personalized study plans, create interactive quizzes, or find fresh, weird analogies to explain dry topics.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Optimize for "Why," Not Just "What."</h3>
                    <p>Memorizing a formula is useless if the student doesn't know <em>why</em> the formula exists. Always push past rote memorization. If they can solve a math problem but can't explain the logic behind the steps, they haven't learned it yet. Make them understand the core mechanics of the concept.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Read the Room (Understand Their Psychology).</h3>
                    <p>Every student has a unique psychological baseline. Notice how they handle frustration—do they shut down, get angry, or guess wildly? Pay attention to their body language. Understanding <em>how</em> they deal with difficult situations allows you to tailor your tone and approach to keep them in a productive headspace.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Enforce Relentless Critical Thinking.</h3>
                    <p>Stop giving them the answers immediately. When they get stuck, reply with a question: <em>"What do you think our next logical step should be?"</em> Train them to break down massive, intimidating problems into smaller, solvable components.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Gamify the Wins (Big and Small).</h3>
                    <p>Human brains are wired for rewards. You don't need to hand out physical prizes, but you should absolutely celebrate their milestones. Call out a brilliant question, acknowledge when they finally grasp a tough concept, and create a system of micro-rewards to keep their dopamine tied to their effort.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Flip the Script (The Feynman Technique).</h3>
                    <p>The ultimate test of understanding is the ability to teach it. Once you finish a complex topic, hand them the metaphorical chalk. Ask them to explain the concept back to you as if you were a complete beginner. If they stumble, you instantly know where the gaps are.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Connect the Abstract to the Real World.</h3>
                    <p>Nobody wants to learn something that feels useless. If you are teaching physics, talk about how it applies to rocket launches. If you are teaching math, show how it applies to building video games or running a startup. Anchor abstract theories to real, tangible reality.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Create a Zero-Judgment Zone for "Dumb" Questions.</h3>
                    <p>A student will only ask the question that unlocks their understanding if they feel 100% safe doing so. Explicitly tell them, <em>"There are zero stupid questions here."</em> Praise them for asking fundamental questions, because those are usually the most important ones.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Adapt to Their Bandwidth.</h3>
                    <p>Some days, a student will show up exhausted, distracted, or overwhelmed. Recognize when their cognitive bandwidth is low. On those days, ditch the heavy new material and pivot to reviewing older concepts or doing a fun, interactive exercise. Meet them where their energy is.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">11. Praise the Process, Not the Intellect.</h3>
                    <p>Never say, <em>"You're so smart."</em> Say, <em>"I love how hard you worked to figure that out."</em> Praising intellect creates a fear of looking stupid. Praising effort builds a growth mindset, teaching them that resilience is their most valuable asset.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">12. Treat Failures as Pure Data.</h3>
                    <p>When a student bombs a mock test or fails an assignment, don't let them spiral. Reframe the failure. A wrong answer isn't a character flaw; it's just raw data pointing exactly to what needs to be optimized next.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">13. Keep the Feedback Loop Tight and Gentle.</h3>
                    <p>Don't wait until the end of a month to tell a student they are doing something wrong. Offer micro-corrections constantly, but keep them gentle. <em>"You're on the right track, but let's tweak this one variable..."</em> is much better than <em>"No, that's incorrect."</em></p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">14. Innovate the Delivery.</h3>
                    <p>Textbooks are boring. Innovate how you deliver the knowledge. Build a quick Python script to visualize a math problem, use digital whiteboards, or find an interactive simulation online. Keep the delivery method dynamic so their brain stays engaged.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">15. Stay Insanely Curious Yourself.</h3>
                    <p>The best tutors are the ones who are still obsessed with learning. Share your own current learning struggles with them. When they see that you are also a student of the world—figuring things out, making mistakes, and growing—it gives them the permission to do the exact same thing.</p>
                  </div>
                </div>

                <div className="pt-8 text-center pb-4">
                  <Button onClick={() => setIsAdviceOpen(false)} className="px-10 py-4 text-lg rounded-full font-bold shadow-lg shadow-accent/20">Let's Get Back to Teaching</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isTermsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-primary rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col"
            >
              <div className="bg-gray-50 dark:bg-primary-light p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
                <h2 className="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white">The "No-Nonsense" Terms of Service</h2>
                <button onClick={() => setIsTermsOpen(false)} className="p-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-full transition-colors self-start">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6 text-gray-600 dark:text-gray-300 text-base md:text-lg overflow-y-auto custom-scrollbar">
                <p>Most software companies use this page to bury you in legal jargon, claim ownership of your data, or hide sneaky subscription clauses.</p>
                <p>Not us. Vellor operates on a strict <strong className="text-accent">"Zero Strings Attached"</strong> policy.</p>
                
                <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">1. Your Data is Yours.</h3>
                  <p>Vellor is an offline-first application. Everything you type, track, and manage lives exclusively on your own device. We do not have cloud servers, we do not monitor your usage, and we couldn't sell your students' information to advertisers even if we tried.</p>
                </div>

                <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">2. Zero Hidden Fees.</h3>
                  <p>There are no paywalls, no "premium" tiers, and absolutely no transaction cuts. You keep 100% of the money you earn from your hard work.</p>
                </div>

                <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">3. Zero Vendor Lock-in.</h3>
                  <p>We believe you should stay because the software is great, not because you're trapped. You can export your entire database as a standard CSV file at any time, with one click.</p>
                </div>

                <div className="bg-gray-50 dark:bg-primary p-6 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">4. Open Source Freedom.</h3>
                  <p>Vellor is free and open-source software built for independent educators. You are free to use it, modify it, and customize it to fit your academy's exact needs.</p>
                </div>

                <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
                  <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-4">Our Only "Condition":</h3>
                  <p className="max-w-md mx-auto italic text-gray-600 dark:text-gray-400">Treat your students well, teach them something valuable, and use this tool to take back your time. That's it. Now get back to growing your business.</p>
                  <Button onClick={() => setIsTermsOpen(false)} className="mt-8 w-full md:w-auto px-10 py-4 text-lg rounded-full font-bold shadow-lg shadow-accent/20">Got It</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Improvement #1: Mobile Slide-Out Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Slide-out panel */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-primary-dark z-[70] flex flex-col shadow-2xl border-l border-gray-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 font-display font-bold text-xl">
                  <img src="/logo.png" alt="Vellor" className="w-10 h-10 object-contain dark:bg-white/90 dark:rounded-xl dark:p-1" />
                  Vellor
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
                {[
                  { label: 'Features', id: 'features', icon: 'sparkles' },
                  { label: 'Gamification', id: 'gamification', icon: 'trophy' },
                  { label: 'Privacy', id: 'privacy', icon: 'lock-closed' },
                  { label: 'Open Source', id: 'open-source', icon: 'code' },
                  { label: 'FAQ', id: 'faq', icon: 'question-mark-circle' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToAndClose(item.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-semibold transition-colors"
                  >
                    <Icon iconName={item.icon as any} className="w-5 h-5 text-gray-400" />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-white/5">
                <Button
                  onClick={() => { setIsMobileMenuOpen(false); onGetStarted(); }}
                  className="w-full rounded-full py-4 text-base font-bold shadow-lg shadow-accent/20"
                >
                  Get Started — It's Free
                </Button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Improvement #3: Scroll-Linked Sticky Mobile CTA */}
      <AnimatePresence>
        {showFab && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-4 right-4 z-[55] md:hidden"
          >
            <Button
              onClick={onGetStarted}
              className="w-full rounded-full py-4 text-base font-bold shadow-2xl shadow-accent/40"
            >
              Get Started — It's Free
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
};
