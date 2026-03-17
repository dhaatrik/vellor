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
          <p className="font-semibold text-gray-900 dark:text-white">100% Local, 100% Private</p>
          <p>
            Everything in Vellor is stored locally on your device using your browser's local storage mechanism.
          </p>
          <p>
            Not today, not tomorrow, and not any day in the future will your data be collected, tracked, or used for the developer's personal interests. There are no tracking scripts, no analytics, and no cloud servers hosting your data.
          </p>
          <p>
            The name, phone number, and email you provide during setup are stored solely on your device to create your easily shareable visiting card and personalize the application. Your students' details and payment records remain strictly in your own local database.
          </p>
          <div className="pt-4 flex justify-end">
            <Button onClick={() => setPrivacyOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal isOpen={termsOpen} onClose={() => setTermsOpen(false)} title="Terms & Conditions" maxWidthClass="max-w-2xl">
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p className="font-semibold text-gray-900 dark:text-white">Free & Unconditional</p>
          <p>
            Vellor is provided to you completely for free, with no conditions applied. There are no premium tiers, subscriptions, or hidden catches.
          </p>
          <p>
            This software is open-source and MIT-licensed. By using it, you acknowledge that you have full ownership and responsibility for the data you enter. As your data is kept on-device, you are responsible for maintaining your own backups via the built-in Export feature.
          </p>
          <p>
            The software is provided "as is", without warranty of any kind, express or implied.
          </p>
          <div className="pt-4 flex justify-end">
            <Button onClick={() => setTermsOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
