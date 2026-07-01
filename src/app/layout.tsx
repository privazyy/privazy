import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://privazy.pl"),
  title: {
    default: "privazy. - RODO dla firm bez chaosu",
    template: "%s | privazy.",
  },
  description: "Checker IOD, dokumentacja RODO, audyty, outsourcing IOD i obsługa incydentów dla firm w Polsce.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    locale: "pl_PL",
    siteName: "privazy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
