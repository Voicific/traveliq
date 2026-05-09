/**
 * ScrollToTop
 *
 * Resets the window scroll position to the top whenever the route changes.
 * Place this as the first child inside <HashRouter> in App.tsx so it fires
 * before any page renders.
 *
 * Why this is needed: React Router's HashRouter does not restore scroll
 * position between navigations by default. Without this, navigating from
 * a scrolled page (e.g. Home) to /affiliate-program or /supplier-portal
 * leaves the user mid-page on arrival.
 */

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
