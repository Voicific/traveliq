import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AIStudioLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navLinkClass = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkClass = "bg-brand-cyan text-white";
  const inactiveLinkClass = "text-brand-gray hover:bg-brand-light/10 hover:text-brand-light";
  
  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `${navLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`;

  return (
    <div className="bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold font-heading text-white">AI Studio</h1>
          <p className="mt-2 text-lg text-gray-300">Your suite of generative AI tools for travel marketing.</p>
        </div>
        
        <div className="mb-8 flex justify-center">
            <nav className="flex space-x-2 bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80/50 border border-cyan-400/10 p-2 rounded-lg">
                <NavLink to="/ai-studio/image-edit" className={navLinkClassName}>Image Editing</NavLink>
            </nav>
        </div>

        {/* This will render the matched child route component */}
        {children}
      </div>
    </div>
  );
};

export default AIStudioLayout;