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

const AI_BY_MILAD_TITLE = "Created with Ai By Milad";

function cloudinaryImagePathFromUrl(url: string): string {
  const marker = "/image/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;
  return url.slice(index + marker.length);
}

function aiByMiladSquare(id: string, uploadUrl: string): PortfolioSquareImage {
  return {
    id,
    title: AI_BY_MILAD_TITLE,
    src: squareImage(cloudinaryImagePathFromUrl(uploadUrl)),
  };
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
  {
    id: "florial-beauty-1204",
    title: "Florial - Beauty Brand",
    src: reelVideo("v1780308681", "1204_1_jzyvkc.mov"),
    poster: reelPoster("v1780308681", "1204_1_jzyvkc"),
  },
  {
    id: "instagram-reels-1208",
    title: "Instagram Reels Project",
    src: reelVideo("v1780309021", "1208_4_-copy-copy_utltyq.mov"),
    poster: reelPoster("v1780309021", "1208_4_-copy-copy_utltyq"),
  },
  {
    id: "florial-beauty-1213",
    title: "Florial - Beauty Brand",
    src: reelVideo("v1780308769", "1213_1_1_mlnppf.mov"),
    poster: reelPoster("v1780308769", "1213_1_1_mlnppf"),
  },
  {
    id: "madar-promo",
    title: "DJ Aligator - Madar Promo",
    src: reelVideo("v1780309160", "0601_x87zt8.mov"),
    poster: reelPoster("v1780309160", "0601_x87zt8"),
  },
  {
    id: "dac-ugc-ai",
    title: "UGC with AI - DAC Clinic",
    src: reelVideo("v1780309607", "0601_7_q6krh0.mov"),
    poster: reelPoster("v1780309607", "0601_7_q6krh0"),
  },
  {
    id: "youtube-ai-0601-6",
    title: "YouTube AI Video",
    src: reelVideo("v1780309622", "0601_6_orsjql.mp4"),
    poster: reelPoster("v1780309622", "0601_6_orsjql"),
  },
  {
    id: "youtube-ai-0601-5",
    title: "YouTube AI Video",
    src: reelVideo("v1780309635", "0601_5_tsf3pc.mp4"),
    poster: reelPoster("v1780309635", "0601_5_tsf3pc"),
  },
  {
    id: "instagram-iran-0601-3",
    title: "Instagram Video for Iran",
    src: reelVideo("v1780309676", "0601_3_qyiihc.mov"),
    poster: reelPoster("v1780309676", "0601_3_qyiihc"),
  },
  {
    id: "instagram-iran-0601-2",
    title: "Instagram Video for Iran",
    src: reelVideo("v1780309687", "0601_2_afmwiy.mov"),
    poster: reelPoster("v1780309687", "0601_2_afmwiy"),
  },
];

/** Square AI image work (1080×1080 via Cloudinary) */
export const portfolioSquareImages: PortfolioSquareImage[] = [
  aiByMiladSquare(
    "ai-by-milad-01",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310547/bwownies.com_5_mcfwxm.png"
  ),
  aiByMiladSquare(
    "ai-by-milad-02",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310454/hf_20260405_195019_4b63a5cb-82a9-4224-80bc-76ef368684dc_rfrokn.png"
  ),
  aiByMiladSquare(
    "ai-by-milad-03",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310566/hf_20260429_153239_f8d0339b-dfee-4c97-a6b0-14a18a271344_ncuqtq.png"
  ),
  aiByMiladSquare(
    "ai-by-milad-04",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310448/hf_20260405_183801_95382120-3470-4d3f-bbd9-c7ed1d831c25_ihahkb.jpg"
  ),
  aiByMiladSquare(
    "ai-by-milad-05",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310535/bwownies.com_7_nmxegb.jpg"
  ),
  aiByMiladSquare(
    "ai-by-milad-06",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310583/hf_20260430_190401_bf0f3a53-55de-4416-aec0-603ebbce9f66_jqykas.jpg"
  ),
  aiByMiladSquare(
    "ai-by-milad-07",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310570/hf_20260429_153247_644d9239-0468-4803-9274-e8380db79ae3_egfp4a.png"
  ),
  aiByMiladSquare(
    "ai-by-milad-08",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310599/Welcome_to_11_brw1cg.png"
  ),
  aiByMiladSquare(
    "ai-by-milad-09",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310629/4afb81ad-e420-499e-94f4-4df87973d224_ano7ge.png"
  ),
  aiByMiladSquare(
    "ai-by-milad-10",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310635/4e5d8ae5-98bc-48b4-b3c2-db3bc66ba4b5_ygeuuf.png"
  ),
  aiByMiladSquare(
    "ai-by-milad-11",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310672/23123123_oevzyw.png"
  ),
  aiByMiladSquare(
    "ai-by-milad-12",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310679/b07c409c-080f-4ecc-a86e-017a1ba8372c_usum0d.png"
  ),
  aiByMiladSquare(
    "ai-by-milad-13",
    "https://res.cloudinary.com/dbwrh0pfu/image/upload/v1780310700/envato-labs-image-edit_-_2025-11-29T093955.788_hnpn1s.png"
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
