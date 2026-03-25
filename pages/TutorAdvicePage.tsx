import React from 'react';
import { Icon } from '../components/ui';
import { motion } from 'framer-motion';

export const TutorAdvicePage: React.FC = () => {
    return (
        <motion.div 
            className="space-y-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="mb-8">
                <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
                        <Icon iconName="book-open" className="w-6 h-6 text-accent" />
                    </div>
                    Friendly Advices to be a Great Tutor
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Elevate your teaching quality, build strong relationships with your students, and maximize your impact.</p>
            </div>

            <div className="space-y-6 text-gray-600 dark:text-gray-300 text-base md:text-lg">
                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Don't Be a "Teacher." Be a Friend (and a Mentor).</h3>
                  <p>The traditional power dynamic of "I speak, you listen" is outdated. Sit beside them, not across from them. When a student views you as an older sibling or a trusted friend rather than a strict authority figure, their defensive walls drop. They become open to making mistakes, which is the exact moment real learning begins.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Make AI Your Ultimate Teaching Co-Pilot.</h3>
                  <p>You don't have to build every lesson plan from scratch. Lean into AI tools like Gemini, NotebookLM, Grok, or ChatGPT to act as your brainstorming partners. Use them to generate highly personalized study plans, create interactive quizzes, or find fresh, weird analogies to explain dry topics.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Optimize for "Why," Not Just "What."</h3>
                  <p>Memorizing a formula is useless if the student doesn't know <em>why</em> the formula exists. Always push past rote memorization. If they can solve a math problem but can't explain the logic behind the steps, they haven't learned it yet. Make them understand the core mechanics of the concept.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Read the Room (Understand Their Psychology).</h3>
                  <p>Every student has a unique psychological baseline. Notice how they handle frustration—do they shut down, get angry, or guess wildly? Pay attention to their body language. Understanding <em>how</em> they deal with difficult situations allows you to tailor your tone and approach to keep them in a productive headspace.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Enforce Relentless Critical Thinking.</h3>
                  <p>Stop giving them the answers immediately. When they get stuck, reply with a question: <em>"What do you think our next logical step should be?"</em> Train them to break down massive, intimidating problems into smaller, solvable components.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Gamify the Wins (Big and Small).</h3>
                  <p>Human brains are wired for rewards. You don't need to hand out physical prizes, but you should absolutely celebrate their milestones. Call out a brilliant question, acknowledge when they finally grasp a tough concept, and create a system of micro-rewards to keep their dopamine tied to their effort.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Flip the Script (The Feynman Technique).</h3>
                  <p>The ultimate test of understanding is the ability to teach it. Once you finish a complex topic, hand them the metaphorical chalk. Ask them to explain the concept back to you as if you were a complete beginner. If they stumble, you instantly know where the gaps are.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Connect the Abstract to the Real World.</h3>
                  <p>Nobody wants to learn something that feels useless. If you are teaching physics, talk about how it applies to rocket launches. If you are teaching math, show how it applies to building video games or running a startup. Anchor abstract theories to real, tangible reality.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Create a Zero-Judgment Zone for "Dumb" Questions.</h3>
                  <p>A student will only ask the question that unlocks their understanding if they feel 100% safe doing so. Explicitly tell them, <em>"There are zero stupid questions here."</em> Praise them for asking fundamental questions, because those are usually the most important ones.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. Adapt to Their Bandwidth.</h3>
                  <p>Some days, a student will show up exhausted, distracted, or overwhelmed. Recognize when their cognitive bandwidth is low. On those days, ditch the heavy new material and pivot to reviewing older concepts or doing a fun, interactive exercise. Meet them where their energy is.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">11. Praise the Process, Not the Intellect.</h3>
                  <p>Never say, <em>"You're so smart."</em> Say, <em>"I love how hard you worked to figure that out."</em> Praising intellect creates a fear of looking stupid. Praising effort builds a growth mindset, teaching them that resilience is their most valuable asset.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">12. Treat Failures as Pure Data.</h3>
                  <p>When a student bombs a mock test or fails an assignment, don't let them spiral. Reframe the failure. A wrong answer isn't a character flaw; it's just raw data pointing exactly to what needs to be optimized next.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">13. Keep the Feedback Loop Tight and Gentle.</h3>
                  <p>Don't wait until the end of a month to tell a student they are doing something wrong. Offer micro-corrections constantly, but keep them gentle. <em>"You're on the right track, but let's tweak this one variable..."</em> is much better than <em>"No, that's incorrect."</em></p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">14. Innovate the Delivery.</h3>
                  <p>Textbooks are boring. Innovate how you deliver the knowledge. Build a quick Python script to visualize a math problem, use digital whiteboards, or find an interactive simulation online. Keep the delivery method dynamic so their brain stays engaged.</p>
                </div>

                <div className="bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">15. Stay Insanely Curious Yourself.</h3>
                  <p>The best tutors are the ones who are still obsessed with learning. Share your own current learning struggles with them. When they see that you are also a student of the world—figuring things out, making mistakes, and growing—it gives them the permission to do the exact same thing.</p>
                </div>
            </div>
        </motion.div>
    );
};
