import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description?: string;
  canonical?: string;
}

const BASE_URL = 'https://traveliq.biz';

/**
 * Sets per-page <title>, meta description, and canonical link.
 * No external dependency — uses the existing <link id="canonical-tag"> in index.html.
 */
export function usePageMeta({ title, description, canonical }: PageMeta) {
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

    // Canonical
    const canonicalHref = canonical ? `${BASE_URL}${canonical}` : `${BASE_URL}${window.location.pathname}`;
    const canonicalTag = document.getElementById('canonical-tag') as HTMLLinkElement | null;
    if (canonicalTag) {
      canonicalTag.href = canonicalHref;
    }
  }, [title, description, canonical]);
}
