import Script from "next/script";
import {
  GA4_ID,
  GOOGLE_ADS_ID,
  META_PIXEL_ID,
  hasGtag,
  hasMetaPixel,
} from "@/lib/marketing";

/**
 * Marketing tags. Each block renders only when its id is configured, so an
 * unconfigured site ships no third-party script at all.
 *
 * GA4 and Google Ads both run on gtag, so the library loads once and each
 * destination is configured against it.
 */
export default function Tags() {
  return (
    <>
      {hasGtag() ? (
        <>
          <Script
            id="gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID || GOOGLE_ADS_ID}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              ${GA4_ID ? `gtag('config', '${GA4_ID}');` : ""}
              ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
            `}
          </Script>
        </>
      ) : null}

      {hasMetaPixel() ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
