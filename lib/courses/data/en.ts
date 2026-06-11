import type { Course } from "../types";

export const promptToContentCourseEn: Course = {
  slug: "prompt-to-content",
  listTitle: "One-Day Content Creation Workshop",
  title: "Prompt to Content Master Class",
  subtitle: "AI Content Production & Automation Masterclass",
  excerpt:
    "A hands-on intensive workshop to learn AI content creation the right way — from ideation and prompt writing to images, video, ads, and automation with Claude AI.",
  status: "Live",
  date: "5 Jul 2026",
  coverImage: "/images/prompt-to-content-cover.png",
  priceUsd: 75,
  meta: {
    instructor: "Milad",
    format: "Live online workshop",
    totalHours: "6 hours",
    partsCount: 2,
    timezone: "London, UK time",
    sessions: [
      { id: "1", date: "5 Jul 2026", time: "16:00", durationHours: 4 },
      { id: "2", date: "8 Jul 2026", time: "18:00", durationHours: 2 },
    ],
  },
  includes: [
    { text: "4-hour live masterclass (Session 1)" },
    { text: "Hands-on project assignment" },
    { text: "2-hour review & Q&A (Session 2, 3 days later)" },
    { text: "16 practical AI content topics" },
    { text: "Prompt, image, video & automation workflows" },
  ],
  insights: {
    audience: [
      "Content creators",
      "Business owners & founders",
      "Social media managers",
      "Digital marketers & freelancers",
    ],
    topicsCount: 16,
    requirements: [
      "Claude AI Pro — required",
      "Higgsfield account — required",
      "No prior AI or design experience needed",
    ],
  },
  faq: [
    {
      id: "recorded",
      question: "Will the sessions be recorded?",
      answer:
        "Yes. Both sessions will be recorded, and you will have access to the recordings for 15 days.",
    },
    {
      id: "materials",
      question: "Will I receive any course materials?",
      answer: "Yes. All course files and materials will be shared with you.",
    },
    {
      id: "beginner",
      question: "Is this workshop right for me as a complete beginner?",
      answer:
        "Yes. The workshop is designed for beginners — we cover everything from the basics, so no prior knowledge is required.",
    },
    {
      id: "payment",
      question: "How do I pay for the course?",
      answer:
        "After the waiting list closes, you will receive an email with a secure link to purchase the course online.",
    },
    {
      id: "tools",
      question: "Do I need Higgsfield and Claude AI before the course starts?",
      answer:
        "Yes. You will need both to follow the lessons and complete the assignments. If you do not have accounts yet, do not worry — I will guide you through setup during the course.",
    },
    {
      id: "live",
      question: "Are the sessions live?",
      answer: "Yes. The sessions are live on Google Meet.",
    },
  ],
  sections: [
    {
      id: "intro",
      title: "About the course",
      blocks: [
        {
          type: "paragraph",
          text: "Prompt to Content Master Class is a practical, intensive workshop for anyone who wants to learn AI content creation in a structured, professional, and actionable way.",
        },
        {
          type: "paragraph",
          text: "You are not just watching. You will not only see a few tools and then wonder how to use them. In this masterclass, you will learn step by step how to ideate from scratch, write professional prompts, create images, produce video, design promotional content, and even automate parts of your workflow with Claude AI.",
        },
        {
          type: "paragraph",
          text: "The goal is to take you from beginner to professional content creator. Even with no background in content, design, AI, or video — you can start from zero and build real skills.",
        },
        {
          type: "paragraph",
          text: "This is not just a tour of tools. You learn the principles of AI content production, so after the course you can stay current as new platforms emerge instead of depending on a single app.",
        },
      ],
    },
    {
      id: "structure",
      title: "Course structure",
      blocks: [
        {
          type: "paragraph",
          text: "This masterclass runs in two parts.",
        },
        { type: "heading", level: 3, text: "Session 1" },
        {
          type: "paragraph",
          text: "Duration: 4 hours",
        },
        {
          type: "paragraph",
          text: "The core training is delivered in a compact, practical, step-by-step format. Participants learn AI content fundamentals, prompt engineering, image and video creation, promotional design, and automation.",
        },
        { type: "heading", level: 3, text: "Practical assignment after Session 1" },
        {
          type: "paragraph",
          text: "After Session 1, participants receive a project and hands-on exercise to apply what they learned on a real deliverable.",
        },
        { type: "heading", level: 3, text: "Session 2" },
        {
          type: "paragraph",
          text: "3 days after Session 1 — Duration: 2 hours",
        },
        {
          type: "paragraph",
          text: "Participant projects are reviewed, issues are corrected, better execution methods are explained, and a Q&A block is held.",
        },
        {
          type: "paragraph",
          text: "This ensures learning stays practical and every participant experiences a real execution path — not theory only.",
        },
      ],
    },
    {
      id: "curriculum",
      title: "What you will learn",
      blocks: [
        {
          type: "items",
          items: [
            {
              title: "1. Principles of AI content creation",
              description:
                "The full path from initial idea to final output for social, ads, and personal brand.",
            },
            {
              title: "2. Prompt engineering for image & video",
              description:
                "Write precise, controllable, professional prompts for high-quality images and video.",
            },
            {
              title: "3. Content automation with Claude AI",
              description:
                "Use Claude for planning, ideation, scripts, prompts, workflow management, and speed.",
            },
            {
              title: "4. AI personal portrait photography",
              description:
                "Professional portraits for personal brand, profiles, LinkedIn, Instagram, covers, and ads.",
            },
            {
              title: "5. AI product photography",
              description:
                "Luxury, professional product shots without studio, camera, or photo crew.",
            },
            {
              title: "6. UGC content creation",
              description:
                "UGC-style promotional content for brands, products, and social campaigns.",
            },
            {
              title: "7. CGI images for advertising",
              description:
                "Creative, viral-ready concepts for ads, campaigns, and brand content.",
            },
            {
              title: "8. Image quality enhancement",
              description:
                "Upscale, fix lighting, improve detail, and prepare images for publish.",
            },
            {
              title: "9. YouTube thumbnail design",
              description:
                "Click-worthy covers for YouTube, Reels, Shorts, and educational content.",
            },
            {
              title: "10. Promotional banner design",
              description:
                "Professional banners for ads, websites, social, and digital campaigns.",
            },
            {
              title: "11. Multi-layer composite images",
              description:
                "Combine subject, product, background, light, text, and graphics for pro ads.",
            },
            {
              title: "12. AI video production fundamentals",
              description:
                "Image-to-video basics, motion, camera angle, scene, lighting, and final output.",
            },
            {
              title: "13. Product video creation",
              description:
                "Short, professional brand videos from a single product photo.",
            },
            {
              title: "14. Video with Seedance 2.0",
              description:
                "Realistic, cinematic, promotional video with Seedance 2.0.",
            },
            {
              title: "15. Video with Kling",
              description:
                "Kling workflows with better control of motion, camera, scene, and result.",
            },
            {
              title: "16. Social-ready export",
              description:
                "Prepare content for Instagram, YouTube, ads, and commercial use.",
            },
          ],
        },
      ],
    },
    {
      id: "audience",
      title: "Who is this for?",
      blocks: [
        {
          type: "paragraph",
          text: "Anyone who wants to learn professional AI content creation, including:",
        },
        {
          type: "list",
          items: [
            "Content creators",
            "Business owners",
            "Social media managers",
            "Digital marketers",
            "Freelancers",
            "Video and graphic designers",
            "People entering the AI content market",
            "Anyone who wants to create faster, better, and more creatively",
          ],
        },
      ],
    },
    {
      id: "prerequisites",
      title: "Requirements",
      blocks: [
        {
          type: "paragraph",
          text: "No prior experience is required to join.",
        },
        {
          type: "paragraph",
          text: "For exercises and full value from the training, the following are recommended or required:",
        },
        {
          type: "items",
          items: [
            {
              title: "Claude AI Pro account — required",
              description:
                "Required for automation modules and core course exercises.",
            },
            {
              title: "Higgsfield account — required",
              description:
                "Required for video modules and hands-on practice.",
            },
            {
              title: "ChatGPT Pro account — optional",
              description:
                "Helpful but not required to participate.",
            },
          ],
        },
      ],
    },
    {
      id: "outcome",
      title: "What you gain",
      blocks: [
        {
          type: "paragraph",
          text: "After this masterclass you will not only know a few tools — you will understand the full AI content production path.",
        },
        {
          type: "paragraph",
          text: "You will know how to think, write prompts, get professional output, run content projects, and stay current as new tools appear.",
        },
        {
          type: "paragraph",
          text: "Prompt to Content Master Class is for people who do not just want to use AI — they want to produce professional, publishable, sellable content with it.",
        },
      ],
    },
  ],
};
