const BUNNY_REELS = "https://mxai-portfolio.b-cdn.net/Reels";

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

function reelId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function bunnyReel(title: string, fileName: string): PortfolioReel {
  return {
    id: reelId(title),
    title,
    src: `${BUNNY_REELS}/${encodeURIComponent(fileName)}`,
    poster: "",
  };
}

const AI_BY_MILAD_TITLE = "Created with Ai By Milad";

function bunnySquare(id: string, src: string): PortfolioSquareImage {
  return {
    id,
    title: AI_BY_MILAD_TITLE,
    src,
  };
}

export const portfolioReels: PortfolioReel[] = [
  bunnyReel(
    "AI Video Showcase",
    "hf_20260428_092928_37b8e657-dfad-4069-b4ee-a03890564df4.mp4"
  ),
  bunnyReel("DJ Aligator - Madar", "DJ Aligator - Madar.mp4"),
  bunnyReel("DJ Aligator - Madar Promo", "DJ Aligator - Madar Promo.mp4"),
  bunnyReel("DAC Clinic - Academy Ad", "DAC Clinic - Academy Ad.mp4"),
  bunnyReel("Danlee Pharma - Device Ad", "Danlee Pharma - Device Ad.mp4"),
  bunnyReel("Florial - Beauty Brand A", "Florial - Beauty Brand A.mp4"),
  bunnyReel("Florial - Beauty Brand B", "Florial - Beauty Brand B.mp4"),
  bunnyReel("Florial - Beauty Brand C", "Florial - Beauty Brand C.mp4"),
  bunnyReel("Florial - Beauty Brand D", "Florial - Beauty Brand D.mp4"),
  bunnyReel("Florial - Beauty Brand E", "Florial - Beauty Brand E.mp4"),
  bunnyReel("Hair Transplant - Interview", "Hair Transplant - Interview.mp4"),
  bunnyReel("Instagram Video for Iran", "Instagram Video for Iran.mp4"),
  bunnyReel("Instagram Video for Iran B", "Instagram Video for Iran B.mp4"),
  bunnyReel("UGC with AI - DAC Clinic", "UGC with AI - DAC Clinic.mp4"),
  bunnyReel(
    "UGC with AI - JB Design London",
    "UGC with AI - JB Design London.mp4"
  ),
  bunnyReel("YouTube AI Video Project", "YouTube AI Video Project.mp4"),
  bunnyReel("YouTube AI Video", "YouTube AI Video.mp4"),
];

/** Square AI image work */
export const portfolioSquareImages: PortfolioSquareImage[] = [
  bunnySquare(
    "ai-by-milad-01",
    "https://mxai-portfolio.b-cdn.net/Poster/bwownies.com%207%20Large.jpeg"
  ),
  bunnySquare(
    "ai-by-milad-02",
    "https://mxai-portfolio.b-cdn.net/Poster/Florial%20Posts%20(1).jpg"
  ),
  bunnySquare(
    "ai-by-milad-03",
    "https://mxai-portfolio.b-cdn.net/Poster/Florial%20Posts%20(2).jpg"
  ),
  bunnySquare(
    "ai-by-milad-04",
    "https://mxai-portfolio.b-cdn.net/Poster/Florial%20Posts%20(3).jpg"
  ),
  bunnySquare(
    "ai-by-milad-05",
    "https://mxai-portfolio.b-cdn.net/Poster/Florial%20Posts%20(4).jpg"
  ),
  bunnySquare(
    "ai-by-milad-06",
    "https://mxai-portfolio.b-cdn.net/Poster/Florial%20Posts%20(5).jpg"
  ),
  bunnySquare(
    "ai-by-milad-07",
    "https://mxai-portfolio.b-cdn.net/Poster/Florial%20Posts%20(6).jpg"
  ),
  bunnySquare(
    "ai-by-milad-08",
    "https://mxai-portfolio.b-cdn.net/Poster/Florial%20Posts%20(7).jpg"
  ),
  bunnySquare(
    "ai-by-milad-09",
    "https://mxai-portfolio.b-cdn.net/Poster/Florial%20Posts.jpg"
  ),
  bunnySquare(
    "ai-by-milad-10",
    "https://mxai-portfolio.b-cdn.net/Poster/hf_20260405_183801_95382120-3470-4d3f-bbd9-c7ed1d831c25%20Large.jpeg"
  ),
  bunnySquare(
    "ai-by-milad-11",
    "https://mxai-portfolio.b-cdn.net/Poster/hf_20260409_130436_c5e25c13-8df9-4131-8d6f-f658b573fb05%20Large.jpeg"
  ),
  bunnySquare(
    "ai-by-milad-12",
    "https://mxai-portfolio.b-cdn.net/Poster/hf_20260430_190213_2d0106c5-b0a5-4dfd-825c-06c26a354924%20Large.jpeg"
  ),
  bunnySquare(
    "ai-by-milad-13",
    "https://mxai-portfolio.b-cdn.net/Poster/UK%20Regulatory%20Support%20for%20Aesthetic%20Devices%20%7C%20Crown%20Bridge%20Large.jpeg"
  ),
];

/** Web apps and tools built with AI-assisted development */
export const portfolioApplications: PortfolioApplication[] = [
  {
    id: "milad-x-ai",
    title: "Milad X AI",
    description:
      "This website — bilingual courses, blog, contact, and portfolio powered by Next.js.",
    href: "https://www.mxaiacademy.com",
    tags: ["Next.js", "TypeScript", "Tailwind"],
  },
];
