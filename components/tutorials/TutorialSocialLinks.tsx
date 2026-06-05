function IconInstagram() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon
        points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9z" />
    </svg>
  );
}

const socialLinks = [
  {
    href: "https://www.instagram.com/miladxaitalks/",
    label: "Instagram",
    icon: IconInstagram,
  },
  {
    href: "https://www.youtube.com/@miladxtalks",
    label: "YouTube",
    icon: IconYouTube,
  },
  {
    href: "https://t.me/miladxtalks",
    label: "Telegram",
    icon: IconTelegram,
  },
] as const;

const iconButtonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface bg-surface/40 text-cream hover:border-orange hover:text-orange hover:bg-orange/10 transition-colors";

interface TutorialSocialLinksProps {
  className?: string;
}

export default function TutorialSocialLinks({
  className = "",
}: TutorialSocialLinksProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {socialLinks.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          className={iconButtonClass}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
