"use client"

import { useEffect } from "react"
import { 
  generateOrganizationSchema, 
  generateWebSiteSchema,
} from "@/lib/seo"

interface StructuredDataProps {
  additionalSchemas?: Record<string, unknown>[]
}

export function StructuredData({ additionalSchemas = [] }: StructuredDataProps) {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = []

    const organizationSchema = {
      ...generateOrganizationSchema({
        name: "SynthopiaScale Records",
        url: "https://synthopiascale.com",
        logo: "https://synthopiascale.com/logo.png",
        description: "Independent music label and collective. Artist-run platform featuring unique electronic artists, high-quality releases, and shared infrastructure.",
        email: "contact@synthopiascale.com",
        socialLinks: [
          "https://twitter.com/synthopiascale",
          "https://instagram.com/synthopiascale",
          "https://facebook.com/synthopiascale"
        ],
      }),
      foundingDate: "2023",
      founder: {
        "@type": "Person",
        name: "Dr. SebSizz"
      },
      genre: ["Electronic Music", "Techno", "House", "Experimental"],
    }

    const websiteSchema = generateWebSiteSchema({
      name: "SynthopiaScale Records",
      url: "https://synthopiascale.com",
      description: "Independent music label and collective featuring electronic artists and sample packs.",
    })

    const allSchemas = [organizationSchema, websiteSchema, ...additionalSchemas]

    allSchemas.forEach((schema, index) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = `structured-data-${index}`
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
      scripts.push(script)
    })

    return () => {
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      })
    }
  }, [additionalSchemas])

  return null
}
