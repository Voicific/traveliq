import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.ts';
import {
  TierIcon,
  FeatureIcon,
  GlobalIcon,
  AIIcon,
  AffiliateIcon,
  RecurringIcon,
  AttributionIcon,
  GrowthIcon,
  SparkleIcon,
} from '../components/icons/TravelIQIcons.tsx';

interface AffiliateFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  role: string;
  company: string;
  linkedin: string;
  experience: string;
  supplierTypes: string[];
  networkSize: string;
  methods: string[];
  notes: string;
  termsAccepted: boolean;
}

const inputClass = "mt-1 w-full px-4 py-3 text-white bg-[#0a1628]/80 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all placeholder-gray-500";
const selectClass = "mt-1 w-full px-4 py-3 text-white bg-[#0a1628]/80 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all";
const labelClass = "block text-sm font-medium text-gray-300";

const TIERS = [
  {
    tag: 'Standard',
    tagColor: 'bg-gray-700/60 text-gray-300',
    rate: '10%',
    subtitle: 'From day one',
    perks: [
      'Personal tracking link & referral materials',
      'TravelIQ team handles all demos & contracts',
      'Recurring commission while supplier is active',
      'Dedicated affiliate support',
      'Co-branded pitch materials',
    ],
    unlock: 'Available from day one',
    featured: false,
  },
  {
    tag: 'Growth',
    tagColor: 'bg-cyan-400/20 text-cyan-300',
    rate: '15%',
    subtitle: 'After 3 paying customers',
    perks: [
      'Everything in Standard',
      'Priority support from TravelIQ team',
      'Personalised co-branded pitch deck',
      'Featured on TravelIQ website',
      'Quarterly strategy review call',
    ],
    unlock: 'Unlocked after 3 paying suppliers',
    featured: true,
  },
  {
    tag: 'Strategic Partner',
    tagColor: 'bg-blue-400/20 text-blue-300',
    rate: '20%',
    subtitle: 'At £15,000+ annual revenue',
    perks: [
      'Everything in Growth',
      'Annual TravelIQ Affiliate Summit invitation',
      'Co-marketing opportunities',
      'Negotiated custom programme terms',
      'Named on TravelIQ partner page',
    ],
    unlock: 'Unlocked when annual revenue exceeds £15,000',
    featured: false,
  },
];

/**
 * PROFILES — sector cards in the "Who to target" section.
 * iconName maps to the TierIcon component from TravelIQIcons.
 * bg is the tile background (kept from original design).
 * iconColor is the lucide stroke colour for each sector.
 */
const PROFILES = [
  {
    iconName: 'tour-operator' as const,
    iconColor: 'text-teal-300',
    bg: 'bg-teal-900/40',
    title: 'Tour Operators & DMCs',
    desc: 'Complex products, many agent questions, smaller sales teams. Decision-maker is usually Head of Trade Sales.',
    tier: 'Tier 1 — Start Here',
    tierClass: 'bg-teal-900/50 text-teal-300',
  },
  {
    iconName: 'cruise' as const,
    iconColor: 'text-teal-300',
    bg: 'bg-teal-900/40',
    title: 'Cruise Lines',
    desc: 'High agent dependency, complex cabin pricing. Account managers are overwhelmed with repeat queries from agencies.',
    tier: 'Tier 1 — Start Here',
    tierClass: 'bg-teal-900/50 text-teal-300',
  },
  {
    iconName: 'airline' as const,
    iconColor: 'text-amber-300',
    bg: 'bg-amber-900/40',
    title: 'Airlines',
    desc: 'Massive agent channel. Commission queries, group pricing, and booking conditions are constant pain points.',
    tier: 'Tier 2 — With Proof',
    tierClass: 'bg-amber-900/50 text-amber-300',
  },
  {
    iconName: 'hotel' as const,
    iconColor: 'text-amber-300',
    bg: 'bg-amber-900/40',
    title: 'Hotels & Resorts',
    desc: 'Independent hotels and boutique groups with agency programmes — ideal for AI to handle rate and availability queries.',
    tier: 'Tier 2 — With Proof',
    tierClass: 'bg-amber-900/50 text-amber-300',
  },
  {
    iconName: 'insurance' as const,
    iconColor: 'text-blue-300',
    bg: 'bg-blue-900/40',
    title: 'Travel Insurance Providers',
    desc: 'Highly complex policy questions that agents struggle to explain to clients. A natural fit for AI-powered answers.',
    tier: 'Tier 3 — Strong Fit',
    tierClass: 'bg-blue-900/50 text-blue-300',
  },
  {
    iconName: 'adventure' as const,
    iconColor: 'text-blue-300',
    bg: 'bg-blue-900/40',
    title: 'Safari & Adventure Operators',
    desc: 'Premium, detail-heavy products. Agents need deep knowledge fast. These suppliers have loyal agent communities.',
    tier: 'Tier 3 — Strong Fit',
    tierClass: 'bg-blue-900/50 text-blue-300',
  },
];

