import type { Metadata } from "next";
import { Inter_Tight, Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppConfig } from "@/utils/AppConfig";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ReadingProgress } from "@/components/layout/ReadingProgress";
import { BriefDialog } from "@/components/journey/BriefDialog";
import { JourneyResume } from "@/components/journey/JourneyResume";
// Loading the registry at the application boundary runs its fail-fast schema
// assertion before any V2 template can render.
import "@/libs/skoria-v2/registry";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

const instrumentSerif = localFont({
  src: [
    {
      path: "./fonts/instrument-serif-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/instrument-serif-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
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
      data-scroll-behavior="smooth"
      className={`${interTight.variable} ${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="antialiased">
        <a href="#main-content" className="sk-skip-link">
          Aller au contenu
        </a>
        <ReadingProgress />
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <SiteFooter />
        <BriefDialog />
        <JourneyResume />
      </body>
    </html>
  );
}
