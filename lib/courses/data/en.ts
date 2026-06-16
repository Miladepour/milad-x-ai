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
    tutors: [
      {
        name: { EN: "Sadegh Grafer", FA: "صادق گرافر" },
        portraitSrc: "/images/Sadegh portrait.jpeg",
        about: {
          FA: [
            "من صادق گرافر هستم؛ آرت دایرکتور، طراح گرافیک و تولیدکننده محتوای بصری. بیش از ۲۰ ساله که در حوزه طراحی، تبلیغات و برندینگ فعالیت می‌کنم. در سال‌های اخیر تمرکز من روی ترکیب طراحی و هوش مصنوعی بوده؛ از تصویرسازی و ویدیوسازی گرفته تا تولید محتوای تبلیغاتی و شبکه‌های اجتماعی. در این ورکشاپ تجربه عملی خودم را از استفاده حرفه‌ای از AI در تولید محتوا و پروژه‌های واقعی با شما به اشتراک میذارم.",
          ],
          EN: [
            "My name is Sadegh Grafer. I am an Art Director, Graphic Designer, and Visual Content Creator.",
            "I have been working in design, advertising, and branding for over 20 years. In recent years, my focus has been on combining design with artificial intelligence, from image and video creation to advertising content and social media production.",
            "In this workshop, I will share my practical experience of using AI professionally in content creation and real world projects.",
          ],
        },
      },
    ],
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
              title: "1. Principles of Content Creation with Artificial Intelligence",
              description:
                "Understanding AI models, how they work, and how they can be used in real world projects.",
            },
            {
              title: "2. Principles of Prompt Engineering",
              description:
                "Learning the correct structure of prompt writing and how to communicate professionally with AI models.",
            },
            {
              title: "3. Prompting with ChatGPT and Claude",
              description:
                "Learning the right way to create prompts with ChatGPT and Claude for analysis, idea generation, project management, and workflow optimisation.",
            },
            {
              title: "4. Introduction to Higgsfield and Its Features",
              description:
                "Creating advertising, cinematic, and social media visuals in Higgsfield using the latest AI image generation models such as ChatGPT Image, Nano Banana, and other new image generation models.",
            },
            {
              title: "5. Professional Content Design for Social Media",
              description:
                "Creating YouTube thumbnails, post covers, stories, reels, shorts, and advertising content for brands, companies, and personal pages based on professional social media standards.",
            },
            {
              title: "6. Cinematic Visual Design",
              description:
                "Understanding camera angles, lighting, composition, cinematic framing, visual atmosphere, and art direction in AI content creation.",
            },
            {
              title: "7. Character Design and Pre Production",
              description:
                "Creating moodboards, character maps, character sheets, and storyboards for image and video projects.",
            },
            {
              title: "8. Professional Use of Reference Images",
              description:
                "Learning how to use references to control style, composition, and consistency in designs.",
            },
            {
              title: "9. Image Upscaling",
              description:
                "Improving image quality, enhancing details, and preparing professional outputs with Higgsfield.",
            },
            {
              title: "10. AI Video Production",
              description:
                "Creating cinematic videos, motion design, and AI commercial videos with Seedance, Veo, and Kling.",
            },
            {
              title: "11. Creating Videos with Moodboards and Character Sheets",
              description:
                "Creating professional videos using storyboards, character sheets, and moodboards in Seedance.",
            },
            {
              title: "12. AI Avatar and Lip Sync",
              description:
                "Creating avatars, generating voice, and synchronising lips and visuals with ElevenLabs, HeyGen, and Minimax.",
            },
            {
              title: "13. Personal Portraits and Modelling",
              description:
                "Learning how to create personal portraits and generate models.",
            },
            {
              title: "14. Advertising Content and UGC Design for Brands and Products",
              description:
                "Creating advertising content, UGC, visual campaigns, and product introduction videos without the need for a studio or filming.",
            },
            {
              title: "15. AI Agents and MCP",
              description:
                "Understanding agents and MCPs, and connecting AI tools to different services and systems.",
            },
            {
              title: "16. Preparing Outputs for Social Media with CapCut",
              description:
                "Final preparation of content for Instagram, YouTube, and advertising campaigns.",
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
