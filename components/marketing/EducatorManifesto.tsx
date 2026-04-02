import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../ui';

export const EducatorManifesto: React.FC = () => {
  const [isManifestoExpanded, setIsManifestoExpanded] = useState(false);

  return (
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
  );
};
