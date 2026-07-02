import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';

const TermsPage: React.FC = () => {
  usePageMeta({
    title: 'Terms of Service | TravelIQ',
    canonical: '/terms'
  });
  const contentSectionClass = "mb-12";
  const headingClass = "text-2xl md:text-3xl font-bold font-heading text-brand-cyan mb-6";
  const subheadingClass = "text-xl font-semibold font-heading text-brand-cyan-light mb-4 mt-8";
  const paragraphClass = "text-brand-gray leading-relaxed mb-6 text-base";
  const listClass = "text-brand-gray leading-relaxed mb-4 pl-6";
  const listItemClass = "mb-3";
  const strongClass = "text-white font-semibold";
  const linkClass = "text-cyan-400 hover:text-cyan-300 underline transition-colors";
  const tableClass = "w-full border-collapse border border-brand-cyan/30 rounded-lg overflow-hidden mb-8";
  const tableHeaderClass = "bg-brand-cyan/20 text-white font-semibold p-4 text-left";
  const tableCellClass = "border border-brand-cyan/30 p-4 text-brand-gray";

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-white text-center drop-shadow-lg">
            Terms & Conditions
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 p-8 md:p-12 rounded-xl shadow-lg animate-fade-in">
          
          {/* Header Info */}
          <div className={contentSectionClass}>
            <p className={`${paragraphClass} text-sm mb-4`}><strong>Last Updated:</strong> December 13, 2025</p>
            <p className={`${paragraphClass} mb-4`}><strong>Effective Date:</strong> December 13, 2025</p>
            <p className={`${paragraphClass}`}>
              These Terms and Conditions ("Terms") govern access to and use of the TravelIQ platform, website, and related services. They are designed for dual compliance with European Union ("EU") and United Kingdom ("UK") consumer and digital services laws.
            </p>
          </div>

          {/* Table of Contents */}
          <div className={contentSectionClass}>
            <h2 className={headingClass}>Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className={listItemClass}><a href="#scope" className={linkClass}>1. Scope, Definitions, and Parties</a></p>
                <p className={listItemClass}><a href="#service" className={linkClass}>2. Description of Service</a></p>
                <p className={listItemClass}><a href="#eligibility" className={linkClass}>3. Eligibility and Registration</a></p>
                <p className={listItemClass}><a href="#user-conduct" className={linkClass}>4. User Conduct and Obligations</a></p>
                <p className={listItemClass}><a href="#ai-features" className={linkClass}>5. AI Features and Limitations</a></p>
                <p className={listItemClass}><a href="#data-protection" className={linkClass}>6. Data Protection and Privacy</a></p>
              </div>
              <div>
                <p className={listItemClass}><a href="#intellectual-property" className={linkClass}>7. Intellectual Property</a></p>
                <p className={listItemClass}><a href="#service-availability" className={linkClass}>8. Service Availability and Modifications</a></p>
                <p className={listItemClass}><a href="#liability" className={linkClass}>9. Limitation of Liability</a></p>
                <p className={listItemClass}><a href="#termination" className={linkClass}>10. Termination</a></p>
                <p className={listItemClass}><a href="#dispute-resolution" className={linkClass}>11. Dispute Resolution</a></p>
                <p className={listItemClass}><a href="#changes" className={linkClass}>12. Changes to Terms</a></p>
              </div>
            </div>
          </div>

          {/* 1. Scope, Definitions, and Parties */}
          <div id="scope" className={contentSectionClass}>
            <h2 className={headingClass}>1. Scope, Definitions, and Parties</h2>
            <h3 className={subheadingClass}>1.1 Scope</h3>
            <p className={paragraphClass}>
              These Terms apply to access to and use of the TravelIQ platform, including AI representatives, chat interfaces, directory listings, and administrative features. They also govern lead capture and synchronization to external systems, such as Google Sheets, when enabled by customer configuration.
            </p>
            
            <h3 className={subheadingClass}>1.2 Definitions</h3>
            <p className={paragraphClass}>
              <span className={strongClass}>"TravelIQ," "we," "us," "our"</span> means the operator of the Services.<br/>
              <span className={strongClass}>"User," "you," "your"</span> means any person or entity that accesses or uses the Services, including travel agents, suppliers, and administrators.<br/>
              <span className={strongClass}>"Consumer"</span> means an individual acting for purposes outside their trade, business, craft, or profession.<br/>
              <span className={strongClass}>"Supplier"</span> means travel industry partners whose information is listed or accessible via the Services.<br/>
              <span className={strongClass}>"Agent"</span> means travel agents and advisors using the Services to engage suppliers and capture leads.
            </p>
          </div>

          {/* 2. Description of Service */}
          <div id="service" className={contentSectionClass}>
            <h2 className={headingClass}>2. Description of Service</h2>
            <p className={paragraphClass}>
              TravelIQ provides travel agents with access to AI-powered representatives of travel suppliers. The Service includes:
            </p>
            <ul className={listClass}>
              <li className={listItemClass}>AI-powered virtual representatives ("Vee") for supplier interactions</li>
              <li className={listItemClass}>Curated supplier directory with airline, hotel, and cruise partners</li>
              <li className={listItemClass}>Lead capture and synchronization systems</li>
              <li className={listItemClass}>Voice and text interaction capabilities</li>
              <li className={listItemClass}>Admin dashboard and chat history tracking</li>
              <li className={listItemClass}>Third-party integrations (Google Sheets, AI services)</li>
            </ul>
            <p className={paragraphClass}>
              The information provided by the AI is based on data supplied by our partners. While we strive for accuracy, we do not warrant that all information is complete, reliable, or current.
            </p>
          </div>

          {/* 3. Eligibility and Registration */}
          <div id="eligibility" className={contentSectionClass}>
            <h2 className={headingClass}>3. Eligibility and Registration</h2>
            <p className={paragraphClass}>
              You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you have the legal capacity to enter into these Terms. Travel agents and suppliers may be required to provide verification of their business credentials.
            </p>
            <p className={paragraphClass}>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </div>

          {/* 4. User Conduct and Obligations */}
          <div id="user-conduct" className={contentSectionClass}>
            <h2 className={headingClass}>4. User Conduct and Obligations</h2>
            <p className={paragraphClass}>
              You agree not to use the Service for any unlawful purpose or in any way that could harm the Service or its users. You are responsible for all your activity in connection with the Service.
            </p>
            <h3 className={subheadingClass}>4.1 Prohibited Activities</h3>
            <ul className={listClass}>
              <li className={listItemClass}>Violating any applicable laws or regulations</li>
              <li className={listItemClass}>Infringing intellectual property rights</li>
              <li className={listItemClass}>Transmitting harmful, offensive, or inappropriate content</li>
              <li className={listItemClass}>Attempting to gain unauthorized access to the Service</li>
              <li className={listItemClass}>Using automated systems to access the Service without permission</li>
              <li className={listItemClass}>Misrepresenting your identity or business credentials</li>
            </ul>
          </div>

          {/* 5. AI Features and Limitations */}
          <div id="ai-features" className={contentSectionClass}>
            <h2 className={headingClass}>5. AI Features and Limitations</h2>
            <p className={paragraphClass}>
              The Service includes AI-powered features that provide information based on supplier data. Users acknowledge and agree that:
            </p>
            <ul className={listClass}>
              <li className={listItemClass}>AI-generated responses are for informational purposes only</li>
              <li className={listItemClass}>Information accuracy may vary and should be verified independently</li>
              <li className={listItemClass}>TravelIQ is not liable for decisions made based on AI-provided information</li>
              <li className={listItemClass}>Voice and text interactions may be recorded for quality and compliance purposes</li>
              <li className={listItemClass}>AI responses are generated based on available data and may not reflect real-time changes</li>
            </ul>
          </div>

          {/* 6. Data Protection and Privacy */}
          <div id="data-protection" className={contentSectionClass}>
            <h2 className={headingClass}>6. Data Protection and Privacy</h2>
            <p className={paragraphClass}>
              Your privacy is important to us. Our data processing practices are governed by our Privacy Policy, which forms part of these Terms. Key principles include:
            </p>
            <ul className={listClass}>
              <li className={listItemClass}>Compliance with GDPR and UK GDPR</li>
              <li className={listItemClass}>Data minimization and purpose limitation</li>
              <li className={listItemClass}>Appropriate security measures for data protection</li>
              <li className={listItemClass}>Respect for user rights regarding their personal data</li>
              <li className={listItemClass}>Transparent data sharing with third parties where necessary</li>
            </ul>
            <p className={paragraphClass}>
              For detailed information about how we collect, use, and protect your data, please review our <a href="/privacy" className={linkClass}>Privacy Policy</a>.
            </p>
          </div>

          {/* 7. Intellectual Property */}
          <div id="intellectual-property" className={contentSectionClass}>
            <h2 className={headingClass}>7. Intellectual Property</h2>
            <p className={paragraphClass}>
              The Service and its original content, features, and functionality are and will remain the exclusive property of TravelIQ and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
            <p className={paragraphClass}>
              Users retain ownership of content they provide, but grant TravelIQ a license to use such content for the operation and improvement of the Service.
            </p>
          </div>

          {/* 8. Service Availability and Modifications */}
          <div id="service-availability" className={contentSectionClass}>
            <h2 className={headingClass}>8. Service Availability and Modifications</h2>
            <p className={paragraphClass}>
              We strive to maintain the Service's availability but cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
            </p>
            <p className={paragraphClass}>
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with reasonable notice where possible.
            </p>
          </div>

          {/* 9. Limitation of Liability */}
          <div id="liability" className={contentSectionClass}>
            <h2 className={headingClass}>9. Limitation of Liability</h2>
            <p className={paragraphClass}>
              In no event shall TravelIQ, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
            <p className={paragraphClass}>
              Our total liability for any claims arising under these Terms shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
            </p>
          </div>

          {/* 10. Termination */}
          <div id="termination" className={contentSectionClass}>
            <h2 className={headingClass}>10. Termination</h2>
            <p className={paragraphClass}>
              We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className={paragraphClass}>
              You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will cease immediately.
            </p>
          </div>

          {/* 11. Dispute Resolution */}
          <div id="dispute-resolution" className={contentSectionClass}>
            <h2 className={headingClass}>11. Dispute Resolution</h2>
            <h3 className={subheadingClass}>11.1 Governing Law</h3>
            <p className={paragraphClass}>
              These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
            </p>
            
            <h3 className={subheadingClass}>11.2 EU Consumer Rights</h3>
            <p className={paragraphClass}>
              For EU consumers, these Terms comply with the EU Consumer Rights Directive, including a 14-day cooling-off period for certain services. You may also have access to alternative dispute resolution mechanisms in your country of residence.
            </p>
            
            <h3 className={subheadingClass}>11.3 Contact for Disputes</h3>
            <p className={paragraphClass}>
              Before initiating formal proceedings, please contact us at <a href="mailto:hey@traveliq.biz" className={linkClass}>hey@traveliq.biz</a> to attempt to resolve disputes amicably.
            </p>
          </div>

          {/* 12. Changes to Terms */}
          <div id="changes" className={contentSectionClass}>
            <h2 className={headingClass}>12. Changes to Terms</h2>
            <p className={paragraphClass}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </div>

          {/* Contact Information */}
          <div className={contentSectionClass}>
            <h2 className={headingClass}>Contact Information</h2>
            <p className={paragraphClass}>
              If you have any questions about these Terms, please contact us at: <a href="mailto:hey@traveliq.biz" className={linkClass}>hey@traveliq.biz</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsPage;