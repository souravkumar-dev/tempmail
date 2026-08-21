import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MailGhost – Disposable Temporary Email for OTP Verification",
    template: "%s | MailGhost",
  },
  description:
    "Get instant disposable email addresses for OTP verification, sign-ups, and privacy protection. No sign-up required. Free and secure. Works with any website.",
  keywords: [
    "temporary email",
    "disposable email",
    "OTP verification",
    "fake email",
    "privacy email",
    "burner email",
    "temp mail",
    "throwaway email",
    "email generator",
    "anonymous email",
  ],
  authors: [{ name: "MailGhost" }],
  creator: "MailGhost",
  metadataBase: new URL("https://mailghost.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mailghost.app",
    title: "MailGhost – Disposable Temporary Email for OTP Verification",
    description:
      "Get instant disposable email addresses for OTP verification, sign-ups, and privacy protection. No sign-up required. Free and secure.",
    siteName: "MailGhost",
  },
  twitter: {
    card: "summary_large_image",
    title: "MailGhost – Disposable Temporary Email for OTP Verification",
    description:
      "Get instant disposable email addresses for OTP verification, sign-ups, and privacy protection. No sign-up required.",
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

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
