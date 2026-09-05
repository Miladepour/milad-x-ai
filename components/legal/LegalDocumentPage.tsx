import PageBreadcrumb, { type PageBreadcrumbItem } from "@/components/layout/PageBreadcrumb";

interface LegalDocumentPageProps {
  html: string;
  dir?: "ltr" | "rtl";
  breadcrumbAria?: string;
  breadcrumbItems?: PageBreadcrumbItem[];
}

export default function LegalDocumentPage({
  html,
  dir = "ltr",
  breadcrumbAria,
  breadcrumbItems,
}: LegalDocumentPageProps) {
  return (
    <div className="flex-1 w-full bg-background text-cream">
      <article
        className="mx-auto w-full max-w-3xl px-8 pb-24 pt-32 md:px-12 lg:px-16"
        dir={dir}
      >
        {breadcrumbAria && breadcrumbItems ? (
          <PageBreadcrumb
            ariaLabel={breadcrumbAria}
            className="mb-10"
            items={breadcrumbItems}
          />
        ) : null}
        <div className="legal-content" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
