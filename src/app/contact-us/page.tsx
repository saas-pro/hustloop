import { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: 'Contact Us — Hustloop',
  description: "Contact Hustloop for support, partnerships and general inquiries.",
  alternates: {
    canonical: 'https://hustloop.com/contact-us',
  },
  robots: 'index, follow',
  openGraph: {
    siteName: 'Hustloop',
    title: 'Contact Us — Hustloop',
    description: "Contact Hustloop for support, partnerships and general inquiries.",
    type: 'website',
    url: 'https://hustloop.com/contact-us',
    images: ['https://hustloop.com/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — Hustloop',
    description: "Contact Hustloop for support, partnerships and general inquiries.",
    images: ['https://hustloop.com/logo.png'],
  },
};

export default function Page() {
  return (
    <>
      <ContactClient />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "mainEntity": {
              "@type": "Organization",
              "name": "Hustloop",
              "url": "https://hustloop.com",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "contactType": "customer support",
                  "email": "support@hustloop.com"
                }
              ]
            }
          })
        }}
      />
    </>
  );
}
