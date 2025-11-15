import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoIcon } from './icons/LogoIcon.tsx';
import NewsletterForm from './NewsletterForm.tsx';
import { useUI } from '../context/UIContext.tsx';

const Footer: React.FC = () => {
  const { openContactModal } = useUI();
  const navigate = useNavigate();

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openContactModal();
  };

  const handleFaqClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Check if we are already on the homepage
    if (window.location.hash === '#/' || window.location.pathname === '/') {
        document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
    } else {
        navigate('/');
        // Use a timeout to ensure the homepage has rendered before scrolling
        setTimeout(() => {
            document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-[#0a1628] via-[#0d2d3d] to-[#0a1628] text-white border-t-2 border-cyan-400/20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-2">
             <Link to="/" className="flex items-center">
                <LogoIcon className="h-20 w-auto md:h-24" />
            </Link>
            <p className="mt-4 text-gray-300 text-base max-w-sm">
              The Intelligent AI Supplier Network for the Travel Trade.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Navigate</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/" className="text-base text-gray-200 hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link to="/suppliers" className="text-base text-gray-200 hover:text-cyan-400 transition-colors">Suppliers</Link></li>
              <li><Link to="/pricing" className="text-base text-gray-200 hover:text-cyan-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/about" className="text-base text-gray-200 hover:text-cyan-400 transition-colors">About</Link></li>
              <li><a href="#" onClick={handleContactClick} className="text-base text-gray-200 hover:text-cyan-400 transition-colors">Contact</a></li>
              <li><Link to="/privacy" className="text-base text-gray-200 hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-base text-gray-200 hover:text-cyan-400 transition-colors">Terms & Conditions</Link></li>
              <li><a href="#faqs" onClick={handleFaqClick} className="text-base text-gray-200 hover:text-cyan-400 transition-colors">FAQs</a></li>
              <li><Link to="/login" className="text-base text-gray-200 hover:text-cyan-400 transition-colors">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        
        <div id="newsletter-signup" className="mt-12 border-t border-cyan-400/20 pt-8">
            <h3 className="text-lg font-semibold text-center text-white">Stay Ahead of the Trade</h3>
            <p className="text-gray-300 text-center mt-2">Get supplier updates and exclusive invites to TravelIQ demos.</p>
            <NewsletterForm />
        </div>

        <div className="mt-12 border-t border-cyan-400/20 pt-8">
          <p className="text-base text-gray-300 xl:text-center">&copy; 2025 TravelIQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;