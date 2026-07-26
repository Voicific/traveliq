import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import DirectoryPage from './pages/DirectoryPage.tsx';
import SupplierProfilePage from './pages/SupplierProfilePage.tsx';
import PricingPage from './pages/PricingPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import { SupplierProvider } from './context/SupplierContext.tsx';
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
import CookieConsent from './components/CookieConsent.tsx';
import BlogPage from './pages/BlogPage.tsx';
import BlogPostPage from './pages/BlogPostPage.tsx';
import AffiliateProgramPage from './pages/AffiliateProgramPage.tsx';
import AffiliateHubLoginPage from './pages/AffiliateHubLoginPage.tsx';
import AffiliateHubPage from './pages/AffiliateHubPage.tsx';
import AffiliateAdminPage from './pages/AffiliateAdminPage.tsx';
import SupplierRegisterPage from './pages/SupplierRegisterPage.tsx';
import SupplierLoginPage from './pages/SupplierLoginPage.tsx';
import SupplierDashboardPage from './pages/SupplierDashboardPage.tsx';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext.tsx';
import { AIProvider } from './context/AIContext.tsx';
import AIStudioLayout from './pages/AIStudioLayout.tsx';

import ImageEditPage from './pages/ImageEditPage.tsx';

// Persistent "Speak to Vee" trigger, shown on every route EXCEPT the homepage
// — there the Vee hologram in the hero is the entry point, so a floating
// button would be a redundant second trigger. Route-aware, so it must render
// inside BrowserRouter.
const FloatingVeeWidget: React.FC = () => {
  const location = useLocation();
  const { isVeeChatOpen, openVeeChat, closeVeeChat } = useUI();

  // Unlisted supplier previews must not be able to reach Vee. She is a live lead
  // source — booking a demo through her writes an 'AI Lead Capture' row to the
  // Leads sheet and fires a notification email — and a supplier testing their own
  // profile is not a lead. Same reasoning as skipping the agent gate on /preview.
  // The widget is the only way to open her outside the homepage hero, which a
  // preview visitor never sees.
  const isPreviewRoute = location.pathname.startsWith('/preview/');

  // Covers the client-side navigation case: Vee opened elsewhere, then a route
  // change into a preview. Closing beats leaving a live lead funnel on the page.
  React.useEffect(() => {
    if (isPreviewRoute && isVeeChatOpen) closeVeeChat();
  }, [isPreviewRoute, isVeeChatOpen, closeVeeChat]);

  if (isPreviewRoute) return null;
  if (location.pathname === '/' || isVeeChatOpen) return null;
  return (
    <button
      onClick={openVeeChat}
      className="vee-widget fixed bottom-6 right-6 bg-gradient-to-r from-brand-primary to-brand-secondary border border-brand-light/20 text-white rounded-full shadow-lg flex items-center p-2 transform hover:scale-105 transition-transform duration-300 z-[90] gap-3"
      aria-label="Speak to Vee"
    >
      <img
        src="/imgs/vee-avatar.jpg"
        alt="Vee, AI Assistant"
        className="w-12 h-12 rounded-full object-cover border-2 border-brand-cyan"
      />
      <span className="font-bold text-lg pr-4">Speak to Vee</span>
    </button>
  );
};

const AppContent: React.FC = () => {
  const { isContactModalOpen, closeContactModal, isVeeChatOpen, closeVeeChat } = useUI();
  const { addLead } = useLeads();

  const handleContactSubmit = (details: { name: string; email: string; message: string; agency: string; }) => {
    addLead({
      type: 'Demo Request',
      name: details.name,
      email: details.email,
      agency: details.agency,
      message: details.message,
    });
  };

  return (
    <>
      <BrowserRouter>
        {/*
          ScrollToTop fires window.scrollTo(0,0) on every route change.
          BrowserRouter: all routes are now path-based (/suppliers, /pricing, etc.)
          instead of hash-based (/#/suppliers). Old /#/ links are handled by the
          redirect script in index.html.
        */}
        <ScrollToTop />
        <div className="flex flex-col min-h-screen text-brand-light">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/suppliers" element={<DirectoryPage />} />
              <Route path="/supplier/:id" element={<SupplierProfilePage />} />
              {/* Unlisted supplier preview. The token IS the credential: the row is
                  unpublished and invisible to RLS, reachable only through the
                  token-keyed RPC. Not linked from anywhere, noindex, and excluded
                  from robots.txt, the sitemap and the prerender route list. */}
              <Route path="/preview/:token" element={<SupplierProfilePage mode="preview" />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/affiliate-program" element={<AffiliateProgramPage />} />
              <Route path="/affiliate-hub/login" element={<AffiliateHubLoginPage />} />
              <Route path="/affiliate-hub" element={<AffiliateHubPage />} />
              <Route path="/supplier-portal/register" element={<SupplierRegisterPage />} />
              <Route path="/supplier-portal/login" element={<SupplierLoginPage />} />
              <Route path="/supplier-portal/dashboard" element={<SupplierDashboardPage />} />
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
                path="/affiliate-admin"
                element={
                  <ProtectedRoute>
                    <AffiliateAdminPage />
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
          {/* Persistent chat trigger on every route EXCEPT the homepage, where
              the Vee hologram in the hero is itself the entry point. */}
          <FloatingVeeWidget />
        </div>
      </BrowserRouter>
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
        onSubmit={handleContactSubmit}
      />

      <SupplierChatbot isOpen={isVeeChatOpen} onClose={closeVeeChat} />
      <CookieConsent />
    </>
  );
};


function App() {
  return (
    <AIProvider>
      <LeadProvider>
        <SupabaseAuthProvider>
          <SupplierProvider>
            <AgentProvider>
              <VeeChatProvider>
                <UIProvider>
                  <AppContent />
                </UIProvider>
              </VeeChatProvider>
            </AgentProvider>
          </SupplierProvider>
        </SupabaseAuthProvider>
      </LeadProvider>
    </AIProvider>
  );
}

export default App;
