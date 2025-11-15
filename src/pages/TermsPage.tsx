

import React from 'react';

const TermsPage: React.FC = () => {
  const contentSectionClass = "mb-10";
  const headingClass = "text-2xl font-bold font-heading text-brand-cyan mb-4";
  const paragraphClass = "text-brand-gray leading-relaxed mb-4";

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">
      <div className="relative h-64 md:h-80 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-white text-center drop-shadow-lg">
            Terms & Conditions
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 p-8 md:p-12 rounded-xl shadow-lg animate-fade-in">
          <p className={`${paragraphClass} text-sm`}>Last Updated: August 1, 2024</p>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>1. Agreement to Terms</h2>
            <p className={paragraphClass}>
              By using the TravelIQ platform ("Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the Service.
            </p>
          </div>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>2. Description of Service</h2>
            <p className={paragraphClass}>
              TravelIQ provides travel agents with access to AI-powered representatives of travel suppliers. The information provided by the AI is based on data supplied by our partners. While we strive for accuracy, we do not warrant that all information is complete, reliable, or current.
            </p>
          </div>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>3. User Conduct</h2>
            <p className={paragraphClass}>
              You agree not to use the Service for any unlawful purpose or in any way that could harm the Service or its users. You are responsible for all your activity in connection with the Service.
            </p>
          </div>
          
          <div className={contentSectionClass}>
            <h2 className={headingClass}>4. Intellectual Property</h2>
            <p className={paragraphClass}>
              The Service and its original content, features, and functionality are and will remain the exclusive property of TravelIQ and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </div>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>5. Termination</h2>
            <p className={paragraphClass}>
              We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </div>
          
          <div className={contentSectionClass}>
            <h2 className={headingClass}>6. Limitation of Liability</h2>
            <p className={paragraphClass}>
              In no event shall TravelIQ, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </div>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>7. Changes to Terms</h2>
            <p className={paragraphClass}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </div>
          
          <div className={contentSectionClass}>
            <h2 className={headingClass}>8. Contact Us</h2>
            <p className={paragraphClass}>
              If you have any questions about these Terms, please contact us at: <a href="mailto:sales@voicific.com" className="text-cyan-400 hover:underline">sales@voicific.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;