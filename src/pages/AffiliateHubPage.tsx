import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import {
  AffiliateIcon,
  GrowthIcon,
  RecurringIcon,
  AttributionIcon,
  SparkleIcon,
  AIIcon,
  GlobalIcon,
} from '../components/icons/TravelIQIcons.tsx';
import {
  BookOpen,
  Download,
  Link2,
  Users,
  LifeBuoy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  ExternalLink,
  Mail,
  Linkedin,
  FileText,
  Video,
  Package,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface TrainingModule {
  id: number;
  title: string;
  duration: string;
  description: string;
  topics: string[];
  type: 'text' | 'video';
  videoUrl?: string;
  completed?: boolean;
}

interface MarketingAsset {
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'copy' | 'pack';
  downloadUrl?: string;
  previewContent?: string[];
}

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

/* ─── Constants ─────────────────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: AffiliateIcon },
  { id: 'training', label: 'Training', icon: BookOpen as React.FC<{ className?: string; strokeWidth?: number }> },
  { id: 'marketing', label: 'Marketing Materials', icon: Package as React.FC<{ className?: string; strokeWidth?: number }> },
  { id: 'links', label: 'My Links', icon: Link2 as React.FC<{ className?: string; strokeWidth?: number }> },
  { id: 'community', label: 'Community', icon: Users as React.FC<{ className?: string; strokeWidth?: number }> },
  { id: 'support', label: 'Support', icon: LifeBuoy as React.FC<{ className?: string; strokeWidth?: number }> },
];

const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 1,
    title: 'Module 1: Know the Product',
    duration: '20 min read',
    description:
      'Understand exactly what TravelIQ does, who it\'s for, and why travel suppliers need it. After this module you\'ll be able to explain TravelIQ clearly and confidently to any supplier contact.',
    type: 'text',
    topics: [
      'What is TravelIQ? The one-sentence explanation.',
      'The supplier problem: why agents leave enquiries unanswered',
      'The TravelIQ solution: AI Sales Assistant, 24/7',
      'How it works: setup, training, and going live',
      'What suppliers get: named leads, agent transcripts, zero missed queries',
      'The agent experience: how UK travel agents use TravelIQ',
      'Pricing overview: what suppliers pay and when',
    ],
  },
  {
    id: 2,
    title: 'Module 2: The Sales Approach',
    duration: '25 min read',
    description:
      'How to introduce TravelIQ to a supplier contact without it feeling like a sales pitch. This module covers conversation frameworks, timing your approach, and qualifying prospects quickly.',
    type: 'text',
    topics: [
      'Who to approach first: Tier 1 suppliers (tour operators, cruise lines)',
      'Finding the right contact: Head of Trade Sales vs. Marketing Director',
      'The warm introduction framework (4-sentence opener)',
      'Questions to ask before you mention TravelIQ',
      'When to introduce TravelIQ in the conversation',
      'Registering an introduction on your affiliate dashboard',
      'What happens after you register (TravelIQ takes over)',
    ],
  },
  {
    id: 3,
    title: 'Module 3: Handling Objections',
    duration: '20 min read',
    description:
      'The most common questions and concerns you\'ll hear from suppliers — and exactly what to say in response. Includes word-for-word scripts.',
    type: 'text',
    topics: [
      '"We already have a chatbot." — Why TravelIQ is different',
      '"Agents prefer speaking to a human." — The 24/7 reality',
      '"We don\'t have the budget right now." — ROI framing',
      '"Our agents know our products." — The complexity argument',
      '"I need to involve our IT team." — The no-IT-needed answer',
      '"We\'re not sure about AI for travel." — Building confidence',
      'When to stop and let TravelIQ\'s team handle it',
    ],
  },
  {
    id: 4,
    title: 'Module 4: LinkedIn & Content Strategy',
    duration: '15 min read',
    description:
      'How to use your LinkedIn presence and content to generate inbound interest from suppliers — without spamming your network.',
    type: 'text',
    topics: [
      'Your LinkedIn profile: positioning yourself as a travel tech advocate',
      'What to post and what not to post about TravelIQ',
      'Using the ready-made post templates in Marketing Materials',
      'Responding to comments and DMs from interested suppliers',
      'Tracking affiliate leads from social content',
    ],
  },
];

const MARKETING_ASSETS: MarketingAsset[] = [
  {
    title: 'Affiliate Pitch Deck',
    description:
      'A co-branded slide deck you can share with supplier contacts. Covers what TravelIQ does, why they need it, and how to get started. Customisable with your own name/logo.',
    type: 'pdf',
    downloadUrl: '#',
  },
  {
    title: 'One-Page Product Brief',
    description:
      'A clean one-pager showing TravelIQ\'s value proposition, key features, and pricing tiers. Ideal to send after an initial conversation.',
    type: 'pdf',
    downloadUrl: '#',
  },
  {
    title: 'Email Swipe Files',
    description:
      'Ready-to-use email templates: cold outreach, warm follow-up, post-meeting, and objection responses. Copy and personalise — do not send verbatim.',
    type: 'copy',
    previewContent: [
      'Cold outreach — Subject: "An idea for your agent channel"',
      'Warm follow-up — Subject: "Circling back on the TravelIQ question"',
      'Post-webinar — Subject: "Following up from today\'s session"',
      'Objection response — "Addressing the chatbot concern"',
    ],
    downloadUrl: '#',
  },
  {
    title: 'LinkedIn Post Templates',
    description:
      '10 ready-to-publish LinkedIn posts about TravelIQ. Use them as-is or adapt for your voice. Each targets a different angle: AI in travel, agent experience, supplier efficiency.',
    type: 'copy',
    previewContent: [
      'Post 1: "The question travel agents ask most..."',
      'Post 2: "What happens when your account manager is in a meeting..."',
      'Post 3: "I\'ve been recommending TravelIQ to suppliers because..."',
      'Post 4: "24/7 agent support without hiring a 24/7 team..."',
    ],
    downloadUrl: '#',
  },
  {
    title: 'Brand Asset Pack',
    description:
      'TravelIQ logos, colour codes, and approved imagery for use in your own content. Includes light/dark versions and social media sizes.',
    type: 'pack',
    downloadUrl: '#',
  },
  {
    title: 'Programme Terms PDF',
    description:
      'The full terms of the TravelIQ Affiliate Programme — what you can say, what commission is paid and when, the attribution policy, and what TravelIQ handles.',
    type: 'pdf',
    downloadUrl: '#',
  },
];

const ONBOARDING_STEPS = [
  { label: 'Complete Module 1: Know the Product', completed: false },
  { label: 'Complete Module 2: The Sales Approach', completed: false },
  { label: 'Complete Module 3: Handling Objections', completed: false },
  { label: 'Download the Email Swipe Files', completed: false },
  { label: 'Download the Affiliate Pitch Deck', completed: false },
  { label: 'Book your onboarding call with the TravelIQ team', completed: false },
  { label: 'Copy your affiliate tracking link', completed: false },
  { label: 'Make your first introduction', completed: false },
];

const EMAIL_SWIPE_FILES = [
  {
    label: 'Cold Outreach — "An idea for your agent channel"',
    subject: 'An idea for your agent channel',
    body: `Hi [First Name],

I hope you're well. I've been following [Company] for a while — impressive work on the trade side.

Quick thought: I've recently started working with a platform called TravelIQ that gives travel suppliers a 24/7 AI Sales Assistant for their agent channel. UK and European agents can ask it product, pricing, and policy questions instantly — no waiting for an account manager to call back.

Given the volume of agent enquiries your team handles, I thought it might be worth a quick look. Happy to send over a one-pager or jump on a short call — no pitch, just a conversation.

Would that be useful?

Best,
[Your Name]`,
  },
  {
    label: 'Warm Follow-Up — "Circling back"',
    subject: 'Circling back on TravelIQ',
    body: `Hi [First Name],

Just circling back on my earlier note about TravelIQ — the AI Sales Assistant for travel suppliers.

I know inboxes get busy. If it's not the right time, no worries at all. But if you're curious about how it works, I've attached a quick one-pager that explains it clearly.

The short version: agents get instant answers 24/7, suppliers get named lead data from every conversation. Setup takes a few days and needs no IT involvement.

Happy to set up a quick call if you'd like TravelIQ's team to walk you through it.

Best,
[Your Name]`,
  },
  {
    label: 'Post-Webinar — "Following up from today"',
    subject: 'Following up from today\'s session',
    body: `Hi [First Name],

Great to see you at the TravelIQ webinar today. I thought the Q&A was particularly useful.

As promised, here's the link to the recording: [WEBINAR LINK]

And here's my affiliate link if you'd like to explore further or speak to the TravelIQ team: [YOUR AFFILIATE LINK]

Let me know if you have any questions — happy to help.

Best,
[Your Name]`,
  },
  {
    label: 'Objection Response — "You mentioned a chatbot"',
    subject: 'Following up — the chatbot question',
    body: `Hi [First Name],

Thanks for raising that point when we spoke. You mentioned you already have a chatbot — I wanted to share a quick thought.

The main difference is that TravelIQ is specifically trained on your product knowledge — itineraries, pricing, agent commissions, booking conditions — rather than generic FAQ responses. It answers the detailed questions agents actually ask, in natural language, and sends you a transcript of every conversation with the agent's name and contact details.

Most suppliers we speak to see it as complementary to what they have — or as a replacement for an outdated chatbot that's causing more confusion than it solves.

Worth a 15-minute call with the TravelIQ team to see if there's a fit? I can make an introduction.

Best,
[Your Name]`,
  },
];

const LINKEDIN_TEMPLATES = [
  {
    label: 'The 24/7 question',
    body: `What happens when a travel agent has a product question at 9pm on a Friday?

If you're a tour operator, the answer is usually: they don't get an answer until Monday morning. And sometimes, they've already booked with a competitor.

TravelIQ gives suppliers a 24/7 AI Sales Assistant — trained on their products, available around the clock to UK and European travel agents. Every conversation comes back as a named lead.

If you supply the UK and European travel trade and want to know more, I'm happy to make an introduction.

[YOUR AFFILIATE LINK]`,
  },
  {
    label: 'Why I recommend TravelIQ',
    body: `I've spent [X] years in the travel industry, and the number one complaint I hear from account managers is always the same: "We're drowning in agent queries and never have time to get to them all."

TravelIQ solves that. Their AI Sales Assistant sits alongside your team — answering product, pricing, and policy questions for agents 24/7.

No more missed enquiries. No more out-of-office messages. No more agents booking a competitor because they couldn't get a quick answer.

I'm now working as an affiliate partner and am happy to introduce any travel supplier to the platform. Drop me a message or click the link below.

[YOUR AFFILIATE LINK]`,
  },
];

/* ─── Sub-components ─────────────────────────────────────────────────── */
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-bold font-heading text-white mb-6">{children}</h2>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

/* ─── Dashboard Section ──────────────────────────────────────────────── */
const DashboardSection: React.FC = () => {
  const [checklist, setChecklist] = useState(ONBOARDING_STEPS);

  const toggle = (i: number) => {
    setChecklist(prev => prev.map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s));
  };

  const done = checklist.filter(s => s.completed).length;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-xl p-6 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-400/20">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome to the Affiliate Hub</h2>
        <p className="text-gray-300">
          Everything you need to introduce TravelIQ to travel suppliers — training, materials, tracking, and support.
          Start with the onboarding checklist below.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Introductions Registered', value: '0', icon: AffiliateIcon, color: 'text-cyan-400' },
          { label: 'Active Suppliers', value: '0', icon: RecurringIcon, color: 'text-teal-400' },
          { label: 'Commission Earned', value: '£0', icon: GrowthIcon, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#0a1628]/60">
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Onboarding checklist */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Onboarding Checklist</h3>
          <span className="text-sm text-cyan-400 font-semibold">{done}/{checklist.length} complete</span>
        </div>
        <div className="w-full bg-[#0a1628]/60 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(done / checklist.length) * 100}%` }}
          />
        </div>
        <div className="space-y-3">
          {checklist.map((step, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="flex items-center gap-3 w-full text-left group"
            >
              {step.completed
                ? <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" strokeWidth={1.5} />
                : <Circle className="w-5 h-5 text-gray-600 shrink-0 group-hover:text-gray-400 transition-colors" strokeWidth={1.5} />}
              <span className={`text-sm ${step.completed ? 'line-through text-gray-500' : 'text-gray-300 group-hover:text-white transition-colors'}`}>
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Commission tiers */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">Your Commission Tiers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { tier: 'Standard', rate: '10%', unlock: 'From day one', color: 'text-gray-300', bg: 'bg-gray-700/30' },
            { tier: 'Growth', rate: '15%', unlock: 'After 3 paying suppliers', color: 'text-cyan-300', bg: 'bg-cyan-900/30' },
            { tier: 'Strategic Partner', rate: '20%', unlock: '£15,000+ annual revenue', color: 'text-blue-300', bg: 'bg-blue-900/30' },
          ].map(({ tier, rate, unlock, color, bg }) => (
            <div key={tier} className={`${bg} rounded-lg p-4 border border-cyan-400/10`}>
              <p className={`text-2xl font-extrabold ${color}`}>{rate}</p>
              <p className="text-sm font-semibold text-white">{tier}</p>
              <p className="text-xs text-gray-400 mt-1">{unlock}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Commission is recurring — paid annually for as long as each supplier is an active TravelIQ client. Lifetime attribution applies.
        </p>
      </Card>
    </div>
  );
};

/* ─── Training Section ───────────────────────────────────────────────── */
const TrainingSection: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggle = (id: number) => setExpanded(prev => prev === id ? null : id);
  const markComplete = (id: number) => setCompleted(prev => { const n = new Set(prev); n.add(id); return n; });

  return (
    <div className="space-y-6">
      <SectionTitle>Training Library</SectionTitle>
      <p className="text-gray-300 -mt-4 mb-6">
        Complete Modules 1–3 before making your first introduction. Module 4 is optional but recommended if you plan to use LinkedIn to generate leads.
      </p>

      <div className="space-y-4">
        {TRAINING_MODULES.map(mod => (
          <Card key={mod.id} className="!p-0 overflow-hidden">
            <button
              onClick={() => toggle(mod.id)}
              className="flex items-center justify-between w-full p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${completed.has(mod.id) ? 'bg-cyan-400/20 text-cyan-400' : 'bg-[#0a1628]/60 text-gray-400'}`}>
                  {completed.has(mod.id) ? <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} /> : mod.id}
                </div>
                <div>
                  <p className="text-white font-semibold">{mod.title}</p>
                  <p className="text-xs text-gray-400">{mod.duration}</p>
                </div>
              </div>
              {expanded === mod.id
                ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />}
            </button>

            {expanded === mod.id && (
              <div className="px-6 pb-6 space-y-4 border-t border-cyan-400/10 pt-4">
                <p className="text-gray-300 text-sm">{mod.description}</p>
                <ul className="space-y-2">
                  {mod.topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-cyan-400 shrink-0">→</span>
                      {topic}
                    </li>
                  ))}
                </ul>
                {mod.videoUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-[#0a1628]/60 flex items-center justify-center border border-cyan-400/10">
                    <iframe src={mod.videoUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={mod.title} />
                  </div>
                )}
                {!completed.has(mod.id) && (
                  <button
                    onClick={() => markComplete(mod.id)}
                    className="mt-2 px-5 py-2 text-sm font-semibold rounded-lg bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors"
                  >
                    Mark as complete
                  </button>
                )}
                {completed.has(mod.id) && (
                  <p className="text-cyan-400 text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> Module complete
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ─── Marketing Materials Section ────────────────────────────────────── */
const MarketingSection: React.FC = () => {
  const [swipeOpen, setSwipeOpen] = useState<number | null>(null);
  const [linkedinOpen, setLinkedinOpen] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const typeIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />;
    if (type === 'video') return <Video className="w-5 h-5 text-blue-400" strokeWidth={1.5} />;
    if (type === 'pack') return <Package className="w-5 h-5 text-teal-400" strokeWidth={1.5} />;
    return <Mail className="w-5 h-5 text-amber-400" strokeWidth={1.5} />;
  };

  return (
    <div className="space-y-8">
      <SectionTitle>Marketing Materials</SectionTitle>

      {/* Asset cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MARKETING_ASSETS.map(asset => (
          <Card key={asset.title}>
            <div className="flex items-start gap-3 mb-3">
              <div className="mt-0.5">{typeIcon(asset.type)}</div>
              <div>
                <p className="font-semibold text-white">{asset.title}</p>
                <p className="text-sm text-gray-400 mt-1">{asset.description}</p>
              </div>
            </div>
            {asset.previewContent && (
              <ul className="space-y-1 mb-3 ml-8">
                {asset.previewContent.map((item, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                    <span className="text-cyan-400 shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {asset.downloadUrl && (
              <a
                href={asset.downloadUrl}
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors ml-8"
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
                Download
              </a>
            )}
          </Card>
        ))}
      </div>

      {/* Email swipe files — expanded view */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Email Swipe Files</h3>
        <p className="text-sm text-gray-400 mb-4">Click any template to expand, read, and copy. Personalise before sending — do not copy verbatim.</p>
        <div className="space-y-3">
          {EMAIL_SWIPE_FILES.map((file, i) => (
            <Card key={i} className="!p-0 overflow-hidden">
              <button
                onClick={() => setSwipeOpen(prev => prev === i ? null : i)}
                className="flex items-center justify-between w-full p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-sm text-gray-200">{file.label}</span>
                </div>
                {swipeOpen === i
                  ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                  : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />}
              </button>
              {swipeOpen === i && (
                <div className="px-4 pb-4 border-t border-cyan-400/10 pt-3">
                  <p className="text-xs text-gray-500 mb-1">Subject: <span className="text-gray-300">{file.subject}</span></p>
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans bg-[#0a1628]/60 rounded-lg p-4 mt-2 border border-cyan-400/10">
                    {file.body}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(file.body, `email-${i}`)}
                    className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors"
                  >
                    {copied === `email-${i}` ? 'Copied!' : 'Copy to clipboard'}
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* LinkedIn templates */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1">LinkedIn Post Templates</h3>
        <p className="text-sm text-gray-400 mb-4">Ready to publish on LinkedIn. Add your own name and affiliate link where indicated.</p>
        <div className="space-y-3">
          {LINKEDIN_TEMPLATES.map((post, i) => (
            <Card key={i} className="!p-0 overflow-hidden">
              <button
                onClick={() => setLinkedinOpen(prev => prev === i ? null : i)}
                className="flex items-center justify-between w-full p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Linkedin className="w-4 h-4 text-blue-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-sm text-gray-200">{post.label}</span>
                </div>
                {linkedinOpen === i
                  ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                  : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />}
              </button>
              {linkedinOpen === i && (
                <div className="px-4 pb-4 border-t border-cyan-400/10 pt-3">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans bg-[#0a1628]/60 rounded-lg p-4 border border-cyan-400/10">
                    {post.body}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(post.body, `linkedin-${i}`)}
                    className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors"
                  >
                    {copied === `linkedin-${i}` ? 'Copied!' : 'Copy to clipboard'}
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── My Links Section ───────────────────────────────────────────────── */
interface IntroductionRow {
  id: string;
  supplier_company: string;
  contact_name: string;
  contact_email: string;
  supplier_type: string;
  status: string;
  subscription_type: string | null;
  registered_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  registered:      { label: 'Registered',      color: 'text-gray-400' },
  contacted:       { label: 'Contacted',        color: 'text-blue-400' },
  demo_scheduled:  { label: 'Demo Scheduled',   color: 'text-cyan-400' },
  demo_done:       { label: 'Demo Done',        color: 'text-teal-400' },
  proposal_sent:   { label: 'Proposal Sent',    color: 'text-amber-400' },
  signed:          { label: 'Signed ✓',         color: 'text-green-400' },
  lost:            { label: 'Lost',             color: 'text-red-400' },
  duplicate:       { label: 'Duplicate',        color: 'text-gray-500' },
};

interface LinksSectionProps { affiliateId: string | null; trackingCode: string | null; }

const LinksSection: React.FC<LinksSectionProps> = ({ affiliateId, trackingCode }) => {
  const [copied, setCopied] = useState(false);
  const [introductions, setIntroductions] = useState<IntroductionRow[]>([]);
  const [loadingIntros, setLoadingIntros] = useState(true);

  // Introduction form state
  const [form, setForm] = useState({
    supplier_company: '', contact_name: '', contact_email: '',
    supplier_type: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const affiliateLink = trackingCode
    ? `https://traveliq.io/ref/${trackingCode}`
    : 'https://traveliq.io/ref/PENDING';

  const copy = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load introductions
  useEffect(() => {
    if (!affiliateId) { setLoadingIntros(false); return; }
    (async () => {
      const { data } = await supabase
        .from('affiliate_introductions')
        .select('id,supplier_company,contact_name,contact_email,supplier_type,status,subscription_type,registered_at')
        .eq('affiliate_id', affiliateId)
        .order('registered_at', { ascending: false });
      setIntroductions(data ?? []);
      setLoadingIntros(false);
    })();
  }, [affiliateId, submitSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateId) return;
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from('affiliate_introductions').insert({
      affiliate_id: affiliateId,
      ...form,
    });
    setSubmitting(false);
    if (error) { setSubmitError(error.message); return; }
    setSubmitSuccess(s => !s); // toggle to re-trigger useEffect
    setForm({ supplier_company: '', contact_name: '', contact_email: '', supplier_type: '', notes: '' });
  };

  const inputClass = 'mt-1 w-full px-3 py-2 text-sm text-white bg-[#0a1628]/80 border border-cyan-400/20 rounded-lg focus:ring-1 focus:ring-cyan-400 outline-none placeholder-gray-600';

  return (
    <div className="space-y-6">
      <SectionTitle>My Links & Introductions</SectionTitle>

      {/* Tracking link */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-2">Your Affiliate Tracking Link</h3>
        <p className="text-sm text-gray-400 mb-4">
          Use this in emails, LinkedIn posts, and conversations. Any supplier who signs up through your link is permanently attributed to you — even if they sign months later.
        </p>
        <div className="flex items-center gap-3 bg-[#0a1628]/60 border border-cyan-400/20 rounded-lg px-4 py-3">
          <code className="text-cyan-300 text-sm flex-1 truncate">{affiliateLink}</code>
          <button onClick={copy} className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 transition-colors border border-cyan-400/20">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {!trackingCode && (
          <p className="text-xs text-amber-400 mt-2">Your tracking code is being set up — it will appear here once your onboarding is complete.</p>
        )}
      </Card>

      {/* Introduction tracker */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">Introduction Tracker</h3>
        {loadingIntros ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : introductions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <AffiliateIcon className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            <p className="text-sm">No introductions registered yet.</p>
            <p className="text-xs mt-1 text-gray-600">Use the form below to register your first introduction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-cyan-400/10">
                  <th className="text-left pb-2 font-medium">Supplier</th>
                  <th className="text-left pb-2 font-medium">Contact</th>
                  <th className="text-left pb-2 font-medium">Type</th>
                  <th className="text-left pb-2 font-medium">Status</th>
                  <th className="text-left pb-2 font-medium">Sub</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-400/5">
                {introductions.map(intro => (
                  <tr key={intro.id}>
                    <td className="py-2.5 pr-4 text-white font-medium">{intro.supplier_company}</td>
                    <td className="py-2.5 pr-4 text-gray-400">{intro.contact_name}</td>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">{intro.supplier_type}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-xs font-semibold ${STATUS_LABELS[intro.status]?.color ?? 'text-gray-400'}`}>
                        {STATUS_LABELS[intro.status]?.label ?? intro.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-gray-500">
                      {intro.subscription_type === 'annual'
                        ? <span className="text-cyan-400 font-semibold">Annual</span>
                        : intro.subscription_type === 'monthly'
                        ? <span className="text-amber-400">Monthly</span>
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Register introduction */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-2">Register an Introduction</h3>
        <p className="text-sm text-gray-400 mb-4">
          Register a supplier introduction <em>before</em> you make it — this locks in your attribution regardless of when they sign.
        </p>
        {submitSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-sm">
            Introduction registered. The TravelIQ team will follow up with the supplier directly.
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-400">Supplier Company Name</label>
              <input type="text" required value={form.supplier_company}
                onChange={e => setForm(p => ({ ...p, supplier_company: e.target.value }))}
                className={inputClass} placeholder="e.g. Exodus Travels" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">Contact Name</label>
              <input type="text" required value={form.contact_name}
                onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                className={inputClass} placeholder="e.g. Sarah Johnson" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">Contact Email</label>
              <input type="email" required value={form.contact_email}
                onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))}
                className={inputClass} placeholder="sarah@supplier.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">Supplier Type</label>
              <select required value={form.supplier_type}
                onChange={e => setForm(p => ({ ...p, supplier_type: e.target.value }))}
                className={inputClass}>
                <option value="">Select type…</option>
                <option>Tour Operator / DMC</option>
                <option>Cruise Line</option>
                <option>Airline</option>
                <option>Hotel / Resort</option>
                <option>Travel Insurance</option>
                <option>Safari / Adventure Operator</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400">Notes (optional)</label>
            <textarea rows={2} value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className={inputClass} placeholder="How you know them, any context that helps the TravelIQ team…" />
          </div>
          {submitError && <p className="text-red-400 text-xs">{submitError}</p>}
          <button type="submit" disabled={submitting || !affiliateId}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50">
            {submitting ? 'Registering…' : 'Register Introduction'}
          </button>
        </form>
      </Card>
    </div>
  );
};

/* ─── Community Section ──────────────────────────────────────────────── */
const CommunitySection: React.FC = () => (
  <div className="space-y-6">
    <SectionTitle>Community & Events</SectionTitle>
    <Card>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#0a1628]/60 rounded-lg shrink-0">
          <GlobalIcon className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-bold text-white mb-1">Affiliate Slack Community</h3>
          <p className="text-sm text-gray-400 mb-3">
            Connect with other TravelIQ affiliates, share wins, ask questions, and get early access to new materials. Invitations are sent on acceptance into the programme.
          </p>
          <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} /> Join Slack Channel
          </a>
        </div>
      </div>
    </Card>
    <Card>
      <h3 className="font-bold text-white mb-3">Upcoming Events</h3>
      <div className="space-y-3">
        {[
          { date: 'June 2026', event: 'Monthly Affiliate Webinar — Product Updates & Q&A', type: 'Online' },
          { date: 'July 2026', event: 'BTE London — TravelIQ Affiliate Meetup', type: 'In-person' },
          { date: 'Q4 2026', event: 'TravelIQ Annual Affiliate Summit (Strategic Partners)', type: 'In-person' },
        ].map(({ date, event, type }) => (
          <div key={event} className="flex items-start gap-3 py-3 border-b border-cyan-400/10 last:border-0">
            <div className="text-xs text-cyan-400 font-semibold w-20 shrink-0 pt-0.5">{date}</div>
            <div>
              <p className="text-sm text-white">{event}</p>
              <p className="text-xs text-gray-500 mt-0.5">{type}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

/* ─── Support Section ────────────────────────────────────────────────── */
const SupportSection: React.FC = () => (
  <div className="space-y-6">
    <SectionTitle>Support</SectionTitle>
    <Card>
      <h3 className="font-bold text-white mb-3">Contact the Affiliate Team</h3>
      <p className="text-sm text-gray-400 mb-4">
        For commission queries, introduction status updates, or anything else — the TravelIQ affiliate team typically responds within one business day.
      </p>
      <a
        href="mailto:hello@traveliq.io"
        className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <Mail className="w-4 h-4" strokeWidth={1.5} /> hello@traveliq.io
      </a>
    </Card>

    <Card>
      <h3 className="font-bold text-white mb-4">Affiliate FAQ</h3>
      <div className="space-y-4">
        {[
          {
            q: 'When do I get paid?',
            a: 'Commission is paid quarterly, within 30 days of the quarter end. You\'ll receive a statement by email showing each active supplier and the commission amount.',
          },
          {
            q: 'How long does my attribution last?',
            a: 'Lifetime. If you register a supplier introduction today and they sign up in 18 months, the commission is yours. There is no expiry on attribution.',
          },
          {
            q: 'What if a supplier I introduced already knows TravelIQ?',
            a: 'Attribution is first-registered. If you register the introduction before TravelIQ has a record of approaching them, you own it. If they\'re already in our system, we\'ll let you know.',
          },
          {
            q: 'Can I introduce multiple contacts at the same company?',
            a: 'Yes. Register each introduction separately. Commission is attributed to the introduction that leads to the signing — usually the decision-maker.',
          },
          {
            q: 'What can I say publicly about TravelIQ?',
            a: 'You can describe TravelIQ in your own words, share the approved marketing materials, and include your affiliate link. Please don\'t make performance guarantees or pricing claims beyond what\'s in the programme materials. Full guidance is in the Programme Terms PDF.',
          },
        ].map(({ q, a }, i) => (
          <div key={i} className="border-b border-cyan-400/10 pb-4 last:border-0 last:pb-0">
            <p className="text-sm font-semibold text-white mb-1">{q}</p>
            <p className="text-sm text-gray-400">{a}</p>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <h3 className="font-bold text-white mb-2">Programme Terms</h3>
      <p className="text-sm text-gray-400 mb-3">
        The full terms of the TravelIQ Affiliate Programme — commission structure, attribution policy, conduct guidelines, and termination terms.
      </p>
      <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
        <Download className="w-4 h-4" strokeWidth={1.5} /> Download Programme Terms (PDF)
      </a>
    </Card>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────── */
interface AffiliateProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  tracking_code: string;
  tier: string;
  commission_rate: number;
  status: string;
}

const AffiliateHubPage: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) { navigate('/affiliate-hub/login'); }
  }, [user, navigate]);

  // Load affiliate profile for the logged-in user
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('affiliate_profiles')
        .select('id,first_name,last_name,email,tracking_code,tier,commission_rate,status')
        .eq('user_id', user.id)
        .single();
      setProfile(data ?? null);
      setProfileLoading(false);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/affiliate-hub/login');
  };

  const sections: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    training: <TrainingSection />,
    marketing: <MarketingSection />,
    links: <LinksSection affiliateId={profile?.id ?? null} trackingCode={profile?.tracking_code ?? null} />,
    community: <CommunitySection />,
    support: <SupportSection />,
  };

  if (!user) return null;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your hub…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AffiliateIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-bold text-white mb-2">Hub access pending</h2>
          <p className="text-gray-400 text-sm mb-4">
            Your affiliate profile hasn't been activated yet. If you've been accepted into the programme, please allow up to one business day or contact us.
          </p>
          <a href="mailto:hello@traveliq.io" className="text-cyan-400 text-sm hover:underline">hello@traveliq.io</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <div className="flex flex-col lg:flex-row">
        {/* ─── Sidebar (desktop) ── */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-[#0a1628] border-r border-cyan-400/10 p-6 gap-2 sticky top-0">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Affiliate Hub</p>
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="text-sm text-white font-semibold truncate">{user?.email ?? 'Partner'}</p>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-cyan-400/10">
            <Link
              to="/affiliate-program"
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2"
            >
              <ExternalLink className="w-3 h-3" strokeWidth={1.5} /> Public programme page
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* ─── Mobile top bar ── */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#0a1628] border-b border-cyan-400/10 px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-bold text-white">Affiliate Hub</p>
          <button
            onClick={() => setMobileNavOpen(prev => !prev)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {mobileNavOpen
              ? <ChevronUp className="w-5 h-5" strokeWidth={1.5} />
              : <ChevronDown className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </div>

        {/* ─── Mobile nav drawer ── */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-[#0a1628] border-b border-cyan-400/10 px-4 pb-4">
            <nav className="space-y-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveSection(id); setMobileNavOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === id
                      ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* ─── Main content ── */}
        <main className="flex-1 p-6 lg:p-10 max-w-4xl">
          {sections[activeSection]}
        </main>
      </div>
    </div>
  );
};

export default AffiliateHubPage;
