import React from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import HeroSection from '../components/home/HeroSection.tsx';
import NetworkConstellation from '../components/home/NetworkConstellation.tsx';
import HowItWorksStory from '../components/home/HowItWorksStory.tsx';
import LeadSignatureMoment from '../components/home/LeadSignatureMoment.tsx';
import AdvantageEditorial from '../components/home/AdvantageEditorial.tsx';
import FounderBreak from '../components/home/FounderBreak.tsx';
import FAQSection from '../components/home/FAQSection.tsx';
import FinalCTA from '../components/home/FinalCTA.tsx';

/**
 * Homepage — a documentary narrative rather than a stacked feature list:
 * the trade has changed → the network answers → how it works → every
 * conversation becomes a lead → the case → the origin → the invitation.
 * Section components live in src/components/home/.
 */
const HomePage: React.FC = () => {
  usePageMeta({
    title: "TravelIQ | Europe's AI Voice Support Network for the Travel Trade",
    description:
      'TravelIQ gives airlines, cruise lines, hotel groups and tour operators a 24/7 AI sales assistant — answering UK & European travel agents in 10+ languages and turning every conversation into a named lead.',
    canonical: '/',
  });

  return (
    <div className="bg-[#0a1628] text-white">
      <HeroSection />
      <NetworkConstellation />
      <HowItWorksStory />
      <LeadSignatureMoment />
      <AdvantageEditorial />
      <FounderBreak />
      <FAQSection />
      <FinalCTA />
    </div>
  );
};

export default HomePage;
