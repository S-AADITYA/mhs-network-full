/**
 * Marketing tag configuration.
 *
 * Every id is optional: a tag that has no id is simply not rendered, so the
 * site runs clean with none of them set and starts reporting the moment you
 * add one in Vercel's environment variables.
 */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";

/** Meta (Facebook/Instagram) pixel id — a long number. */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/** Google Ads conversion id, in the form AW-XXXXXXXXX. */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";

/**
 * Google Ads conversion label for the lead action, from the conversion action
 * screen. Without it, Google Ads records page views but no conversions.
 */
export const GOOGLE_ADS_LEAD_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL ?? "";

export const hasGa4 = () => Boolean(GA4_ID);
export const hasMetaPixel = () => Boolean(META_PIXEL_ID);
export const hasGoogleAds = () => Boolean(GOOGLE_ADS_ID);

/** True when any gtag-based tag is configured (GA4 and Google Ads share gtag). */
export const hasGtag = () => hasGa4() || hasGoogleAds();

export interface LeadEvent {
  brand: string;
  service: string;
  city: string;
}
