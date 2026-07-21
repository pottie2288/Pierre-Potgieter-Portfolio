import type { Metadata } from "next";
import { Outfit, DM_Mono } from "next/font/google";
import ClickSpark from "@/components/ClickSpark";
import BackgroundMusic from "@/components/BackgroundMusic";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/portrait.png`,
  jobTitle: "Brand Identity & Web Designer",
  description:
    "Independent brand identity and web designer building distinctive digital experiences for brands across South Africa and beyond.",
  sameAs: ["https://www.instagram.com/pierre_potgieter1"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: `${SITE_NAME} | Design that Speaks`,
  url: SITE_URL,
};

const outfit = Outfit({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Pierre Potgieter | Design that Speaks",
  description:
    "Brand identity and web design portfolio of Pierre Potgieter — strategy-led, distinctive design work for real clients.",
  keywords: [
    "Pierre Potgieter",
    "brand identity",
    "web design",
    "freelance designer",
    "portfolio",
    "South Africa designer",
    "startup branding",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Pierre Potgieter | Design that Speaks",
    description:
      "Brand identity and web design portfolio of Pierre Potgieter — strategy-led, distinctive design work for real clients.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 2000,
        height: 2000,
        alt: "Pierre Potgieter — Design that Speaks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pierre Potgieter | Design that Speaks",
    description:
      "Brand identity and web design portfolio of Pierre Potgieter.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <ClickSpark sparkColor="#cfff6a" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
          {children}
        </ClickSpark>
        <BackgroundMusic src="/audio/background.mp3" />
      </body>
    </html>
  );
}
