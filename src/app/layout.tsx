import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/Toast'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Kup Tanie Części - Tanie Części Samochodowe',
    template: '%s | Kup Tanie Części',
  },
  description: 'Znajdź i zamów tanie części samochodowe dzięki naszemu systemowi wyszukiwania opartemu na VIN. Szybka dostawa, konkurencyjne ceny i eksperckie wsparcie.',
  keywords: ['części samochodowe', 'tanie części', 'wyszukiwanie VIN', 'motoryzacja', 'katalog części'],
  authors: [{ name: 'Zespół Kup Tanie Części' }],
  creator: 'Kup Tanie Części',
  publisher: 'Kup Tanie Części',
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
    title: 'Kup Tanie Części - Tanie Części Samochodowe',
    description: 'Znajdź i zamów tanie części samochodowe dzięki naszemu systemowi wyszukiwania opartemu na VIN. Szybka dostawa, konkurencyjne ceny i eksperckie wsparcie.',
    siteName: 'Kup Tanie Części',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kup Tanie Części - Tanie Części Samochodowe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kup Tanie Części - Tanie Części Samochodowe',
    description: 'Znajdź i zamów tanie części samochodowe dzięki naszemu systemowi wyszukiwania opartemu na VIN. Szybka dostawa, konkurencyjne ceny i eksperckie wsparcie.',
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
        <meta name="apple-mobile-web-app-title" content="Kup Tanie Części" />
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
          name="Kup Tanie Części"
          url={baseUrl}
          logo={`${baseUrl}/logo.svg`}
          description="Tanie części samochodowe z precyzyjnym dopasowaniem opartym na VIN. Znajdź i zamów odpowiednie części do swojego pojazdu w konkurencyjnych cenach z eksperckim wsparciem."
          address={{
            streetAddress: "ul. Części Samochodowych 123",
            addressLocality: "Warszawa",
            addressRegion: "Mazowieckie",
            postalCode: "00-001",
            addressCountry: "PL"
          }}
          contactPoint={{
            telephone: "+48-123-456-789",
            contactType: "obsługa klienta",
            availableLanguage: ["Polski", "Angielski"]
          }}
        />

        <WebsiteJsonLd
          name="Kup Tanie Części - Tanie Części Samochodowe"
          url={baseUrl}
          description="Znajdź i zamów tanie części samochodowe dzięki naszemu systemowi wyszukiwania opartemu na VIN. Szybka dostawa, konkurencyjne ceny i eksperckie wsparcie gwarantowane."
          potentialAction={{
            target: `${baseUrl}/wizard?vin={search_term_string}`,
            queryInput: "required name=search_term_string"
          }}
        />
      </body>
    </html>
  )
}
