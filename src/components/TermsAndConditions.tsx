import React from 'react';
import { X } from 'lucide-react';

interface TermsAndConditionsProps {
  onAccept: () => void;
}

function TermsAndConditions({ onAccept }: TermsAndConditionsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Terms and Conditions</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to Gigzs, a freelancing marketplace platform built on trust, transparency, and niche-specific collaboration. These Terms and Conditions ("Terms") govern your access and use of the platform, services, and tools provided by Gigzs ("we", "our", or "us"). By accessing or using Gigzs, you agree to these Terms.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Eligibility</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>You must be at least 18 years old and legally able to form a binding contract.</li>
              <li>You agree to provide accurate, truthful information during signup and verification.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2. User Types</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Freelancers: Individuals or teams offering professional services.</li>
              <li>Clients: Individuals or businesses hiring freelancers for projects.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Account Responsibilities</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>You are responsible for maintaining the confidentiality of your account.</li>
              <li>You may not impersonate another user or use false information.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Verification & Screening</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Gigzs reserves the right to verify user identities using KYC, background checks, or psychological screening.</li>
              <li>Freelancers undergo skill and mental compatibility tests as part of onboarding.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">5. Gig Creation & Projects</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Clients may post projects and invite freelancers.</li>
              <li>Freelancers may propose services via predefined "Gig Packs."</li>
              <li>All work agreements must be structured through Gigzs contracts and must not bypass the platform.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">6. Vault Submission System</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Freelancers submit completed work into the Vault System.</li>
              <li>Clients preview work and release payment only upon satisfaction.</li>
              <li>This system ensures protection for both parties.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">7. Payments & Fees</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Payments are made securely through approved gateways (e.g., Cashfree, [future Gigzs Payments]).</li>
              <li>Gigzs charges a platform fee on successful transactions (percentage defined at onboarding).</li>
              <li>Withdrawal timelines and fees may vary based on region.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">8. Prohibited Activities</h3>
            <p className="text-gray-600 mb-2">You may not:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Bypass Gigzs to avoid fees.</li>
              <li>Use AI to generate fraudulent or low-effort work.</li>
              <li>Engage in harassment, spamming, or abusive behavior.</li>
              <li>Submit fake projects, reviews, or documentation.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">9. Dispute Resolution</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Disputes between clients and freelancers should first be resolved through our internal Dispute Resolution Team.</li>
              <li>Both parties must provide all necessary communication, contract agreements, and work proofs.</li>
              <li>Gigzs reserves final authority to mediate and decide dispute outcomes.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">10. Termination & Suspension</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>We may suspend or terminate accounts for violating terms or engaging in harmful behavior.</li>
              <li>Users may request account closure at any time.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">11. Intellectual Property</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Users retain ownership of their work unless otherwise agreed in writing.</li>
              <li>Clients gain rights to work only after payment is fully processed.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">12. Limitation of Liability</h3>
            <p className="text-gray-600 mb-2">Gigzs is not liable for:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Any direct or indirect losses resulting from disputes, missed deadlines, or platform downtime.</li>
              <li>Any third-party interactions outside the platform.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">13. Changes to Terms</h3>
            <p className="text-gray-600 mb-6">
              We may update these Terms from time to time. Continued use of Gigzs after changes means you accept the updated Terms.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">14. Data Security</h3>
            <p className="text-gray-600 mb-6">
              If any data leak happens by freelancer or by technical glitches or by cyber attacks, Gigzs is not liable for any actions or complaints.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">15. Contact Us</h3>
            <p className="text-gray-600 mb-6">
              For support or questions about these Terms, email us at: <a href="mailto:info@gigzs.in" className="text-primary hover:underline">info@gigzs.in</a>
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onAccept}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-[#005538] transition-colors"
          >
            I Agree to the Terms and Conditions
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions; 