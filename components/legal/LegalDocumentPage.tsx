interface LegalDocumentPageProps {
  html: string;
  dir?: "ltr" | "rtl";
}

export default function LegalDocumentPage({ html, dir = "ltr" }: LegalDocumentPageProps) {
  return (
    <div className="flex-1 w-full bg-background text-cream">
      <article
        className="mx-auto w-full max-w-3xl px-8 pb-24 pt-32 md:px-12 lg:px-16"
        dir={dir}
      >
        <div className="legal-content" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
