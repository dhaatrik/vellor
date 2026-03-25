import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface LegalModalsProps {
  aboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;
  privacyOpen: boolean;
  setPrivacyOpen: (open: boolean) => void;
  termsOpen: boolean;
  setTermsOpen: (open: boolean) => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  aboutOpen,
  setAboutOpen,
  privacyOpen,
  setPrivacyOpen,
  termsOpen,
  setTermsOpen
}) => {
  return (
    <>
      {/* About Modal */}
      <Modal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} title="About Vellor" maxWidthClass="max-w-2xl">
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p className="font-semibold text-lg text-gray-900 dark:text-white">
            Vellor (from Vellum + Valor)
          </p>
          <p>
            Vellum represents the high-quality calfskin parchment used for historical manuscripts — a nod to keeping prestigious, durable archives of your business records.
          </p>
          <p>
            Valor represents the courage and merit of the independent entrepreneur.
          </p>
          <p>
            Together, Vellor evokes a "Scholarly Sensei" vibe. It is a professional-grade, premium tool built for serious educators who want the best experience without compromising on privacy. Best of all, it's completely free.
          </p>
          <div className="pt-4 flex justify-end">
            <Button onClick={() => setAboutOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy Policy" maxWidthClass="max-w-2xl">
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
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

          <div className="pt-4 text-center pb-4 border-t border-gray-100 dark:border-gray-800">
            <p className="max-w-md mx-auto italic text-gray-600 dark:text-gray-400 mb-6">What happens on your device, stays on your device. Run your tutoring business with total peace of mind.</p>
            <Button onClick={() => setPrivacyOpen(false)}>Understood</Button>
          </div>
        </div>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal isOpen={termsOpen} onClose={() => setTermsOpen(false)} title="Terms & Conditions" maxWidthClass="max-w-2xl">
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
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

          <div className="pt-4 text-center pb-4 border-t border-gray-100 dark:border-gray-800">
            <p className="max-w-md mx-auto italic text-gray-600 dark:text-gray-400 mb-6">Treat your students well, teach them something valuable, and use this tool to take back your time. That's it. Now get back to growing your business.</p>
            <Button onClick={() => setTermsOpen(false)}>Got It</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