/**
 * INCOME_FEATURES — the three recurring-income selling points.
 * iconName maps to TierIcon; replaces the original emoji field.
 */
const INCOME_FEATURES = [
  {
    iconName: 'recurring' as const,
    label: 'Renews every year',
    desc: 'As long as the supplier is active, you keep earning — no extra work required.',
  },
  {
    iconName: 'attribution' as const,
    label: 'Lifetime attribution',
    desc: 'Register an introduction once. If they sign now or in 12 months, the commission is yours.',
  },
  {
    iconName: 'growth' as const,
    label: 'Rate grows to 20%',
    desc: 'Hit milestones and your commission rate rises automatically — no renegotiation needed.',
  },
];

const FAQS = [
  {
    q: 'Do I need to be based in the UK or Europe to be an affiliate?',
    a: "Not at all. The programme is open to affiliates worldwide. What matters is that the suppliers you introduce serve — or want to serve — the UK and European travel agent market. If you know a tour operator in Southeast Asia, a cruise line in the US, or a safari lodge in Africa that wants to grow bookings through European agents, that introduction is exactly what we're looking for.",
  },
  {
    q: 'What does TravelIQ actually do for the suppliers I introduce?',
    a: "TravelIQ gives each supplier a dedicated AI Sales Assistant — a voice and chat agent that UK and European travel agents can interact with 24/7. Agents get instant answers on products, pricing, commissions, and policies in their own language. The supplier receives named leads (agent name, email, agency, question asked) and never misses an enquiry due to out-of-office or time zones.",
  },
  {
    q: 'Why would a travel agent use TravelIQ?',
    a: "Travel agents often need quick answers about supplier products — fare rules, group rates, commission structures, visa requirements — and getting those answers currently means waiting on hold, sending emails, or hoping an account manager responds. TravelIQ gives agents an instant, knowledgeable resource available any time of day, in multiple languages. Agents love it because it saves them hours every week.",
  },
  {
    q: 'Do I need to be a sales professional to be an affiliate?',
    a: "Not at all. Your value is your trusted relationships in the travel industry. You make the introduction; the TravelIQ team handles every step of the sales process from demo to contract. Many of our best affiliates are consultants, former account managers, or agency principals who simply recommend TravelIQ to people they already know and trust.",
  },
  {
    q: 'When and how do I get paid?',
    a: "Commission is paid within 30 days of TravelIQ receiving payment from the supplier you introduced. Payments are made via bank transfer. You'll receive a monthly commission statement showing all pending and paid amounts.",
  },
  {
    q: 'How long is the attribution window?',
    a: "Once you introduce a supplier — whether by email introduction, your tracking link, or a verbal referral registered with the TravelIQ team — that supplier is attributed to you for the lifetime of their account. There is no expiry on your attribution as long as the supplier remains on the platform.",
  },
  {
    q: "What if a supplier I introduce doesn't convert straight away?",
    a: "That's completely normal in B2B sales. As long as you register the introduction with TravelIQ, your attribution is locked in. If that supplier signs any time in the future, your commission applies. There's no deadline — we honour every valid introduction.",
  },
  {
    q: 'Is there a cost to join the affiliate programme?',
    a: "No. Joining the TravelIQ Affiliate Programme is completely free. There are no upfront fees, no monthly charges, and no minimum targets. We simply pay you a commission when a supplier you introduce becomes a paying TravelIQ customer.",
  },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-cyan-400/10 last:border-b-0">
      <button
        className="w-full flex items-center justify-between gap-4 py-5 px-6 text-left font-medium text-white hover:text-cyan-400 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <span>{q}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border border-cyan-400/30 flex items-center justify-center text-cyan-400 text-lg font-light transition-transform ${open ? 'rotate-45 bg-cyan-400/20' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-300 text-sm leading-relaxed">{a}</div>
      )}
    </div>
  );
};

