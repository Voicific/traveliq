import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogoIcon } from './icons/LogoIcon.tsx';
import { useUI } from '../context/UIContext.tsx';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { openContactModal } = useUI();

  const closeMenu = () => {
    setIsMenuOpen(false);
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


  const renderNavLinks = () => (
    <>
      <NavLink to="/" onClick={closeMenu} className={navLinkClassName}>Home</NavLink>
      <NavLink to="/suppliers" onClick={closeMenu} className={navLinkClassName}>Suppliers</NavLink>
      <NavLink to="/pricing" onClick={closeMenu} className={navLinkClassName}>Pricing</NavLink>
      <NavLink to="/blog" onClick={closeMenu} className={navLinkClassName}>Blog</NavLink>
    </>
  );

  return (
    <header className="bg-gradient-to-r from-[#0a1628] via-[#0d2d3d] to-[#0a1628] backdrop-blur-lg sticky top-0 z-50 overflow-x-clip border-b border-cyan-400/20">
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
                Book a Demo
              </button>
            </div>
          </div>
          <div className="flex md:hidden">
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
            {renderNavLinks()}
             <div className="pt-4 mt-4 border-t border-cyan-400/20">
                <button onClick={handleContactClick} className="w-full text-left bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-3 py-3 rounded-md hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300">
                    Book a Demo
                </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;