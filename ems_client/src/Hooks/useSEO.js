import { useEffect } from 'react';

/**
 * Custom hook for dynamic on-page SEO management in Single Page Applications (SPA).
 * Updates title, meta tags, OpenGraph, Twitter card, canonical URL, and JSON-LD structured data.
 *
 * @param {Object} options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description (recommended: 140-160 chars)
 * @param {string} [options.keywords] - Comma-separated SEO keywords
 * @param {string} [options.canonical] - Full canonical URL
 * @param {string} [options.ogImage] - Social share preview image URL
 * @param {string} [options.ogType] - 'website' | 'article' | 'event'
 * @param {Object} [options.structuredData] - Schema.org JSON-LD object for rich snippets
 */
export default function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  structuredData,
} = {}) {
  useEffect(() => {
    // 1. Dynamic Page Title
    const baseTitle = 'AVISHKAAR — Collegiate Event Management Platform';
    const finalTitle = title ? `${title} | AVISHKAAR` : baseTitle;
    document.title = finalTitle;

    // Helper to safely set or create a <meta> tag
    const setMeta = (attrName, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Primary Meta Tags
    if (description) {
      setMeta('name', 'description', description);
    }
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // 3. Canonical Link
    const currentUrl = canonical || window.location.href.split('?')[0];
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', currentUrl);

    // 4. OpenGraph (Facebook, LinkedIn, WhatsApp, Slack)
    setMeta('property', 'og:title', title || baseTitle);
    if (description) setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:type', ogType);
    if (ogImage) {
      setMeta('property', 'og:image', ogImage);
    }

    // 5. Twitter Card
    setMeta('name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', title || baseTitle);
    if (description) setMeta('name', 'twitter:description', description);
    if (ogImage) setMeta('name', 'twitter:image', ogImage);

    // 6. JSON-LD Structured Data Injection for Google Rich Snippets
    let scriptEl = document.getElementById('seo-structured-data');
    if (structuredData) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'seo-structured-data';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(structuredData);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, keywords, canonical, ogImage, ogType, structuredData]);
}

