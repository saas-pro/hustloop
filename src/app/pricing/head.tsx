export default function Head() {
  
  const canonical = 'https://hustloop.com/pricing';
  const siteName = 'Hustloop';
  const title = 'Pricing — Hustloop';
  const description = 'Explore Hustloop plans: Free, Standard, Premium and Enterprise. Choose the best plan for your startup — transparent pricing, flexible features, and priority support.';
  const ogImage = 'https://hustloop.com/logo.png';
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Hustloop Pricing Plans",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Free",
        "price": "0",
        "priceCurrency": "INR",
        "description": "Kickstart with technology discovery and foundational support at no cost."
      },
      {
        "@type": "Offer",
        "name": "Standard",
        "price": "999",
        "priceCurrency": "INR",
        "description": "Accelerate incubation with full access and priority support."
      },
      {
        "@type": "Offer",
        "name": "Premium",
        "price": "2999",
        "priceCurrency": "INR",
        "description": "Solve MSME challenges with submissions and 24/7 priority support."
      }
    ]
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
