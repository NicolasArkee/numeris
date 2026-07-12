import type { Metadata } from "next";
import { Inter_Tight, Inter, JetBrains_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppConfig } from "@/utils/AppConfig";
import { SiteHeader } from "@/components/header/SiteHeader";
import { Footer } from "@/components/Footer";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(AppConfig.url),
  title: {
    default: `${AppConfig.name} — ${AppConfig.tagline}`,
    template: `%s | ${AppConfig.name}`,
  },
  description: AppConfig.description,
  openGraph: {
    type: "website",
    locale: AppConfig.locale,
    url: AppConfig.url,
    siteName: AppConfig.name,
    title: `${AppConfig.name} — ${AppConfig.tagline}`,
    description: AppConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${AppConfig.name} — ${AppConfig.tagline}`,
    description: AppConfig.description,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${interTight.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <SiteHeader />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
