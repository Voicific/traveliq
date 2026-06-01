/**
 * CookieConsent
 *
 * GDPR / UK GDPR compliant cookie consent banner for TravelIQ.
 *
 * Behaviour:
 * - Reject-by-default: until the user makes an explicit choice, only strictly
 *   necessary cookies are treated as allowed. Analytics and marketing default
 *   to OFF.
 * - Granular opt-in: the user can accept all, reject all (non-essential), or
 *   open "Manage preferences" to toggle Analytics / Marketing individually.
 * - Persisted: the decision is stored in localStorage and the banner does not
 *   reappear until consent is reset or the stored version changes.
 * - Re-openable: any element can dispatch
 *     window.dispatchEvent(new Event('traveliq:open-cookie-settings'))
 *   to bring the preferences panel back (used by the footer "Cookie
 *   preferences" link).
 *
 * Nothing tracking-related is loaded by the app today, so there is no script to
 * block yet. When analytics/marketing scripts are added, gate them on
 * `hasConsent('analytics')` / `hasConsent('marketing')` and listen for the
 * 'traveliq:cookie-consent-changed' event to react to later changes.
 */

import React, { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Consent model + persistence helpers
// ---------------------------------------------------------------------------

export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookieConsentState {
  version: number;
  necessary: true; // always on, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'traveliq_cookie_consent';
const CONSENT_VERSION = 1;
const OPEN_EVENT = 'traveliq:open-cookie-settings';
const CHANGED_EVENT = 'traveliq:cookie-consent-changed';

const readConsent = (): CookieConsentState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (parsed.version !== CONSENT_VERSION) return null; // re-prompt on policy change
    return parsed;
  } catch {
    return null;
  }
};

const writeConsent = (state: CookieConsentState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode etc.) — consent simply isn't persisted */
  }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: state }));
};

/**
 * Check whether the user has granted consent for a given category.
 * `necessary` is always true. Until an explicit choice is made, non-essential
 * categories return false (reject-by-default).
 */
export const hasConsent = (category: CookieCategory): boolean => {
  if (category === 'necessary') return true;
  const consent = readConsent();
  if (!consent) return false;
  return Boolean(consent[category]);
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // On mount: show the banner only if no valid consent has been stored.
  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }

    const reopen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const persist = (analyticsValue: boolean, marketingValue: boolean) => {
    writeConsent({
      version: CONSENT_VERSION,
      necessary: true,
      analytics: analyticsValue,
      marketing: marketingValue,
      timestamp: new Date().toISOString(),
    });
    setVisible(false);
    setShowDetails(false);
  };

  const acceptAll = () => persist(true, true);
  const rejectAll = () => persist(false, false);
  const savePreferences = () => persist(analytics, marketing);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className="fixed bottom-4 left-4 right-4 sm:right-auto z-[80] w-auto sm:max-w-md animate-fade-in"
    >
      <div className="bg-gradient-to-br from-[#0f1c2e] to-[#0d2d3d] border border-cyan-400/20 rounded-xl shadow-2xl p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-cyan-400/10 border border-white/10">
            <Cookie size={20} strokeWidth={1.5} className="text-cyan-400" />
          </div>
          <div className="flex-grow">
            <h2 className="font-bold text-white text-base">We value your privacy</h2>
            <p className="mt-1 text-sm text-gray-300 leading-relaxed">
              We use strictly necessary cookies to make TravelIQ work. With your
              permission, we&apos;d also like to use optional cookies to understand how
              the site is used and to improve it. You can change your choice at any
              time from the footer.
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 space-y-3 border-t border-cyan-400/10 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Strictly necessary</p>
                <p className="text-xs text-gray-400">Required for the site to function. Always on.</p>
              </div>
              <span className="text-xs font-semibold text-cyan-300 mt-0.5">Always on</span>
            </div>

            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white">Analytics</p>
                <p className="text-xs text-gray-400">Helps us understand usage so we can improve the site.</p>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 h-4 w-4 accent-cyan-400 flex-shrink-0"
              />
            </label>

            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-white">Marketing</p>
                <p className="text-xs text-gray-400">Used to measure and improve our campaigns.</p>
              </div>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-1 h-4 w-4 accent-cyan-400 flex-shrink-0"
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={acceptAll}
            className="flex-1 min-w-[120px] bg-cyan-400 hover:opacity-90 text-[#0a1628] font-bold text-sm py-2 px-3 rounded-md transition-opacity"
          >
            Accept all
          </button>
          <button
            onClick={rejectAll}
            className="flex-1 min-w-[120px] border border-cyan-400/30 hover:border-cyan-400/60 text-gray-200 font-semibold text-sm py-2 px-3 rounded-md transition-colors"
          >
            Reject all
          </button>
          {showDetails ? (
            <button
              onClick={savePreferences}
              className="flex-1 min-w-[120px] border border-cyan-400/30 hover:border-cyan-400/60 text-gray-200 font-semibold text-sm py-2 px-3 rounded-md transition-colors"
            >
              Save preferences
            </button>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 min-w-[120px] text-cyan-300 hover:text-cyan-200 font-semibold text-sm py-2 px-3 rounded-md transition-colors"
            >
              Manage preferences
            </button>
          )}
        </div>

        {showDetails && (
          <button
            onClick={() => setShowDetails(false)}
            aria-label="Close preferences"
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
