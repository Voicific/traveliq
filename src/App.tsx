import React from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import DirectoryPage from './pages/DirectoryPage.tsx';
import SupplierProfilePage from './pages/SupplierProfilePage.tsx';
import PricingPage from './pages/PricingPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import { SupplierProvider } from './context/SupplierContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AboutUsPage from './pages/AboutUsPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import TermsPage from './pages/TermsPage.tsx';
import { AgentProvider } from './context/AgentContext.tsx';
import { LeadProvider, useLeads } from './context/LeadContext.tsx';
import { UIProvider, useUI } from './context/UIContext.tsx';
import ContactModal from './components/ContactModal.tsx';
import ChatHistoryPage from './pages/ChatHistoryPage.tsx';
import { VeeChatProvider } from './context/VeeChatContext.tsx';

import SupplierChatbot from './components/SupplierChatbot.tsx';
import BlogPage from './pages/BlogPage.tsx';
import BlogPostPage from './pages/BlogPostPage.tsx';
import { AIProvider } from './context/AIContext.tsx';
import AIStudioLayout from './pages/AIStudioLayout.tsx';

import ImageEditPage from './pages/ImageEditPage.tsx';

const AppContent: React.FC = () => {
  const { isContactModalOpen, closeContactModal, isVeeChatOpen, openVeeChat, closeVeeChat } = useUI();
  const { addLead } = useLeads();

  const handleContactSubmit = (details: { name: string; email: string; message: string; agency: string; }) => {
    addLead({
      type: 'Contact Inquiry',
      name: details.name,
      email: details.email,
      agency: details.agency,
      message: details.message,
    });
  };

  return (
    <>
      <HashRouter>
        <div className="flex flex-col min-h-screen text-brand-light">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/suppliers" element={<DirectoryPage />} />
              <Route path="/supplier/:id" element={<SupplierProfilePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/chat-history"
                element={
                  <ProtectedRoute>
                    <ChatHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-studio/*"
                element={
                  <ProtectedRoute>
                    <AIStudioLayout>
                      <Routes>
                        <Route path="image-edit" element={<ImageEditPage />} />
                        <Route path="/" element={<Navigate to="image-edit" replace />} />
                      </Routes>
                    </AIStudioLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
        onSubmit={handleContactSubmit}
      />
      
      {!isVeeChatOpen && (
        <button
          onClick={openVeeChat}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-brand-primary to-brand-secondary border border-brand-light/20 text-white rounded-full shadow-lg flex items-center p-2 transform hover:scale-105 transition-transform duration-300 z-[90] gap-3 animate-fade-in"
          aria-label="Speak to Vee"
        >
          <img 
            src="/traveliq-ai-avatar.png"
            alt="Vee, AI Assistant" 
            className="w-12 h-12 rounded-full object-cover border-2 border-brand-cyan"
          />
          <span className="font-bold text-lg pr-4">Speak to Vee</span>
        </button>
      )}
      {/* FIX: Replaced undefined `handleClose` with `closeVeeChat` from the useUI hook. */}
      <SupplierChatbot isOpen={isVeeChatOpen} onClose={closeVeeChat} />
    </>
  );
};


function App() {
  return (
    <AIProvider>
      <LeadProvider>
        <AuthProvider>
          <SupplierProvider>
            <AgentProvider>
              <VeeChatProvider>
                <UIProvider>
                  <AppContent />
                </UIProvider>
              </VeeChatProvider>
            </AgentProvider>
          </SupplierProvider>
        </AuthProvider>
      </LeadProvider>
    </AIProvider>
  );
}

export default App;