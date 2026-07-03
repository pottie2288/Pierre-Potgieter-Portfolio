import type { Metadata } from "next";
import { Outfit, DM_Mono } from "next/font/google";
import "./globals.css";

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
  title: "Pierre Potgieter | Design that Speaks",
  description:
    "Brand identity and web design portfolio of Pierre Potgieter — strategy-led, distinctive design work for real clients.",
  keywords: [
    "brand identity",
    "web design",
    "freelance designer",
    "portfolio",
    "South Africa designer",
    "startup branding",
  ],
  openGraph: {
    title: "Pierre Potgieter | Design that Speaks",
    description:
      "Brand identity and web design portfolio of Pierre Potgieter — strategy-led, distinctive design work for real clients.",
    url: "https://pierrepotgieter.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pierre Potgieter | Design that Speaks",
    description:
      "Brand identity and web design portfolio of Pierre Potgieter.",
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
      <body>{children}</body>
    </html>
  );
}
