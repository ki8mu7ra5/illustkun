import type { Metadata } from "next";
import Script from "next/script";
import { GaConfigWarning, GtagRouteChange } from "./components/gtag-route-change";
import { getGaMeasurementId } from "./lib/analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "イラストくん - 世界の誰か1人にだけ刺さるイラスト集",
  description: "世界の誰か1人にだけ刺さるイラスト集。AIがその場で生成。無料・商用利用OK。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = getGaMeasurementId();

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <GaConfigWarning />
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  send_page_view: true,
                  page_path: window.location.pathname + window.location.search,
                });
              `}
            </Script>
            <GtagRouteChange gaId={gaId} />
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
