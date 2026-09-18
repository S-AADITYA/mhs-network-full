"use client";

import {
  GOOGLE_ADS_ID,
  GOOGLE_ADS_LEAD_LABEL,
  type LeadEvent,
} from "@/lib/marketing";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Reports a submitted lead to every configured ad platform.
 *
 * Called only after the server has confirmed the lead was saved, so the
 * conversion count matches the leads in the database rather than counting
 * attempts. Wrapped so a blocked tracker can never break the form.
 */
export function trackLead(lead: LeadEvent): void {
  if (typeof window === "undefined") return;

  try {
    // GA4: a generate_lead event, with the page's own dimensions so you can
    // see which service and city actually convert.
    window.gtag?.("event", "generate_lead", {
      brand: lead.brand,
      service: lead.service,
      city: lead.city,
    });

    // Google Ads: the conversion action itself.
    if (GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL) {
      window.gtag?.("event", "conversion", {
        send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}`,
      });
    }

    // Meta: the standard Lead event, which its optimisation bids against.
    window.fbq?.("track", "Lead", {
      content_name: `${lead.service} — ${lead.city}`,
      content_category: lead.brand,
    });
  } catch {
    // Never let a tracking failure surface to the visitor.
  }
}
