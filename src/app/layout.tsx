import type { Metadata } from "next";
import { Cormorant, Outfit } from "next/font/google";
import "./globals.css";
import { AppConfig } from "@/utils/AppConfig";

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(AppConfig.url),
  title: {
    default: `${AppConfig.name} ${AppConfig.tagline} | Cabinet comptable Paris`,
    template: `%s | ${AppConfig.name} ${AppConfig.tagline}`,
  },
  description: AppConfig.description,
  openGraph: {
    type: "website",
    locale: AppConfig.locale,
    url: AppConfig.url,
    siteName: `${AppConfig.name} ${AppConfig.tagline}`,
    title: `${AppConfig.name} — ${AppConfig.tagline}`,
    description: AppConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${AppConfig.name} — ${AppConfig.tagline}`,
    description: AppConfig.description,
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
    <html lang="fr" className={`${cormorant.variable} ${outfit.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
