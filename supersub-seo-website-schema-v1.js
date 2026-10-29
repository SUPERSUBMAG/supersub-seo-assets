/*!
 * SUPERSUB — SEO Phase 1C-A: WebSite + Organization + SearchAction
 * Site-wide JSON-LD injector
 * Version: 1.1.0 (A20 Paket C: einheitliche WebSite.@id und sameAs)
 * Loaded via Webflow registered hosted script (Site Head Code).
 *
 * Behavior:
 *   - Runs once per page (window flag + data-ss-website marker).
 *   - Skips injection if a WebSite block already exists in the DOM
 *     (transition phase: Home Page Head Code still owns one).
 *   - Detects locale from <html lang> with URL path fallback ("de" default).
 *   - Injects an @graph with Organization + WebSite linked via @id.
 *   - WebSite.@id is site-wide (https://supersubmag.com/#website), identical
 *     to the Home schema and all isPartOf references; url/inLanguage stay
 *     locale-specific.
 *   - SearchAction target stays locale-aware.
 *   - sameAs lists only verified live SUPERSUB social URLs.
 *
 * Does NOT touch any other DOM nodes. Does NOT remove existing JSON-LD.
 */
(function () {
  if (window.__supersubWsInjected) return;
  window.__supersubWsInjected = true;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    try {
      // Defensive: skip if our own block already injected.
      if (document.querySelector('script[type="application/ld+json"][data-ss-website]')) return;

      // Skip if another WebSite block exists (Home transition: legacy Home Page Head Code block).
      var existing = Array.prototype.slice.call(
        document.querySelectorAll('script[type="application/ld+json"]')
      );
      for (var i = 0; i < existing.length; i++) {
        try {
          var raw = existing[i].textContent || existing[i].text || "";
          var obj = JSON.parse(raw);
          var t = obj["@type"];
          if (t === "WebSite" || (Array.isArray(t) && t.indexOf("WebSite") !== -1)) return;
          if (obj["@graph"]) {
            for (var k = 0; k < obj["@graph"].length; k++) {
              var node = obj["@graph"][k] || {};
              var gt = node["@type"];
              if (gt === "WebSite" || (Array.isArray(gt) && gt.indexOf("WebSite") !== -1)) return;
            }
          }
        } catch (e) { /* unparseable block: ignore */ }
      }

      // Locale: <html lang> primary, URL path fallback, "de" default.
      function detectLocale() {
        var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
        if (lang.indexOf("en") === 0) return "en";
        if (lang.indexOf("es") === 0) return "es";
        if (lang.indexOf("de") === 0) return "de";
        var p = location.pathname;
        if (p === "/en" || p.indexOf("/en/") === 0) return "en";
        if (p === "/es" || p.indexOf("/es/") === 0) return "es";
        return "de";
      }

      var LOCALE_MAP = {
        de: {
          inLanguage: "de-DE",
          homeUrl:    "https://supersubmag.com/de/",
          searchUrl:  "https://supersubmag.com/de/search?query={search_term_string}",
          description:"SUPERSUB ist das deutschsprachige Editorial-Medium für Fußballkultur: Drops, Fashion, Lifestyle und Selected Longreads."
        },
        en: {
          inLanguage: "en-GB",
          homeUrl:    "https://supersubmag.com/en/",
          searchUrl:  "https://supersubmag.com/en/search?query={search_term_string}",
          description:"SUPERSUB is an editorial platform for football culture: drops, fashion, lifestyle and selected longreads."
        },
        es: {
          inLanguage: "es-ES",
          homeUrl:    "https://supersubmag.com/es/",
          searchUrl:  "https://supersubmag.com/es/search?query={search_term_string}",
          description:"SUPERSUB es una plataforma editorial de cultura futbolística: drops, moda, lifestyle y longreads seleccionados."
        }
      };

      var L = LOCALE_MAP[detectLocale()] || LOCALE_MAP.de;

      var ld = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://supersubmag.com/#organization",
            "name": "SUPERSUB",
            "alternateName": "SUPERSUB Magazine",
            "url": "https://supersubmag.com/",
            "logo": {
              "@type": "ImageObject",
              "url": "https://cdn.prod.website-files.com/695fbd84a9d487b3531dc88b/69c133a2443aeaf7df580f33_supersub-logo.png"
            },
            "sameAs": [
              "https://www.instagram.com/supersubmag/",
              "https://www.tiktok.com/@supersubmag",
              "https://x.com/SUPERSUB_MAG",
              "https://www.facebook.com/p/SUPERSUB-61591167715180/",
              "https://www.linkedin.com/company/supersubmag"
            ]
          },
          {
            "@type": "WebSite",
            "@id": "https://supersubmag.com/#website",
            "name": "SUPERSUB",
            "alternateName": "SUPERSUB Magazine",
            "url": L.homeUrl,
            "inLanguage": L.inLanguage,
            "description": L.description,
            "publisher": { "@id": "https://supersubmag.com/#organization" },
            "potentialAction": {
              "@type": "SearchAction",
              "target": L.searchUrl,
              "query-input": "required name=search_term_string"
            }
          }
        ]
      };

      var s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-ss-website", "1");
      s.text = JSON.stringify(ld);
      document.head.appendChild(s);
    } catch (e) {
      if (window.console && console.warn) console.warn("SUPERSUB WebSite JSON-LD skipped:", e);
    }
  });
})();
