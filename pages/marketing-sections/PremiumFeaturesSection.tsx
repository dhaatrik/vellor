import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../../components/ui';

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

export interface PremiumFeaturesSectionProps {
  data: { month: string; revenue: number }[];
}

export const PremiumFeaturesSection = ({ data }: PremiumFeaturesSectionProps) => (
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
);
