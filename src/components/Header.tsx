import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogoIcon } from './icons/LogoIcon.tsx';
import { useUI } from '../context/UIContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isMobileAdminDropdownOpen, setIsMobileAdminDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileProductsDropdownOpen, setIsMobileProductsDropdownOpen] = useState(false);

  const { openContactModal } = useUI();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsAdminDropdownOpen(false);
    setIsMobileAdminDropdownOpen(false);
    setIsProductsDropdownOpen(false);
    setIsMobileProductsDropdownOpen(false);
  };
  
  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/');
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    openContactModal();
  };

  const navLinkClass = "text-base font-medium text-gray-300 hover:text-cyan-400 transition-colors";
  const activeLinkClass = "text-cyan-400";
  const navLinkClassName = ({ isActive }: { isActive: boolean }) => 
    [navLinkClass, isActive ? activeLinkClass : null].filter(Boolean).join(' ');


  const renderNavLinks = (isMobile = false) => (
    <>
      <NavLink to="/" onClick={closeMenu} className={navLinkClassName}>Home</NavLink>
      <NavLink to="/suppliers" onClick={closeMenu} className={navLinkClassName}>Suppliers</NavLink>
      {/* Products Dropdown */}
      {isMobile ? (
        <div className="w-full">
          <button 
              onClick={() => setIsMobileProductsDropdownOpen(!isMobileProductsDropdownOpen)} 
              className={`${navLinkClass} flex justify-between items-center w-full`}
          >
              Products
              <svg className={`w-4 h-4 transition-transform duration-200 ${isMobileProductsDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {isMobileProductsDropdownOpen && (
              <div className="pl-4 mt-3 space-y-4">
                  <a href="https://www.voicific.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-cyan-400">
                      <strong className="text-gray-200 block">voicific.com</strong>
                      <span>AI Call Center Voice Agents</span>
                  </a>
                  <a href="https://www.mckai.app" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-400 hover:text-cyan-400">
                      <strong className="text-gray-200 block">mckai.app</strong>
                      <span>Next-Gen AI Voice Technology</span>
                  </a>
              </div>
          )}
        </div>
      ) : (
        <div 
          className="relative"
          onMouseEnter={() => setIsProductsDropdownOpen(true)}
          onMouseLeave={() => setIsProductsDropdownOpen(false)}
        >
          <button className={`${navLinkClass} flex items-center gap-1`}>
              Products
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {isProductsDropdownOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] bg-gradient-to-br from-[#0f1c2e]/95 to-[#0d2d3d]/95 backdrop-blur-lg rounded-md shadow-lg border border-cyan-400/20 z-50 animate-fade-in" style={{ animationDuration: '0.2s' }}>
                <a href="https://www.voicific.com" target="_blank" rel="noopener noreferrer" className="block px-5 py-4 text-gray-200 hover:bg-[#0a1628]/80 rounded-t-md transition-colors">
                    <p className="font-bold">www.voicific.com - AI Call Center Voice Agents</p>
                    <p className="text-sm text-gray-400 mt-1">Scale your business with a 24/7 AI-powered team. No complex setups, no expensive contracts. Just seamless travel support for your clients.</p>
                </a>
                <div className="border-t border-cyan-400/20"></div>
                <a href="https://www.mckai.app" target="_blank" rel="noopener noreferrer" className="block px-5 py-4 text-gray-200 hover:bg-[#0a1628]/80 rounded-b-md transition-colors">
                    <p className="font-bold">www.mckai.app - Next-Gen AI Voice Technology</p>
                    <p className="text-sm text-gray-400 mt-1">Build Voice-First AI Assistants for Travel Businesses. Create intelligent travel experts that speak naturally, understand context, and deliver exceptional customer experiences—no coding required.</p>
                </a>
            </div>
          )}
        </div>
      )}
      <NavLink to="/pricing" onClick={closeMenu} className={navLinkClassName}>Partnerships</NavLink>
      <NavLink to="/blog" onClick={closeMenu} className={navLinkClassName}>Blog</NavLink>
      {isAuthenticated && (
        <>
            <div className={isMobile ? "pt-4 mt-4 border-t border-brand-light/10" : "relative"}>
                <button 
                    onClick={() => isMobile ? setIsMobileAdminDropdownOpen(!isMobileAdminDropdownOpen) : setIsAdminDropdownOpen(!isAdminDropdownOpen)} 
                    className={`${navLinkClass} flex items-center gap-1`}
                >
                    Admin Area
                    <svg className={`w-4 h-4 transition-transform duration-200 ${ (isMobile ? isMobileAdminDropdownOpen : isAdminDropdownOpen) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {/* Desktop Dropdown */}
                {!isMobile && isAdminDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gradient-to-br from-[#0f1c2e]/95 to-[#0d2d3d]/95 backdrop-blur-lg rounded-md shadow-lg py-1 border border-cyan-400/20 z-50">
                        <NavLink to="/admin" onClick={closeMenu} className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#0a1628]/80">Dashboard</NavLink>
                        <NavLink to="/chat-history" onClick={closeMenu} className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#0a1628]/80">Chat History</NavLink>
                        <NavLink to="/ai-studio/image-edit" onClick={closeMenu} className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#0a1628]/80">AI Studio</NavLink>
                        <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-[#0a1628]/80">Logout</button>
                    </div>
                )}
                {/* Mobile Dropdown */}
                {isMobile && isMobileAdminDropdownOpen && (
                     <div className="pl-4 mt-2 space-y-2">
                        <NavLink to="/admin" onClick={closeMenu} className="block text-sm text-gray-400 hover:text-cyan-400">Dashboard</NavLink>
                        <NavLink to="/chat-history" onClick={closeMenu} className="block text-sm text-gray-400 hover:text-cyan-400">Chat History</NavLink>
                        <NavLink to="/ai-studio/image-edit" onClick={closeMenu} className="block text-sm text-gray-400 hover:text-cyan-400">AI Studio</NavLink>
                        <button onClick={handleLogout} className="w-full text-left block text-sm text-red-400 hover:text-red-300">Logout</button>
                    </div>
                )}
            </div>
        </>
      )}
    </>
  );

  return (
    <header className="bg-gradient-to-r from-[#0a1628] via-[#0d2d3d] to-[#0a1628] backdrop-blur-lg sticky top-0 z-50 border-b border-cyan-400/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-32 md:h-40 lg:h-48">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
                <LogoIcon className="h-24 w-auto md:h-36 lg:h-44" />
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {renderNavLinks()}
              <button onClick={handleContactClick} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-4 py-2 rounded-md hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all duration-300 text-sm">
                Contact Us
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-cyan-400 focus:outline-none"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-[#0d2d3d]/95 to-[#0a1628]/95 backdrop-blur-lg border-t border-cyan-400/20">
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
            {renderNavLinks(true)}
             <div className="pt-4 mt-4 border-t border-cyan-400/20">
                <button onClick={handleContactClick} className="w-full text-left bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-3 py-3 rounded-md hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300">
                    Contact Us
                </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;