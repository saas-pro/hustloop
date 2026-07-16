import { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: 'Contact Us - Hustloop',
  description: "Contact Hustloop for support, partnerships, collaborations, and general inquiries. Our team is here to help startups, innovators, and organizations connect with the right solutions.",
  keywords: [
    'contact hustloop',
    'hustloop support',
    'hustloop partnerships',
    'innovation platform contact',
    'startup collaboration support',
    'customer support hustloop'
  ],
  authors: [{ name: 'Hustloop' }],
  creator: 'Hustloop',
  publisher: 'Hustloop',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Contact Us - Hustloop',
    description: "Contact Hustloop for support, partnerships, collaborations, and general inquiries. Our team is here to help startups, innovators, and organizations connect with the right solutions.",
    url: 'https://hustloop.com/contact-us',
    siteName: 'Hustloop',
    images: [
      {
        url: 'https://hustloop.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'Hustloop Contact Us',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - Hustloop',
    description: "Contact Hustloop for support, partnerships, collaborations, and general inquiries.",
    images: ['https://hustloop.com/logo.png'],
    creator: '@hustloop',
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
  alternates: {
    canonical: 'https://hustloop.com/contact-us',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: 'Contact Us - Hustloop',
            description: 'Contact Hustloop for support, partnerships, collaborations, and general inquiries.',
            url: 'https://hustloop.com/contact-us',
            mainEntity: {
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
      <ContactClient />
    </>
  );
}
