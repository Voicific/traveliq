import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  const contentSectionClass = "mb-10";
  const headingClass = "text-2xl font-bold font-heading text-brand-cyan mb-4";
  const paragraphClass = "text-brand-gray leading-relaxed mb-4";

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">
      <div className="relative h-64 md:h-80 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070&auto=format&fit=crop')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-white text-center drop-shadow-lg">
            Privacy Policy
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 p-8 md:p-12 rounded-xl shadow-lg animate-fade-in">
          <p className={`${paragraphClass} text-sm`}>Last Updated: August 1, 2024</p>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>1. Introduction</h2>
            <p className={paragraphClass}>
              Welcome to TravelIQ. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </div>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>2. Information We Collect</h2>
            <p className={paragraphClass}>
              We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and agency name, that you voluntarily give to us when you register for our newsletter or use the lead capture forms.</li>
              <li><strong>Usage Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the site.</li>
              <li><strong>Voice and Text Data:</strong> When you interact with our AI representatives, we process the voice commands and text inputs you provide to generate responses. These interactions are used to improve our service but are not tied to your personal identity without your consent.</li>
            </ul>
          </div>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>3. How We Use Your Information</h2>
            <p className={paragraphClass}>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Create and manage your account.</li>
              <li>Email you regarding your account or order.</li>
              <li>Send you our newsletter and other updates.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
              <li>Improve the quality and accuracy of our AI models.</li>
            </ul>
          </div>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>4. Supplier and Knowledge Base Data</h2>
            <p className={paragraphClass}>
                For our supplier partners, we understand that the information you provide for your AI Knowledge Base (including product manuals, policies, and internal documents) is sensitive and proprietary. We are committed to the highest level of security and confidentiality for this data.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Strict Confidentiality:</strong> Your knowledge base data is used exclusively to power your dedicated AI Sales Support assistant. It is never shared with, sold to, or accessible by any other supplier, third party, or used for training general AI models.</li>
                <li><strong>Data Security:</strong> We employ robust security measures to protect your knowledge base data from unauthorized access, alteration, or disclosure.</li>
                <li><strong>GDPR Compliance:</strong> All data, including supplier knowledge bases, is handled in full compliance with GDPR regulations. You retain ownership of your data, and we act solely as a data processor on your behalf to provide the Service.</li>
            </ul>
          </div>
          
          <div className={contentSectionClass}>
            <h2 className={headingClass}>5. Disclosure of Your Information</h2>
             <p className={paragraphClass}>
              We do not share your personal information with third parties except as described in this Privacy Policy. We may share information we have collected about you in certain situations, such as with our third-party service providers who perform services for us or on our behalf, including data analysis, email delivery, hosting services, and customer service.
            </p>
          </div>

          <div className={contentSectionClass}>
            <h2 className={headingClass}>6. Security of Your Information</h2>
            <p className={paragraphClass}>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </div>
          
           <div className={contentSectionClass}>
            <h2 className={headingClass}>7. Contact Us</h2>
            <p className={paragraphClass}>
              If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:sales@voicific.com" className="text-cyan-400 hover:underline">sales@voicific.com</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;