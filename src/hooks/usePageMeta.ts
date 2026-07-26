import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description?: string;
  canonical?: string;
  /**
   * Adds <meta name="robots" content="noindex,nofollow"> for pages that must stay
   * out of search results (unlisted supplier previews). Removed on unmount so a
   * client-side navigation away from the page doesn't leave the whole SPA
   * flagged noindex.
   */
  noindex?: boolean;
}

const BASE_URL = 'https://traveliq.biz';
const ROBOTS_TAG_ID = 'robots-noindex-tag';

/**
 * Sets per-page <title>, meta description, canonical link, and robots directive.
 * No external dependency — uses the existing <link id="canonical-tag"> in index.html.
 */
export function usePageMeta({ title, description, canonical, noindex }: PageMeta) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    if (description) {
      let descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.name = 'description';
        document.head.appendChild(descTag);
      }
      descTag.content = description;
    }

    // Canonical. Skipped entirely for noindex pages: a preview URL should not
    // advertise a canonical form of itself.
    if (!noindex) {
      const canonicalHref = canonical ? `${BASE_URL}${canonical}` : `${BASE_URL}${window.location.pathname}`;
      const canonicalTag = document.getElementById('canonical-tag') as HTMLLinkElement | null;
      if (canonicalTag) {
        canonicalTag.href = canonicalHref;
      }
    }

    // Robots
    if (noindex) {
      let robotsTag = document.getElementById(ROBOTS_TAG_ID) as HTMLMetaElement | null;
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.id = ROBOTS_TAG_ID;
        robotsTag.name = 'robots';
        document.head.appendChild(robotsTag);
      }
      robotsTag.content = 'noindex,nofollow';

      return () => {
        document.getElementById(ROBOTS_TAG_ID)?.remove();
      };
    }
  }, [title, description, canonical, noindex]);
}
