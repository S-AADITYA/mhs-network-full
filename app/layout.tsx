import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { getNetwork } from "@/lib/data";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const display = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#07080c",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const net = await getNetwork();
  return {
    title: { default: net.network_name, template: "%s" },
    description: `${net.network_name} — specialist teams for influencer marketing, ad production, founder media and event catering across India.`,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ga4_id } = await getNetwork();
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <head>
        {/* Marks JS as available before first paint, which is what arms the
            scroll-reveal animation. Without this the content is never hidden,
            so a no-JS visitor (or a crawler) still sees the whole page. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
      </head>
      <body>
        {children}
        {ga4_id ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4_id}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${ga4_id}");`,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
