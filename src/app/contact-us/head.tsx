export default function Head() {
  const canonical = 'https://hustloop.com/contact-us';
  const siteName = 'Hustloop';
  const title = 'Contact Us — Hustloop';
  const description = "Contact Hustloop for support, partnerships and general inquiries. Email us at support@hustloop.com or use the contact form to get in touch.";
  const ogImage = 'https://hustloop.com/logo.png';  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": siteName,
      "url": "https://hustloop.com",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "telephone": "",
          "email": "support@hustloop.com"
        }
      ]
    }
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow" />

      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
