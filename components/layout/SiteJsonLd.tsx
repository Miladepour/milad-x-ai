export default function SiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Milad Pour",
    alternateName: "Milad X AI",
    url: "https://mxaiacademy.com",
    jobTitle: "AI Artist & Educator",
    description:
      "AI content creation educator offering live workshops, private courses, and creative collaboration for brands and creators.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Manchester",
      addressCountry: "GB",
    },
    sameAs: [
      "https://www.instagram.com/miladxaitalks/",
      "https://www.linkedin.com/in/milad-epour/",
      "https://www.youtube.com/@miladxtalks",
    ],
    knowsAbout: [
      "AI content creation",
      "Prompt engineering",
      "AI image generation",
      "AI video production",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
