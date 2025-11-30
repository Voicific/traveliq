import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NewsletterForm from '../components/NewsletterForm.tsx';
import SupplierCarousel from '../components/SupplierCarousel.tsx';

// --- SUB-COMPONENTS ---

interface NewsArticle {
  headline: string;
  link: string;
}

const NewsTicker: React.FC = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    
    useEffect(() => {
        const fetchNews = async () => {
            const fallbackNews = [
                { headline: "UK travel industry adapts to changing consumer demands", link: "https://travelweekly.co.uk/news" },
                { headline: "Latest travel trade insights and market updates", link: "https://www.ttgmedia.com/news" },
                { headline: "Global travel industry trends and analysis", link: "https://skift.com/" },
                { headline: "Travel technology innovations reshaping the industry", link: "https://www.phocuswire.com/" },
                { headline: "Breaking: Travel trade partnerships and new developments", link: "https://www.breakingtravelnews.com/" },
                { headline: "AI and digital transformation in travel sector", link: "https://www.traveldailymedia.com/" },
                { headline: "Sustainable travel initiatives gaining momentum", link: "https://www.sustainable-travel-international.org/" }
            ];

            const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY;

            if (!SERPER_API_KEY || SERPER_API_KEY.includes('demo_key_replace_with_real') || SERPER_API_KEY.includes('YOUR_SERPER_API_KEY')) {
                 console.warn("SERPER_API_KEY is not configured. Using fallback news articles.");
                 setNews(fallbackNews);
                 return;
            }

            try {
                const response = await fetch('https://google.serper.dev/news', {
                    method: 'POST',
                    headers: {
                        'X-API-KEY': SERPER_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: "travel trade news 2025 UK agents suppliers",
                        gl: "uk",
                        num: 10,
                        tbs: "qdr:d" // Last day
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Serper API responded with status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.news && data.news.length > 0) {
                     const fetchedNews = data.news
                        .map((item: { title: string; link: string; }) => ({
                            headline: item.title,
                            link: item.link,
                        }))
                        .filter((item: { headline: string; link: string; }) => item.headline && item.link);

                    if (fetchedNews.length > 0) {
                        setNews(fetchedNews);
                    } else {
                        setNews(fallbackNews);
                    }
                } else {
                    setNews(fallbackNews);
                }
            } catch (error) {
                console.error("Failed to fetch live news from Serper, using fallback articles:", error);
                setNews(fallbackNews);
            }
        };
        fetchNews();
    }, []);

    const newsItems = news.length > 0 ? news : [{ headline: "Loading latest travel updates...", link: "#" }];
    const duplicatedNews = [...newsItems, ...newsItems, ...newsItems, ...newsItems]; 

    return (
        <div className="bg-gradient-to-r from-[#0a1628] via-[#0d2d3d] to-[#0a1628] border-y border-cyan-400/20 py-3 overflow-hidden">
            <div className="flex">
                <div className="flex animate-news-scroll hover:[animation-play-state:paused]">
                    {duplicatedNews.map((item, index) => (
                        <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex-shrink-0 mx-6 text-sm font-medium flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(0,212,255,0.8)]"></span>
                            <span>{item.headline}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; step: number; }> = ({ icon, title, description, step }) => (
    <div className="feature-card-premium relative bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-xl p-8 rounded-2xl border border-cyan-400/20 text-center transform transition-all duration-500 hover:scale-105 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] group">
        <div className="absolute top-5 left-5 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 text-cyan-300 font-bold text-lg rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all duration-300">{step}</div>
        <div className="text-cyan-400 mx-auto mb-6 w-20 h-20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_0_15px_rgba(0,212,255,0.6)]">{icon}</div>
        <h3 className="text-2xl font-bold font-heading bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">{title}</h3>
        <p className="mt-3 text-gray-300 leading-relaxed">{description}</p>
    </div>
);

const AdvantageCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
  <div className="bg-gradient-to-br from-[#0f1c2e]/60 to-[#0d2d3d]/60 backdrop-blur-md p-6 rounded-xl border border-cyan-400/20 transform transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(0,212,255,0.2)] group">
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 text-cyan-400 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">{icon}</div>
      <div>
        <h3 className="text-xl font-bold font-heading bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">{title}</h3>
        <p className="mt-1 text-gray-300">{description}</p>
      </div>
    </div>
  </div>
);

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-cyan-400/10 py-5 hover:border-cyan-400/30 transition-colors duration-300">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left group">
        <span className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors duration-300">{question}</span>
        <span className={`transform transition-all duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : 'rotate-0 text-gray-400'}`}>▼</span>
      </button>
      {isOpen && <div className="mt-4 text-gray-300 animate-fade-in leading-relaxed">{children}</div>}
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---

const HomePage: React.FC = () => {
  const headlineText = "Smart. Instant. Voice AI Supplier Support.";
  const words = headlineText.split(' ');

  return (
    <div className="text-white bg-[#0a1628]">
      <NewsTicker />
      
      {/* Hero Section with Video Background */}
      <section className="relative text-center py-24 sm:py-36 px-4 overflow-hidden bg-[#0a1628]">
        {/* Simple Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.6,
            zIndex: 0
          }}
          src="/videos/promo.mp4"
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/85 via-[#0d2d3d]/60 to-[#0a1628]/85" style={{ zIndex: 1 }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/60 via-transparent to-[#0a1628]/60" style={{ zIndex: 1 }}></div>

        <div className="relative z-10 max-w-5xl mx-auto" style={{ zIndex: 10 }}>
          <p className="text-cyan-400 font-bold tracking-[0.3em] uppercase mb-6 text-sm sm:text-base animate-fade-in drop-shadow-[0_0_15px_rgba(0,212,255,0.8)]">
            The Travel Industry's First AI Voice Support Network
          </p>
          
          {/* Continuously Animated Hero Text with Gradient */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold font-heading leading-tight mb-8 hero-gradient-animated">
            {headlineText}
          </h1>
          
          <p className="mt-8 max-w-3xl mx-auto text-xl sm:text-2xl text-gray-300 leading-relaxed animate-fade-in" style={{ animationDelay: '1.2s' }}>
            TravelIQ is the intelligent AI supplier network for the travel trade. Get instant, verified answers from leading brands, 24/7. Free for travel agents.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{ animationDelay: '1.5s' }}>
            <Link to="/suppliers" className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-10 py-5 rounded-xl shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_50px_rgba(0,212,255,0.7)] transition-all duration-500 transform hover:scale-110 overflow-hidden">
              <span className="relative z-10">Explore Suppliers</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
            <Link to="/pricing" className="group relative bg-white/10 backdrop-blur-md border-2 border-cyan-400/40 text-white font-bold px-10 py-5 rounded-xl hover:bg-cyan-400/20 hover:border-cyan-400 transition-all duration-500 transform hover:scale-110 shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]">
              <span className="relative z-10">For Suppliers</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Supplier Logos */}
      <section className="py-16 bg-gradient-to-b from-[#0d2d3d]/50 to-[#0a1628]/50 border-y border-cyan-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-sm font-semibold text-gray-400 tracking-wider uppercase mb-10">
                The intelligent network for the world's leading travel brands
            </h2>
            <SupplierCarousel />
        </div>
      </section>

      {/* "For the Trade" section */}
      <section className="py-24 sm:py-32 px-4 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold font-heading bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            The Future of Travel Intelligence is Here
          </h2>
          <p className="mt-6 text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Step into the future with the industry's first AI supplier network, built exclusively for travel agents. Get the verified information you need, the moment you need it. For free.
          </p>
        </div>
        <div className="mt-20 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <FeatureCard
            step={1}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" /></svg>}
            title="Speak or Chat Instantly"
            description="Use your voice or text to connect directly with the AI Sales Assistant of leading brands. The industry's first platform for real-time AI communication."
          />
          <FeatureCard
            step={2}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>}
            title="Get Verified Answers, 24/7"
            description="No more hold music or waiting for emails. Get instant, accurate information straight from the source, any time of day or night."
          />
          <FeatureCard
            step={3}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 19.5v-8.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 11.25z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v-3.75m-3.75 3.75H12m0 0h3.75m-3.75 0V15m0-3.75a3 3 0 10-6 0v3.75a3 3 0 106 0v-3.75zm0 0a3 3 0 106 0v3.75a3 3 0 10-6 0v-3.75z" /></svg>}
            title="Increase Your IQ, for Free"
            description="Access our entire network of AI Sales Support at no cost. Boost your expertise, serve clients faster, and close more sales. No catch."
          />
        </div>
      </section>

      {/* How It Works (for Suppliers) */}
      <section className="py-24 sm:py-32 px-4 bg-gradient-to-br from-[#0f1c2e] via-[#0d2d3d] to-[#0f1c2e]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold font-heading bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            Join The Intelligent Network
          </h2>
          <p className="mt-6 text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Our 3-step process makes it simple for suppliers to provide 24/7 AI Sales Support to thousands of travel agents.
          </p>
        </div>
        <div className="mt-20 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <FeatureCard
            step={1}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Onboard Your Knowledge"
            description="Your proprietary information is safe. We are GDPR compliant and treat your knowledge base with the strictest confidentiality. Securely provide your data, and our AI will become your brand expert."
          />
          <FeatureCard
            step={2}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H19.5M18.75 8.25V21m-16.5 0V8.25m16.5 0c0-1.657-1.343-3-3-3H9c-1.657 0-3 1.343-3 3m15 0a3 3 0 01-3 3H9a3 3 0 01-3-3m15 0a3 3 0 01-3 3H9a3 3 0 01-3-3" /></svg>}
            title="Engage Agents 24/7"
            description="Your AI Sales Support instantly answers agent queries, provides training, and promotes your latest offers, day and night."
          />
          <FeatureCard
            step={3}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.68c.34-1.017.64-2.09.87-3.186a11.03 11.03 0 00.13-1.014c0-1.113-.285-2.16-.786-3.07m-3.672 8.422A3.723 3.723 0 017.5 15.75c0-1.52.923-2.834 2.226-3.411a3.723 3.723 0 014.288 0c1.303.577 2.226 1.891 2.226 3.411a3.723 3.723 0 01-1.258 2.654l-3.022.043z" /></svg>}
            title="Convert & Analyze"
            description="Receive qualified leads and gain valuable insights from agent interactions through our powerful analytics dashboard."
          />
        </div>
      </section>

      {/* Dual Advantage Section */}
      <section className="py-24 sm:py-32 px-4 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Agent Advantage */}
          <div className="animate-slide-in">
            <h2 className="text-4xl sm:text-5xl font-extrabold font-heading bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">The Agent Advantage</h2>
            <p className="mt-4 text-xl text-gray-300">Work smarter, not harder. Get the intelligent answers you need, when you need them. For free.</p>
            <div className="mt-10 space-y-6">
              <AdvantageCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Instant Answers, 24/7"
                description="No more waiting for office hours or time zone differences. Get verified supplier info anytime."
              />
              <AdvantageCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0M8.464 15.536a5 5 0 010-7.072" /></svg>}
                title="Zero Hold Music"
                description="Connect directly with an AI expert that has all the answers, without the frustrating wait times."
              />
               <AdvantageCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Boost Your Expertise"
                description="Quickly get up to speed on new products, destinations, and policies to better serve your clients."
              />
            </div>
          </div>

          {/* Supplier Advantage */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-4xl sm:text-5xl font-extrabold font-heading bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">The Supplier Advantage</h2>
            <p className="mt-4 text-xl text-gray-300">Dramatically reduce costs while increasing your reach and engagement with the travel trade.</p>
            <div className="mt-10 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 backdrop-blur-xl border border-cyan-400/20 rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.2)] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-cyan-400/20">
                        <tr>
                            <th className="p-5 font-semibold text-white">Feature</th>
                            <th className="p-5 font-semibold text-gray-400">Traditional Sales</th>
                            <th className="p-5 font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">TravelIQ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyan-400/10">
                        <tr className="hover:bg-white/5 transition-colors duration-200">
                            <td className="p-5 font-medium text-white">Annual Cost</td>
                            <td className="p-5 text-gray-400">$150,000+</td>
                            <td className="p-5 font-bold text-cyan-400">Significant Savings</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors duration-200">
                            <td className="p-5 font-medium text-white">Availability</td>
                            <td className="p-5 text-gray-400">40 hrs/week</td>
                            <td className="p-5 font-bold text-white">24/7/365</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors duration-200">
                            <td className="p-5 font-medium text-white">Agent Reach</td>
                            <td className="p-5 text-gray-400">Limited by Manpower</td>
                            <td className="p-5 font-bold text-white">Global & Unlimited</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors duration-200">
                            <td className="p-5 font-medium text-white">Lead Quality</td>
                            <td className="p-5 text-gray-400">Variable</td>
                            <td className="p-5 font-bold text-white">Qualified & Tracked</td>
                        </tr>
                         <tr className="hover:bg-white/5 transition-colors duration-200">
                            <td className="p-5 font-medium text-white">Info Consistency</td>
                            <td className="p-5 text-gray-400">Varies by Rep</td>
                            <td className="p-5 font-bold text-white">100% Consistent</td>
                        </tr>
                    </tbody>
                </table>
                 <div className="p-8 bg-gradient-to-r from-[#0d2d3d]/80 to-[#0f1c2e]/80 text-center border-t border-cyan-400/20">
                    <h4 className="font-bold text-2xl bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">Clear ROI, Immediate Impact</h4>
                    <p className="text-sm text-gray-400 mt-2">Example based on 2 sales reps vs. one Enterprise plan.</p>
                    <div className="mt-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 rounded-xl border border-cyan-400/30 shadow-[0_0_30px_rgba(0,212,255,0.3)]">
                        <p className="text-6xl font-extrabold font-heading bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]">90%+</p>
                        <p className="font-bold text-xl text-white mt-2">Reduction in Annual Cost</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="py-24 sm:py-32 px-4 bg-gradient-to-br from-[#0f1c2e] via-[#0d2d3d] to-[#0f1c2e]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-4xl sm:text-5xl font-extrabold font-heading bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            Frequently Asked Questions
          </h2>
          <div className="mt-16">
            <h3 className="text-3xl font-bold font-heading text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]">For Travel Agents</h3>
            <FAQItem question="Is TravelIQ really free for travel agents?">
              <p>Yes, absolutely! Access to our entire network of AI Sales Support is completely free for registered travel agents. Our mission is to provide you with the best tools to help you sell more effectively.</p>
            </FAQItem>
            <FAQItem question="How accurate is the information provided by the AI?">
              <p>The information comes directly from the suppliers themselves. Our AI is trained on their official documentation, training materials, and agent portals. This ensures you're getting the most accurate and up-to-date information, just as you would from a top-performing sales rep.</p>
            </FAQItem>
             <FAQItem question="Do I need to install any software?">
                <p>No software is required. TravelIQ is a web-based platform, accessible from any device with an internet browser and a microphone for voice commands. It's designed for ease of use and immediate access.</p>
            </FAQItem>

            <h3 className="text-3xl font-bold font-heading text-cyan-400 mt-16 mb-6 drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]">For Suppliers</h3>
            <FAQItem question="How do you train the AI on our brand's information?">
              <p>We have a secure and straightforward onboarding process. You provide us with your existing knowledge base—this can include agent websites, product PDFs, internal FAQs, and more. Our system ingests this data to create a custom AI Sales Support expert for your brand.</p>
            </FAQItem>
            <FAQItem question="Can we update the information the AI provides?">
              <p>Yes. We know that products, promotions, and policies change. Our platform makes it easy to update the AI's knowledge base in real-time, ensuring the travel trade always has the latest information.</p>
            </FAQItem>
            <FAQItem question="What kind of analytics and lead data do we get?">
              <p>Our supplier dashboard provides powerful insights. You can see what questions agents are asking, identify trends, and discover knowledge gaps. We also provide a full lead capture system, delivering details of the agents interacting with your brand directly to you.</p>
            </FAQItem>

            <h4 className="text-2xl font-bold font-heading text-cyan-300 mt-12 mb-4 drop-shadow-[0_0_10px_rgba(0,212,255,0.3)]">Common Supplier Objections & Our Responses</h4>

            <FAQItem question={
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <span>Cost Objection: 'This sounds expensive, and we already have a support team.'</span>
              </div>
            }>
              <p>I understand cost is a priority. Think of Travel IQ not as an expense, but as a direct cost-saving and revenue-generating investment. While your human team manages complex or urgent issues, the AI handles 80% of repetitive, high-volume queries 24/7. This dramatically reduces your operational costs per interaction and frees your sales team to focus purely on high-value selling, guaranteeing a rapid ROI far exceeding the platform fee.</p>
            </FAQItem>

            <FAQItem question={
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.68c.34-1.017.64-2.09.87-3.186a11.03 11.03 0 00.13-1.014c0-1.113-.285-2.16-.786-3.07m-3.672 8.422A3.723 3.723 0 017.5 15.75c0-1.52.923-2.834 2.226-3.411a3.723 3.723 0 014.288 0c1.303.577 2.226 1.891 2.226 3.411a3.723 3.723 0 01-1.258 2.654l-3.022.043z" />
                </svg>
                <span>Human Touch Objection: 'Travel is a personal business. Will this AI erode the human connection we have with our agents?'</span>
              </div>
            }>
              <p>Absolutely not. Travel IQ is designed to enhance, not replace, your human interaction. We eliminate the frustration agents feel waiting for basic information, meaning when they do connect with your human representative, the conversation is focused, productive, and based on relationship building—not just query answering. We handle the trivia so your team can handle the vital relationship management.</p>
            </FAQItem>

            <FAQItem question={
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v-3.75m-3.75 3.75H12m0 0h3.75m-3.75 0V15m0-3.75a3 3 0 10-6 0v3.75a3 3 0 106 0v-3.75zm0 0a3 3 0 106 0v3.75a3 3 0 10-6 0v-3.75z" />
                </svg>
                <span>Data Security Objection: 'How do we know our proprietary data and our agents' data are secure on a new platform?'</span>
              </div>
            }>
              <p>Security and privacy are paramount. Your knowledge base data is ring-fenced and used only to train your dedicated Voice AI instance—it is never shared or used to train other models. Furthermore, Travel IQ is strictly a sales and information support tool; we do not handle bookings or collect sensitive agent PII. We are focused on maintaining the integrity and confidentiality of your supplier knowledge, giving you control over what the AI shares.</p>
            </FAQItem>

            <FAQItem question={
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
                </svg>
                <span>Trust Objection: 'The platform is new. Why should we trust this technology or your company?'</span>
              </div>
            }>
              <p>We are addressing a clear gap in the market by being the UK's first to offer this dedicated, AI-driven B2B travel support. We are confident because our model is built on two core principles: transparency and results. We start by working with you to ingest and verify your information, giving you full control over the AI's knowledge base. Your low investment secures you a first-mover advantage, positioning you as a forward-thinking, 24/7 reliable partner to the UK travel trade immediately.</p>
            </FAQItem>

            <FAQItem question={
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>AI Accuracy Objection: 'We cannot risk the AI giving out incorrect information—that could damage our brand.'</span>
              </div>
            }>
              <p>That is a crucial point, and it's precisely why our model eliminates that risk. Unlike general AI chatbots, the Travel IQ Voice AI is a closed-loop system. It is only trained and fed from the verified knowledge base you provide. If the answer is not in your data, the AI is trained to simply state it cannot answer or direct the agent to a human contact, ensuring every piece of information it delivers is accurate, consistent, and directly controlled by your brand.</p>
            </FAQItem>
          </div>
        </div>
      </section>
      
       {/* Final CTA */}
      <section className="bg-gradient-to-br from-[#0a1628] via-[#0d2d3d] to-[#0a1628] py-24 sm:py-32 px-4 border-t border-cyan-400/20">
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold font-heading bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,212,255,0.3)]">
              Ready to Join the Intelligent Travel Network?
            </h2>
            <p className="mt-6 text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Whether you're an agent seeking instant answers or a supplier looking to engage the trade more effectively, TravelIQ is your solution. Sign up for updates to stay ahead.
            </p>
            <NewsletterForm />
        </div>
      </section>
    </div>
  );
};

export default HomePage;