const AffiliateProgramPage: React.FC = () => {
  const [form, setForm] = useState<AffiliateFormData>({
    firstName: '', lastName: '', email: '', phone: '', country: '',
    role: '', company: '', linkedin: '', experience: '',
    supplierTypes: [], networkSize: '', methods: [], notes: '',
    termsAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarsVisible(true), 300); return () => clearTimeout(t); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'termsAccepted') {
        setForm(prev => ({ ...prev, termsAccepted: checked }));
        return;
      }
      setForm(prev => {
        const arr = prev[name as 'supplierTypes' | 'methods'] as string[];
        return {
          ...prev,
          [name]: checked ? [...arr, value] : arr.filter(v => v !== value),
        };
      });
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase
        .from('affiliate_applications')
        .insert({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone || null,
          country: form.country,
          role: form.role,
          company: form.company || null,
          linkedin: form.linkedin || null,
          experience: form.experience,
          supplier_types: form.supplierTypes,
          network_size: form.networkSize || null,
          methods: form.methods,
          notes: form.notes || null,
          status: 'pending',
        });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">

      {/* Hero */}
      <section className="relative text-center py-24 sm:py-36 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-blue-900/5 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto animate-fade-in">
          {/* Badge — decorative ✦ glyph kept intentionally; it is punctuation, not an emoji */}
          <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            <SparkleIcon size={12} className="text-cyan-400" />
            Affiliate Partner Programme
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white leading-tight">
            Earn by introducing suppliers to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">the future of the travel trade</span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-white/70 leading-relaxed font-light">
            TravelIQ gives travel suppliers a 24/7 AI Sales Assistant that engages UK and European travel agents. You don't need to be based in the UK — if you know suppliers anywhere in the world who want to reach European agents, your referral earns commission.
          </p>
          <button
            onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-10 inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-10 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-lg"
          >
            Apply to Join
          </button>
          <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16">
            {[
              { num: '20%', label: 'Max commission' },
              { num: '£15k', label: 'Revenue to reach top tier' },
              { num: 'Recurring', label: 'Commission structure' },
              { num: '30 days', label: 'Payment terms' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold font-heading text-white">{s.num}</div>
                <div className="text-xs text-white/50 mt-1 tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* How it works */}
        <section id="how-it-works" className="py-16">
          <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-3">How it works</p>
          <h2 className="text-3xl font-extrabold font-heading text-white mb-4">Introductions, not sales</h2>
          <p className="text-gray-300 max-w-2xl mb-12 font-light leading-relaxed">
            You don't need to be a salesperson. Your value is the warm introduction and trusted recommendation. TravelIQ's team handles demos, proposals and contracts. You make the introduction — we do the rest.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-cyan-400/10 rounded-xl overflow-hidden">
            {[
              { num: '01', title: 'Apply & onboard', desc: "Complete your application below. We'll schedule a short onboarding call and set you up with your personal tracking link and co-branded materials." },
              { num: '02', title: 'Make introductions', desc: "Introduce TravelIQ to travel suppliers in your network — tour operators, cruise lines, airlines, hotels, DMCs. Share your unique link or introduce us by email." },
              { num: '03', title: 'We close the deal', desc: "The TravelIQ team takes over — demo, proposal, contract and onboarding. We track every introduction back to you." },
              { num: '04', title: 'Get paid', desc: "Earn commission on first-year revenue plus recurring commission every year the supplier stays on the platform. Passive income, built on one introduction." },
            ].map(step => (
              <div key={step.num} className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 p-7">
                <div className="text-5xl font-extrabold font-heading text-cyan-400/10 select-none mb-3">{step.num}</div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Commission tiers */}
        <section className="py-16 border-t border-cyan-400/10">
          <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-3">Commission structure</p>
          <h2 className="text-3xl font-extrabold font-heading text-white mb-4">Three tiers, growing with you</h2>
          <p className="text-gray-300 max-w-2xl mb-12 font-light leading-relaxed">
            Start at 10% and grow as you bring more suppliers on board. All tiers earn recurring commission — your earnings compound over time as suppliers renew.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {TIERS.map(tier => (
              <div key={tier.tag} className={`relative rounded-xl border p-7 flex flex-col transition-transform hover:-translate-y-1 ${tier.featured ? 'border-cyan-400/40 bg-gradient-to-br from-cyan-900/20 to-blue-900/20' : 'border-cyan-400/10 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80'}`}>
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-4 py-0.5 rounded-full tracking-wide whitespace-nowrap">MOST POPULAR</div>
                )}
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit ${tier.tagColor}`}>{tier.tag}</span>
                <div className="text-5xl font-extrabold font-heading text-white mb-1">{tier.rate}</div>
                <div className="text-sm text-gray-400 mb-5">{tier.subtitle}</div>
                <hr className="border-cyan-400/10 mb-5" />
                <ul className="space-y-3 flex-1">
                  {tier.perks.map(p => (
                    <li key={p} className="flex items-start gap-3 text-sm text-gray-300">
                      <svg className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-gray-500 italic">{tier.unlock}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recurring income section */}
        <section className="py-16 border-t border-cyan-400/10">
          <div className="bg-gradient-to-br from-[#060e1d] to-[#0d2040] rounded-xl p-8 sm:p-12 border border-cyan-400/10">
            <div className="grid sm:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-3">How your income grows</p>
                <h2 className="text-3xl font-extrabold font-heading text-white mb-4">One introduction.<br/>Recurring income.</h2>
                <p className="text-gray-400 font-light leading-relaxed mb-8">
                  Every supplier pays an annual platform fee. Your commission renews each year they stay — turning a single warm introduction into a multi-year income stream.
                </p>
                <div className="space-y-5">
                  {INCOME_FEATURES.map(item => (
                    <div key={item.label} className="flex gap-4 items-start">
                      {/* Icon replaces the original emoji */}
                      <TierIcon
                        name={item.iconName}
                        size="sm"
                        bg="bg-cyan-400/10"
                        color="text-cyan-400"
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-white font-semibold text-sm">{item.label}</p>
                        <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6 text-center">How a small portfolio compounds over time</p>
                <div className="space-y-4">
                  {[
                    { year: 'Year 1', label: 'First introductions land', sublabel: 'Commission starts flowing', pct: 30 },
                    { year: 'Year 2', label: 'Renewals + new intros', sublabel: 'First-year suppliers renew', pct: 58 },
                    { year: 'Year 3', label: 'Portfolio compounds', sublabel: 'Multiple renewal streams', pct: 85 },
                  ].map((row, i) => (
                    <div key={row.year}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">{row.year}</span>
                        <span className="text-xs text-gray-500">{row.sublabel}</span>
                      </div>
                      <div className="h-9 bg-white/5 rounded-lg border border-cyan-400/10 overflow-hidden">
                        <div
                          className="h-full rounded-lg flex items-center px-3 transition-all duration-1000 ease-out"
                          style={{
                            width: barsVisible ? `${row.pct}%` : '0%',
                            transitionDelay: `${i * 180}ms`,
                            background: 'linear-gradient(90deg, rgba(6,182,212,0.5), rgba(59,130,246,0.4))',
                          }}
                        >
                          <span className="text-xs text-white/90 font-medium whitespace-nowrap">{row.label}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 text-center mt-5">Illustrative only. Actual earnings depend on agreed plan values.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Who to target */}
        <section className="py-16 border-t border-cyan-400/10">
          <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-3">Ideal prospects</p>
          <h2 className="text-3xl font-extrabold font-heading text-white mb-4">Who should you be introducing?</h2>
          <p className="text-gray-300 max-w-2xl mb-12 font-light leading-relaxed">
            TravelIQ is built for any supplier with a travel agent distribution channel. These are the highest-value prospects to target first in the UK and European market.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROFILES.map(p => (
              <div key={p.title} className="flex gap-4 p-5 rounded-xl border border-cyan-400/10 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 hover:border-cyan-400/30 transition-colors">
                {/* TierIcon replaces the original emoji + coloured div */}
                <TierIcon
                  name={p.iconName}
                  size="md"
                  bg={p.bg}
                  color={p.iconColor}
                />
                <div>
                  <p className="font-semibold text-white text-sm mb-1">{p.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed mb-2">{p.desc}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.tierClass}`}>{p.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global scope + agent context */}
        <section className="py-16 border-t border-cyan-400/10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Open globally */}
            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-400/20 rounded-xl p-8">
              {/* Globe icon replaces 🌍 */}
              <FeatureIcon size="lg" bg="bg-cyan-400/10" className="mb-4">
                <GlobalIcon size={24} className="text-cyan-400" />
              </FeatureIcon>
              <h3 className="text-xl font-bold font-heading text-white mb-3">Open to affiliates worldwide</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                You don't need to be based in the UK or Europe to participate. If you have relationships with travel suppliers anywhere — Asia, the Middle East, North America, Africa — and those suppliers want to grow their bookings through UK and European travel agents, your introduction is valuable.
              </p>
              <ul className="space-y-2">
                {['UK & Ireland based affiliates', 'European travel industry professionals', 'Global supplier-side contacts & consultants', 'Former account managers and trade reps worldwide'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="h-4 w-4 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* What TravelIQ does for agents */}
            <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-8">
              {/* Bot icon replaces 🤖 */}
              <FeatureIcon size="lg" bg="bg-cyan-400/10" className="mb-4">
                <AIIcon size={24} className="text-cyan-400" />
              </FeatureIcon>
              <h3 className="text-xl font-bold font-heading text-white mb-3">What TravelIQ does for travel agents</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                When you introduce a supplier to TravelIQ, their profile goes live in a directory used by UK and European travel agents. Each supplier gets a dedicated AI Sales Assistant that agents can chat and speak with — getting instant answers on fares, policies, products, and commissions, 24/7, in any language.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Instant answers', desc: 'No hold music. No out-of-office replies.' },
                  { label: '10+ languages', desc: 'Serves agents across the European market.' },
                  { label: 'Named lead capture', desc: 'Supplier receives agent name, email, agency, and question.' },
                ].map(item => (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-300"><span className="text-white font-semibold">{item.label}</span> — {item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Application form */}
        <section id="apply" className="py-16 border-t border-cyan-400/10">
          <div className="text-center mb-12">
            {/* Users icon replaces 🤝 */}
            <FeatureIcon size="xl" bg="bg-cyan-400/10" className="mx-auto mb-5">
              <AffiliateIcon size={28} className="text-cyan-400" />
            </FeatureIcon>
            <h2 className="text-3xl font-extrabold font-heading text-white">Apply to become an affiliate</h2>
            <p className="mt-3 text-gray-300 max-w-lg mx-auto font-light">
              Tell us about yourself and your network. We'll review your application and be in touch within 2 business days.
            </p>
          </div>

          {submitted ? (
            <div className="max-w-2xl mx-auto bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-12 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-cyan-400/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold font-heading text-white">Application Received!</h3>
              <p className="mt-3 text-gray-300 max-w-md mx-auto">
                Thank you, {form.firstName}. We'll review your application and reach out to {form.email} within 2 business days to schedule your onboarding call.
              </p>
              <Link to="/" className="mt-8 inline-block text-cyan-400 hover:text-white transition-colors font-semibold">← Back to Home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-8 space-y-8">

              {submitError && (
                <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">{submitError}</div>
              )}

              {/* Your details */}
              <div>
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5">Your details</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First name <span className="text-cyan-400">*</span></label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Jane" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Last name <span className="text-cyan-400">*</span></label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Smith" className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Email address <span className="text-cyan-400">*</span></label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jane@yourcompany.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone number</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+44 7700 000000" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Country <span className="text-cyan-400">*</span></label>
                    <select name="country" value={form.country} onChange={handleChange} required className={selectClass}>
                      <option value="">Select country</option>
                      <option>United Kingdom</option>
                      <option>Ireland</option>
                      <option>Germany</option>
                      <option>France</option>
                      <option>Netherlands</option>
                      <option>Belgium</option>
                      <option>Spain</option>
                      <option>Italy</option>
                      <option>Sweden</option>
                      <option>Norway</option>
                      <option>Denmark</option>
                      <option>Switzerland</option>
                      <option>Austria</option>
                      <option>Australia</option>
                      <option>South Africa</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-cyan-400/10" />

              {/* Your background */}
              <div>
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5">Your background</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Current role / profession <span className="text-cyan-400">*</span></label>
                    <select name="role" value={form.role} onChange={handleChange} required className={selectClass}>
                      <option value="">Select your role</option>
                      <option>Travel trade consultant</option>
                      <option>Host agency principal / owner</option>
                      <option>Former supplier account manager / trade rep</option>
                      <option>Travel industry coach or educator</option>
                      <option>Travel trade journalist / media</option>
                      <option>Travel industry event organiser</option>
                      <option>Travel technology consultant</option>
                      <option>Independent travel agent</option>
                      <option>Other travel industry professional</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Company / agency name</label>
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Your company or agency (if applicable)" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>LinkedIn profile URL</label>
                    <input name="linkedin" type="url" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/your-name" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Years of experience in the travel industry <span className="text-cyan-400">*</span></label>
                    <select name="experience" value={form.experience} onChange={handleChange} required className={selectClass}>
                      <option value="">Select range</option>
                      <option>Less than 2 years</option>
                      <option>2–5 years</option>
                      <option>5–10 years</option>
                      <option>10–20 years</option>
                      <option>20+ years</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-cyan-400/10" />

              {/* Your network */}
              <div>
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5">Your network</p>
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Which supplier types do you have the strongest connections with? <span className="text-cyan-400">*</span></label>
                    <div className="mt-3 space-y-2.5">
                      {[
                        { value: 'tour-operators', label: 'Tour operators & DMCs' },
                        { value: 'cruise', label: 'Cruise lines' },
                        { value: 'airlines', label: 'Airlines' },
                        { value: 'hotels', label: 'Hotels & resorts' },
                        { value: 'insurance', label: 'Travel insurance providers' },
                        { value: 'other', label: 'Other' },
                      ].map(opt => (
                        <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            name="supplierTypes"
                            value={opt.value}
                            checked={form.supplierTypes.includes(opt.value)}
                            onChange={handleChange}
                            className="w-4 h-4 accent-cyan-400"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Roughly how many travel supplier contacts are in your network?</label>
                    <select name="networkSize" value={form.networkSize} onChange={handleChange} className={selectClass}>
                      <option value="">Select range</option>
                      <option>Fewer than 10</option>
                      <option>10–25</option>
                      <option>25–50</option>
                      <option>50–100</option>
                      <option>100+</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>How do you plan to introduce TravelIQ to suppliers?</label>
                    <div className="mt-3 space-y-2.5">
                      {[
                        { value: 'personal', label: 'Personal introductions from my existing network' },
                        { value: 'linkedin', label: 'LinkedIn outreach' },
                        { value: 'events', label: 'Trade events and conferences' },
                        { value: 'content', label: 'Content / social media' },
                        { value: 'email', label: 'Email marketing to my list' },
                      ].map(opt => (
                        <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            name="methods"
                            value={opt.value}
                            checked={form.methods.includes(opt.value)}
                            onChange={handleChange}
                            className="w-4 h-4 accent-cyan-400"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Anything else you'd like us to know?</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about your network, any specific suppliers you have in mind, or questions about the programme…"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <hr className="border-cyan-400/10" />

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={form.termsAccepted}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 accent-cyan-400 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-gray-300">
                  I confirm I am a travel industry professional and agree to the{' '}
                  <Link to="/privacy" className="text-cyan-400 hover:underline">TravelIQ Affiliate Programme Terms</Link> and{' '}
                  <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>. <span className="text-cyan-400">*</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity text-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit my application
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center">
                We'll review your application within 2 business days and reach out to schedule your onboarding call.
              </p>
            </form>
          )}
        </section>

        {/* FAQ */}
        <section className="py-16 border-t border-cyan-400/10">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-3 text-center">FAQ</p>
            <h2 className="text-3xl font-extrabold font-heading text-white mb-10 text-center">Common questions</h2>
            <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl overflow-hidden">
              {FAQS.map(faq => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AffiliateProgramPage;
