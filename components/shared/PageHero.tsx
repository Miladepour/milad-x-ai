import type { ReactNode } from "react";
import Image from "next/image";

interface PageHeroProps {
  src: string;
  alt: string;
  children: ReactNode;
}

export default function PageHero({ src, alt, children }: PageHeroProps) {
  return (
    <section className="relative isolate w-full overflow-hidden min-h-[calc(100vw*9/21)]">
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,13,13,0.66) 0%, rgba(13,13,13,0.52) 20%, rgba(13,13,13,0.80) 50%, rgba(13,13,13,0.94) 78%, rgba(13,13,13,1) 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-background/85 to-transparent"
          aria-hidden
        />
      </div>
      <div className="relative z-10 flex min-h-[calc(100vw*9/21)] flex-col justify-end">
        <div className="max-w-6xl mx-auto w-full px-8 md:px-12 lg:px-16 pt-32 pb-10 md:pb-14">
          {children}
        </div>
      </div>
    </section>
  );
}
