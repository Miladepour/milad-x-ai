const CLOUD = "https://res.cloudinary.com/dbwrh0pfu";

export interface PortfolioReel {
  id: string;
  title: string;
  src: string;
  poster: string;
}

export interface PortfolioSquareImage {
  id: string;
  title: string;
  src: string;
}

export interface PortfolioApplication {
  id: string;
  title: string;
  description: string;
  href?: string;
  tags: string[];
}

function reelVideo(versionPath: string, fileName: string) {
  return `${CLOUD}/video/upload/q_auto,f_mp4/${versionPath}/${fileName}`;
}

function reelPoster(versionPath: string, publicId: string) {
  return `${CLOUD}/video/upload/so_0,ar_9:16,c_fill,w_720,h_1280,q_auto,f_jpg/${versionPath}/${publicId}.jpg`;
}

/** 1080×1080 square delivery from Cloudinary image uploads */
export function squareImage(publicId: string) {
  return `${CLOUD}/image/upload/w_1080,h_1080,c_fill,q_auto,f_auto/${publicId}`;
}

export const portfolioReels: PortfolioReel[] = [
  {
    id: "madar",
    title: "DJ Aligator - Madar",
    src: reelVideo("v1779612912", "0524_1_a6pvie.mp4"),
    poster: reelPoster("v1779612912", "0524_1_a6pvie"),
  },
  {
    id: "florial",
    title: "Florial - Perfume Ad",
    src: reelVideo("v1779613750", "0429_lnxozx.mov"),
    poster: reelPoster("v1779613750", "0429_lnxozx"),
  },
  {
    id: "hair-transplant",
    title: "Hair Transplant - Interview",
    src: reelVideo("v1779613874", "0512_1_bosvrz.mov"),
    poster: reelPoster("v1779613874", "0512_1_bosvrz"),
  },
  {
    id: "danlee",
    title: "Danlee Pharma - Device Ad",
    src: reelVideo("v1779613891", "0501_ukiwtc.mov"),
    poster: reelPoster("v1779613891", "0501_ukiwtc"),
  },
  {
    id: "dac",
    title: "DAC Clinic - Academy Ad",
    src: reelVideo("v1779613921", "0326-copy_pphcye.mov"),
    poster: reelPoster("v1779613921", "0326-copy_pphcye"),
  },
];

/** Add square (1080×1080) Cloudinary image public IDs here */
export const portfolioSquareImages: PortfolioSquareImage[] = [];

/** Web apps and tools built with AI-assisted development */
export const portfolioApplications: PortfolioApplication[] = [
  {
    id: "milad-x-ai",
    title: "Milad X AI",
    description:
      "This website — bilingual courses, blog, contact, and portfolio powered by Next.js.",
    href: "https://mxaiacademy.com",
    tags: ["Next.js", "TypeScript", "Tailwind"],
  },
];
