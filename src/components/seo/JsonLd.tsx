import { ReactNode } from "react"

interface JsonLdProps {
  data: Record<string, any>
  children?: ReactNode
}

export function JsonLd({ data, children }: JsonLdProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data),
        }}
      />
      {children}
    </>
  )
}

// Organization JSON-LD
interface OrganizationJsonLdProps {
  name: string
  url: string
  logo: string
  description: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  contactPoint: {
    telephone: string
    contactType: string
    availableLanguage: string[]
  }
}

export function OrganizationJsonLd({
  name,
  url,
  logo,
  description,
  address,
  contactPoint
}: OrganizationJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    address: {
      "@type": "PostalAddress",
      ...address
    },
    contactPoint: {
      "@type": "ContactPoint",
      ...contactPoint
    }
  }

  return <JsonLd data={data} />
}

// Website JSON-LD
interface WebsiteJsonLdProps {
  name: string
  url: string
  description: string
  potentialAction: {
    target: string
    queryInput: string
  }
}

export function WebsiteJsonLd({
  name,
  url,
  description,
  potentialAction
}: WebsiteJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      ...potentialAction
    }
  }

  return <JsonLd data={data} />
}




