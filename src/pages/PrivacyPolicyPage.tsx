import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';

const PrivacyPolicyPage: React.FC = () => {
  usePageMeta({
    title: 'Privacy Policy | TravelIQ',
    canonical: '/privacy'
  });
  const contentSectionClass = "mb-12";
  const headingClass = "text-2xl md:text-3xl font-bold font-heading text-brand-cyan mb-6";
  const subheadingClass = "text-xl font-semibold font-heading text-brand-cyan-light mb-4 mt-8";
  const paragraphClass = "text-brand-gray leading-relaxed mb-6 text-base";
  const listClass = "text-brand-gray leading-relaxed mb-4 pl-6";
  const listItemClass = "mb-3";
  const strongClass = "text-white font-semibold";
  const linkClass = "text-cyan-400 hover:text-cyan-300 underline transition-colors";
  const highlightBoxClass = "bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg p-6 mb-8";
  const tableClass = "w-full border-collapse border border-brand-cyan/30 rounded-lg overflow-hidden mb-8";
  const tableHeaderClass = "bg-brand-cyan/20 text-white font-semibold p-4 text-left";
  const tableCellClass = "border border-brand-cyan/30 p-4 text-brand-gray";

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070&auto=format&fit=crop')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-white text-center drop-shadow-lg">
            Privacy Policy
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 p-8 md:p-12 rounded-xl shadow-lg animate-fade-in">
          
          {/* Header Info */}
          <div className={contentSectionClass}>
            <div className={highlightBoxClass}>
              <p className={`${paragraphClass} text-sm mb-2`}><strong>Last Updated:</strong> December 13, 2025</p>
              <p className={`${paragraphClass} text-sm mb-2`}><strong>Effective Date:</strong> December 13, 2025</p>
              <p className={`${paragraphClass} text-sm`}>
                This Privacy Policy explains how TravelIQ collects, uses, discloses, and safeguards your information when you use our AI-powered travel supplier platform. We are committed to protecting your privacy in compliance with EU and UK data protection laws.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className={contentSectionClass}>
            <h2 className={headingClass}>Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className={listItemClass}><a href="#introduction" className={linkClass}>1. Introduction and Scope</a></p>
                <p className={listItemClass}><a href="#roles" className={linkClass}>2. Roles and Accountability</a></p>
                <p className={listItemClass}><a href="#data-collection" className={linkClass}>3. Information We Collect</a></p>
                <p className={listItemClass}><a href="#data-usage" className={linkClass}>4. How We Use Your Information</a></p>
                <p className={listItemClass}><a href="#legal-basis" className={linkClass}>5. Legal Basis for Processing</a></p>
                <p className={listItemClass}><a href="#data-sharing" className={linkClass}>6. Disclosure of Your Information</a></p>
              </div>
              <div>
                <p className={listItemClass}><a href="#ai-processing" className={linkClass}>7. AI and Voice/Text Processing</a></p>
                <p className={listItemClass}><a href="#data-security" className={linkClass}>8. Security of Your Information</a></p>
                <p className={listItemClass}><a href="#data-retention" className={linkClass}>9. Data Retention</a></p>
                <p className={listItemClass}><a href="#user-rights" className={linkClass}>10. Your Rights Under GDPR</a></p>
                <p className={listItemClass}><a href="#cookies" className={linkClass}>11. Cookies and Tracking</a></p>
                <p className={listItemClass}><a href="#international-transfers" className={linkClass}>12. International Data Transfers</a></p>
              </div>
            </div>
          </div>

          {/* 1. Introduction and Scope */}
          <div id="introduction" className={contentSectionClass}>
            <h2 className={headingClass}>1. Introduction and Scope</h2>
            <p className={paragraphClass}>
              Welcome to TravelIQ. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered travel supplier platform, including our AI assistant "Vee," lead capture systems, and related services.
            </p>
            <p className={paragraphClass}>
              The policy applies to all users located in the EU and UK and covers our website, AI chatbot interactions, forms, newsletter signup, analytics, and any related services. We comply with the EU General Data Protection Regulation (GDPR) and UK GDPR.
            </p>
            
            <h3 className={subheadingClass}>1.1 Services Covered</h3>
            <ul className={listClass}>
              <li className={listItemClass}>AI chatbot "Vee" (text and voice interactions)</li>
              <li className={listItemClass}>Lead capture and contact forms</li>
              <li className={listItemClass}>Newsletter signup and communications</li>
              <li className={listItemClass}>Chat history storage and management</li>
              <li className={listItemClass}>Supplier directory and profiles</li>
              <li className={listItemClass}>Admin dashboard and user authentication</li>
              <li className={listItemClass}>Third-party integrations (Google Sheets, AI services)</li>
            </ul>
          </div>

          {/* 2. Roles and Accountability */}
          <div id="roles" className={contentSectionClass}>
            <h2 className={headingClass}>2. Roles and Accountability</h2>
            <p className={paragraphClass}>
              TravelIQ acts as a <span className={strongClass}>data controller</span> for personal data we collect directly from users (e.g., name, email, agency information via forms, chat interactions, analytics data). As controller, we determine the purposes and means of processing and bear primary accountability for compliance, transparency, security, and rights handling.
            </p>
            <p className={paragraphClass}>
              In certain scenarios, particularly with supplier knowledge base data, TravelIQ may act as a <span className={strongClass}>data processor</span>, processing data on behalf of suppliers according to their documented instructions and contractual terms.
            </p>
            
            <h3 className={subheadingClass}>2.1 Accountability Measures</h3>
            <ul className={listClass}>
              <li className={listItemClass}>Maintenance of processing activity records</li>
              <li className={listItemClass}>Data Protection Impact Assessments (DPIAs) where required</li>
              <li className={listItemClass}>Implementation of privacy-by-design principles</li>
              <li className={listItemClass}>Staff training and awareness programs</li>
              <li className={listItemClass}>Regular compliance reviews and updates</li>
            </ul>
          </div>

          {/* 3. Information We Collect */}
          <div id="data-collection" className={contentSectionClass}>
            <h2 className={headingClass}>3. Information We Collect</h2>
            <p className={paragraphClass}>
              We may collect information about you in a variety of ways. The information we may collect includes:
            </p>
            
            <h3 className={subheadingClass}>3.1 Personal Data</h3>
            <ul className={listClass}>
              <li className={listItemClass}><span className={strongClass}>Contact Information:</span> Name, email address, phone number, agency name</li>
              <li className={listItemClass}><span className={strongClass}>Account Data:</span> Username, password (encrypted), profile information</li>
              <li className={listItemClass}><span className={strongClass}>Communication Data:</span> Messages sent through our platform, feedback, survey responses</li>
            </ul>

            <h3 className={subheadingClass}>3.2 Usage Data</h3>
            <ul className={listClass}>
              <li className={listItemClass}>IP address, browser type, operating system</li>
              <li className={listItemClass}>Access times and pages viewed</li>
              <li className={listItemClass}>Referring websites and exit pages</li>
              <li className={listItemClass}>Device information and unique identifiers</li>
            </ul>

            <h3 className={subheadingClass}>3.3 AI and Voice/Text Data</h3>
            <ul className={listClass}>
              <li className={listItemClass}>Voice commands and text inputs to our AI assistant</li>
              <li className={listItemClass}>AI-generated responses and conversation history</li>
              <li className={listItemClass}>Audio recordings (with consent) for service improvement</li>
              <li className={listItemClass}>Metadata about interaction patterns and preferences</li>
            </ul>
          </div>

          {/* 4. How We Use Your Information */}
          <div id="data-usage" className={contentSectionClass}>
            <h2 className={headingClass}>4. How We Use Your Information</h2>
            <p className={paragraphClass}>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We use information collected about you via the platform to:
            </p>
            
            <ul className={listClass}>
              <li className={listItemClass}>Create and manage your account and provide customer support</li>
              <li className={listItemClass}>Process transactions and send related information</li>
              <li className={listItemClass}>Generate AI responses and improve our chatbot functionality</li>
              <li className={listItemClass}>Send technical notices, updates, and support messages</li>
              <li className={listItemClass}>Monitor and analyze usage and trends to improve user experience</li>
              <li className={listItemClass}>Send marketing communications (with your consent)</li>
              <li className={listItemClass}>Respond to your comments, questions, and customer service requests</li>
              <li className={listItemClass}>Comply with legal obligations and protect our rights</li>
            </ul>
          </div>

          {/* 5. Legal Basis for Processing */}
          <div id="legal-basis" className={contentSectionClass}>
            <h2 className={headingClass}>5. Legal Basis for Processing</h2>
            <p className={paragraphClass}>
              Under GDPR, we must have a legal basis for processing your personal data. We rely on the following legal bases:
            </p>
            
            <h3 className={subheadingClass}>5.1 Contract Performance</h3>
            <p className={paragraphClass}>
              Processing necessary to provide our services, respond to inquiries, and fulfill our contractual obligations to you.
            </p>

            <h3 className={subheadingClass}>5.2 Consent</h3>
            <p className={paragraphClass}>
              Processing based on your explicit consent, particularly for marketing communications, non-essential cookies, and voice recording features.
            </p>

            <h3 className={subheadingClass}>5.3 Legitimate Interests</h3>
            <p className={paragraphClass}>
              Processing necessary for our legitimate interests in improving our services, preventing fraud, and ensuring platform security, balanced against your rights and interests.
            </p>

            <h3 className={subheadingClass}>5.4 Legal Obligation</h3>
            <p className={paragraphClass}>
              Processing necessary to comply with legal obligations, such as tax reporting and regulatory requirements.
            </p>
          </div>

          {/* 6. Disclosure of Your Information */}
          <div id="data-sharing" className={contentSectionClass}>
            <h2 className={headingClass}>6. Disclosure of Your Information</h2>
            <p className={paragraphClass}>
              We do not share your personal information with third parties except as described in this Privacy Policy. We may share information we have collected about you in certain situations:
            </p>
            
            <h3 className={subheadingClass}>6.1 Service Providers</h3>
            <p className={paragraphClass}>
              We work with trusted third-party service providers who perform services for us, including cloud hosting, analytics, customer support, and payment processing.
            </p>

            <h3 className={subheadingClass}>6.2 Legal Requirements</h3>
            <p className={paragraphClass}>
              We may disclose your information if required to do so by law or in response to valid requests by public authorities.
            </p>

            <h3 className={subheadingClass}>6.3 Business Transfers</h3>
            <p className={paragraphClass}>
              In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.
            </p>
          </div>

          {/* 7. AI and Voice/Text Processing */}
          <div id="ai-processing" className={contentSectionClass}>
            <h2 className={headingClass}>7. AI and Voice/Text Processing</h2>
            <p className={paragraphClass}>
              When you interact with our AI assistant "Vee," we process voice commands and text inputs to generate appropriate responses. This processing includes:
            </p>
            
            <h3 className={subheadingClass}>7.1 Voice Data Processing</h3>
            <ul className={listClass}>
              <li className={listItemClass}>Voice-to-text conversion for AI processing</li>
              <li className={listItemClass}>Analysis of voice patterns for quality improvement</li>
              <li className={listItemClass}>Secure storage of voice interactions (with consent)</li>
              <li className={listItemClass}>Anonymization for AI training purposes</li>
            </ul>

            <h3 className={subheadingClass}>7.2 Text Data Processing</h3>
            <ul className={listClass}>
              <li className={listItemClass}>Natural language processing for response generation</li>
              <li className={listItemClass}>Conversation context management</li>
              <li className={listItemClass}>Sentiment analysis for service improvement</li>
              <li className={listItemClass}>Content moderation and safety checks</li>
            </ul>

            <h3 className={subheadingClass}>7.3 Supplier Knowledge Base</h3>
            <p className={paragraphClass}>
              For our supplier partners, we understand that knowledge base data is sensitive and proprietary. We maintain strict confidentiality and security for this information, using it exclusively to power dedicated AI sales support assistants.
            </p>
          </div>

          {/* 8. Security of Your Information */}
          <div id="data-security" className={contentSectionClass}>
            <h2 className={headingClass}>8. Security of Your Information</h2>
            <p className={paragraphClass}>
              We use administrative, technical, and physical security measures to help protect your personal information. Our security measures include:
            </p>
            
            <ul className={listClass}>
              <li className={listItemClass}>Encryption of data in transit and at rest</li>
              <li className={listItemClass}>Access controls and authentication systems</li>
              <li className={listItemClass}>Regular security audits and penetration testing</li>
              <li className={listItemClass}>Staff training on data protection and security</li>
              <li className={listItemClass}>Incident response procedures and breach notification</li>
              <li className={listItemClass}>Secure cloud infrastructure with backup systems</li>
            </ul>
            
            <div className={highlightBoxClass}>
              <p className={paragraphClass}>
                <strong>Important:</strong> While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </div>
          </div>

          {/* 9. Data Retention */}
          <div id="data-retention" className={contentSectionClass}>
            <h2 className={headingClass}>9. Data Retention</h2>
            <p className={paragraphClass}>
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            
            <h3 className={subheadingClass}>9.1 Retention Periods</h3>
            <ul className={listClass}>
              <li className={listItemClass}><span className={strongClass}>Account Data:</span> Duration of account plus 3 years</li>
              <li className={listItemClass}><span className={strongClass}>Chat History:</span> 2 years for service improvement</li>
              <li className={listItemClass}><span className={strongClass}>Voice Recordings:</span> 1 year unless longer retention required for quality purposes</li>
              <li className={listItemClass}><span className={strongClass}>Marketing Data:</span> Until consent is withdrawn</li>
              <li className={listItemClass}><span className={strongClass}>Legal Compliance:</span> As required by applicable laws</li>
            </ul>
          </div>

          {/* 10. Your Rights Under GDPR */}
          <div id="user-rights" className={contentSectionClass}>
            <h2 className={headingClass}>10. Your Rights Under GDPR</h2>
            <p className={paragraphClass}>
              Under GDPR, you have several rights regarding your personal data. You may exercise these rights at any time by contacting us.
            </p>
            
            <h3 className={subheadingClass}>10.1 Your Rights Include:</h3>
            <ul className={listClass}>
              <li className={listItemClass}><span className={strongClass}>Right of Access:</span> Request copies of your personal data</li>
              <li className={listItemClass}><span className={strongClass}>Right to Rectification:</span> Request correction of inaccurate or incomplete data</li>
              <li className={listItemClass}><span className={strongClass}>Right to Erasure:</span> Request deletion of your personal data</li>
              <li className={listItemClass}><span className={strongClass}>Right to Data Portability:</span> Request transfer of your data to another organization</li>
              <li className={listItemClass}><span className={strongClass}>Right to Object:</span> Object to processing based on legitimate interests</li>
              <li className={listItemClass}><span className={strongClass}>Right to Restrict Processing:</span> Request limitation of processing</li>
              <li className={listItemClass}><span className={strongClass}>Right to Withdraw Consent:</span> Withdraw consent where processing is based on consent</li>
            </ul>

            <h3 className={subheadingClass}>10.2 How to Exercise Your Rights</h3>
            <p className={paragraphClass}>
              To exercise any of these rights, please contact us at <a href="mailto:hey@traveliq.biz" className={linkClass}>hey@traveliq.biz</a>. We will respond to your request within 30 days.
            </p>
          </div>

          {/* 11. Cookies and Tracking */}
          <div id="cookies" className={contentSectionClass}>
            <h2 className={headingClass}>11. Cookies and Tracking</h2>
            <p className={paragraphClass}>
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
            </p>
            
            <h3 className={subheadingClass}>11.1 Types of Cookies We Use</h3>
            <ul className={listClass}>
              <li className={listItemClass}><span className={strongClass}>Essential Cookies:</span> Required for basic platform functionality</li>
              <li className={listItemClass}><span className={strongClass}>Analytics Cookies:</span> Help us understand how users interact with our platform</li>
              <li className={listItemClass}><span className={strongClass}>Marketing Cookies:</span> Used to track visitors across websites for marketing purposes</li>
              <li className={listItemClass}><span className={strongClass}>Functional Cookies:</span> Enable enhanced functionality and personalization</li>
            </ul>

            <h3 className={subheadingClass}>11.2 Cookie Management</h3>
            <p className={paragraphClass}>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
            </p>
          </div>

          {/* 12. International Data Transfers */}
          <div id="international-transfers" className={contentSectionClass}>
            <h2 className={headingClass}>12. International Data Transfers</h2>
            <p className={paragraphClass}>
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
            </p>
            
            <h3 className={subheadingClass}>12.1 Transfer Safeguards</h3>
            <ul className={listClass}>
              <li className={listItemClass}>Adequacy decisions by the European Commission</li>
              <li className={listItemClass}>Standard Contractual Clauses (SCCs)</li>
              <li className={listItemClass}>Binding Corporate Rules</li>
              <li className={listItemClass}>Certification schemes and codes of conduct</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className={contentSectionClass}>
            <h2 className={headingClass}>Contact Information</h2>
            <p className={paragraphClass}>
              If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:hey@traveliq.biz" className={linkClass}>hey@traveliq.biz</a>
            </p>
            
            <div className={highlightBoxClass}>
              <h3 className="text-lg font-semibold text-brand-cyan mb-3">Data Protection Queries</h3>
              <p className={paragraphClass}>
                For specific data protection questions or to exercise your rights under GDPR, you may also contact your local data protection supervisory authority:
              </p>
              <ul className={listClass}>
                <li className={listItemClass}><span className={strongClass}>EU:</span> Your national data protection authority</li>
                <li className={listItemClass}><span className={strongClass}>UK:</span> Information Commissioner's Office (ICO)</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;