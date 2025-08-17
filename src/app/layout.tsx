import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/Toast'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'PartsFlow - Premium Auto Parts',
    template: '%s | PartsFlow',
  },
  description: 'Find and order premium auto parts with our VIN-based search system. Fast delivery, competitive prices, and expert support.',
  keywords: ['auto parts', 'car parts', 'VIN search', 'automotive', 'parts catalog'],
  authors: [{ name: 'PartsFlow Team' }],
  creator: 'PartsFlow',
  publisher: 'PartsFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: '/',
    title: 'PartsFlow - Premium Auto Parts',
    description: 'Find and order premium auto parts with our VIN-based search system. Fast delivery, competitive prices, and expert support.',
    siteName: 'PartsFlow',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PartsFlow - Premium Auto Parts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PartsFlow - Premium Auto Parts',
    description: 'Find and order premium auto parts with our VIN-based search system. Fast delivery, competitive prices, and expert support.',
    images: ['/og-image.jpg'],
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PartsFlow" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-bg text-text">
            {children}
          </div>
          <Toaster />
        </Providers>

        {/* JSON-LD Structured Data */}
        <OrganizationJsonLd
          name="PartsFlow"
          url={baseUrl}
          logo={`${baseUrl}/logo.svg`}
          description="Premium auto parts with VIN-based precision matching. Find and order the right parts for your vehicle with competitive pricing and expert support."
          address={{
            streetAddress: "123 Auto Parts Street",
            addressLocality: "Warsaw",
            addressRegion: "Mazowieckie",
            postalCode: "00-001",
            addressCountry: "PL"
          }}
          contactPoint={{
            telephone: "+48-123-456-789",
            contactType: "customer service",
            availableLanguage: ["Polish", "English"]
          }}
        />

        <WebsiteJsonLd
          name="PartsFlow - Premium Auto Parts"
          url={baseUrl}
          description="Find and order premium auto parts with our VIN-based search system. Fast delivery, competitive prices, and expert support guaranteed."
          potentialAction={{
            target: `${baseUrl}/wizard?vin={search_term_string}`,
            queryInput: "required name=search_term_string"
          }}
        />
      </body>
    </html>
  )
}
