import React, { useId, useState } from 'react';
import { ChevronDown, BarChart3, Users, ShieldCheck, BadgeCheck, Eye } from 'lucide-react';
import Reveal from './Reveal.tsx';

/**
 * Refined disclosure item. The answer is always rendered in the DOM (visible
 * to prerender/crawlers even when collapsed) and animated open with the CSS
 * grid-rows technique — no content lives behind JS.
 */
const FAQItem: React.FC<{ question: React.ReactNode; children: React.ReactNode }> = ({
  question,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="border-b border-cyan-400/10 transition-colors duration-300 hover:border-cyan-400/25">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-medium text-gray-100 transition-colors duration-300 group-hover:text-cyan-300 sm:text-lg">
          {question}
        </span>
        <ChevronDown
          strokeWidth={1.5}
          className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-cyan-400' : 'text-gray-500'
          }`}
        />
      </button>
      <div
        id={contentId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pb-5 leading-relaxed text-gray-400">{children}</div>
        </div>
      </div>
    </div>
  );
};

const ObjectionLabel: React.FC<{ icon: React.ElementType; children: React.ReactNode }> = ({
  icon: Icon,
  children,
}) => (
  <span className="flex items-center gap-3">
    <Icon strokeWidth={1.5} className="h-5 w-5 flex-shrink-0 text-cyan-400/70" />
    <span>{children}</span>
  </span>
);

const GroupHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="mb-4 mt-14 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400 first:mt-0">
    {children}
  </h3>
);

/**
 * All FAQ content preserved; restyled as calm reference material —
 * deliberately lower visual weight than the sections above it.
 */
const FAQSection: React.FC = () => (
  <section id="faqs" className="bg-[#0f1c2e] px-4 py-24 sm:py-32">
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <h2 className="text-center font-heading text-3xl font-extrabold text-white sm:text-4xl">
          Frequently Asked Questions
        </h2>
      </Reveal>

      <div className="mt-14">
        <GroupHeading>For Travel Agents</GroupHeading>
        <FAQItem question="Is TravelIQ really free for travel agents?">
          <p>
            Yes, absolutely! Access to our entire network of AI Sales Support is completely free
            for registered travel agents. Our mission is to provide you with the best tools to
            help you sell more effectively.
          </p>
        </FAQItem>
        <FAQItem question="How accurate is the information provided by the AI?">
          <p>
            The information comes directly from the suppliers themselves. Each brand controls its
            own knowledge base through our Supplier Portal — official policies, fares, schedules,
            training materials, agent FAQs — and updates it in real-time as things change. The AI
            only answers from what the supplier has provided, so every response is verified,
            on-brand, and as current as the source material.
          </p>
        </FAQItem>
        <FAQItem question="Do I need to install any software?">
          <p>
            No software is required. TravelIQ is a web-based platform, accessible from any device
            with an internet browser and a microphone for voice commands. It's designed for ease
            of use and immediate access.
          </p>
        </FAQItem>

        <GroupHeading>For Suppliers</GroupHeading>
        <FAQItem question="How do we get our brand's AI Sales Assistant set up?">
          <p>
            TravelIQ handles setup and onboarding for you. Share your knowledge base — agent
            FAQs, product details, fares, schedules, training materials, even links to your trade
            portal — and we build and launch your AI Sales Assistant from it. The AI uses only
            what you provide, so every answer is on-brand and accurate. You stay in full control
            through your Supplier Portal dashboard, where you can update your content anytime.
          </p>
        </FAQItem>
        <FAQItem question="Can we update the information the AI provides?">
          <p>
            Yes — anytime. Log in to your supplier dashboard, edit the knowledge base, and save.
            Updates are live immediately, so when promotions, schedules, or policies change, your
            AI reflects them in real-time without any back-and-forth with us.
          </p>
        </FAQItem>
        <FAQItem question="What kind of analytics and lead data do we get?">
          <p>
            On the <strong className="text-white">Starter</strong> plan, you receive interaction
            counts — how many agents engaged with your profile. On{' '}
            <strong className="text-white">Growth and above</strong>, every agent becomes a named
            lead in your dashboard: name, email, agency, and the exact question they asked, plus
            email notifications so your team can follow up immediately.{' '}
            <strong className="text-white">Enterprise</strong> adds advanced analytics — trending
            queries, knowledge gaps, and engagement patterns — so you can continuously optimise
            your AI's performance.
          </p>
        </FAQItem>

        <GroupHeading>Common Supplier Objections &amp; Our Responses</GroupHeading>
        <FAQItem
          question={
            <ObjectionLabel icon={BarChart3}>
              Cost Objection: 'This sounds expensive, and we already have a support team.'
            </ObjectionLabel>
          }
        >
          <p>
            I understand cost is a priority. Think of TravelIQ not as an expense, but as a direct
            cost-saving and revenue-generating investment. While your human team manages complex
            or urgent issues, the AI handles 80% of repetitive, high-volume queries 24/7. This
            dramatically reduces your operational costs per interaction and frees your sales team
            to focus purely on high-value selling, guaranteeing a rapid ROI far exceeding the
            platform fee.
          </p>
        </FAQItem>
        <FAQItem
          question={
            <ObjectionLabel icon={Users}>
              Human Touch Objection: 'Travel is a personal business. Will this AI erode the human
              connection we have with our agents?'
            </ObjectionLabel>
          }
        >
          <p>
            Absolutely not. TravelIQ is designed to enhance, not replace, your human interaction.
            We eliminate the frustration agents feel waiting for basic information, meaning when
            they do connect with your human representative, the conversation is focused,
            productive, and based on relationship building—not just query answering. We handle
            the trivia so your team can handle the vital relationship management.
          </p>
        </FAQItem>
        <FAQItem
          question={
            <ObjectionLabel icon={ShieldCheck}>
              Data Security Objection: 'How do we know our proprietary data and our agents' data
              are secure on a new platform?'
            </ObjectionLabel>
          }
        >
          <p>
            Security and privacy are paramount. Your knowledge base is ring-fenced to your own
            dedicated AI instance — it's never shared with other suppliers and never used to
            train other models. You control exactly what's in there through your Supplier Portal
            dashboard, and you can update or remove information at any time. TravelIQ is strictly
            a sales and information support tool; we do not handle bookings or collect sensitive
            agent PII, and the platform is fully GDPR compliant.
          </p>
        </FAQItem>
        <FAQItem
          question={
            <ObjectionLabel icon={BadgeCheck}>
              Trust Objection: 'The platform is new. Why should we trust this technology or your
              company?'
            </ObjectionLabel>
          }
        >
          <p>
            We are addressing a clear gap in the market by being Europe's first to offer
            dedicated, AI-driven B2B travel support. Our model is built on transparency and
            supplier control: TravelIQ handles your setup and onboarding, your knowledge base
            stays yours, and you decide exactly what your AI shares — updating it at any time
            through your Supplier Portal, with no middleman. Joining now secures you a
            first-mover advantage and positions you as a
            forward-thinking, 24/7 reliable partner to the UK and European travel trade.
          </p>
        </FAQItem>
        <FAQItem
          question={
            <ObjectionLabel icon={Eye}>
              AI Accuracy Objection: 'We cannot risk the AI giving out incorrect
              information—that could damage our brand.'
            </ObjectionLabel>
          }
        >
          <p>
            That is a crucial point, and it's precisely why our model eliminates that risk.
            Unlike general AI chatbots, the TravelIQ Voice AI is a closed-loop system. It is only
            trained and fed from the verified knowledge base you provide. If the answer is not in
            your data, the AI is trained to simply state it cannot answer or direct the agent to
            a human contact, ensuring every piece of information it delivers is accurate,
            consistent, and directly controlled by your brand.
          </p>
        </FAQItem>
      </div>
    </div>
  </section>
);

export default FAQSection;
