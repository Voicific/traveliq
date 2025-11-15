import React from 'react';

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1520454974442-65d83a383d6a?q=80&w=2070&auto=format&fit=crop')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold font-heading text-white text-center drop-shadow-lg">
            Bridging the Gap in Travel Intelligence
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 backdrop-blur-lg border border-cyan-400/10 p-8 md:p-12 rounded-xl shadow-lg animate-fade-in">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-3xl font-bold font-heading text-cyan-400 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                At the intersection of travel, aviation, and artificial intelligence, TravelIQ was born. Our founding team, comprised of seasoned industry experts, recognized a critical communication gap: travel agents need instant, accurate information to serve their clients, while suppliers need a powerful, direct channel to educate and update the trade. We saw the endless searching, the waiting, and the missed opportunities.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed font-semibold text-white">
                Our mission is to bridge this divide. TravelIQ is more than a tool; it's a revolutionary AI supplier network built on deep industry knowledge, designed to foster seamless, intelligent communication. We empower both sides of the trade, creating a more efficient, profitable, and collaborative ecosystem for everyone involved.
              </p>
            </div>
            {/* Image */}
            <div className="mt-8 md:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                alt="Collaborative team working together" 
                className="rounded-lg shadow-lg object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;