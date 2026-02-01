import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalPlayerProvider } from "@/components/GlobalPlayerContext"
import { StickyPlayer } from "@/components/StickyPlayer"
import { StructuredData } from "@/components/structured-data"
import { WebVitals } from "@/components/web-vitals"
import "./globals.css"

export const metadata: Metadata = {
  title: "SynthopiaScale Records - Independent Electronic Arts & Sound",
  description:
    "Independent music label and collective. Artist-run platform featuring unique electronic artists, high-quality releases, and shared infrastructure. Discover cutting-edge electronic music, sample packs, and innovative sound design.",
  keywords: [
    "electronic music", 
    "independent label", 
    "music collective", 
    "techno", 
    "electronic artists",
    "sample packs",
    "music production",
    "sound design",
    "independent music",
    "electronic label",
    "music distribution",
    "artist collective",
    "electronic releases",
    "music production tools"
  ],
  authors: [{ name: "SynthopiaScale Records" }],
  creator: "SynthopiaScale Records",
  publisher: "SynthopiaScale Records",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "SynthopiaScale Records - Independent Electronic Arts & Sound",
    description:
      "Independent music label and collective. Artist-run platform featuring unique electronic artists, high-quality releases, and shared infrastructure.",
    type: "website",
    siteName: "SynthopiaScale Records",
    locale: "en_US",
    url: "https://synthopiascale.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "SynthopiaScale Records",
    description: "Independent Electronic Arts & Sound - Discover unique electronic artists and high-quality releases",
    site: "@synthopiascale",
  },
  alternates: {
    canonical: "https://synthopiascale.com",
  },
  verification: {
    google: "verification_token_here",
  },
}

export const viewport: Viewport = {
  themeColor: "#0f1114",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://sebsizz.gumroad.com" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalPlayerProvider>
            <StructuredData />
            <WebVitals />
            {children}
            <StickyPlayer />
            <Analytics />
          </GlobalPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
