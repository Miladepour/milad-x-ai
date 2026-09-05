import type { Locale } from "@/lib/i18n/translations";

export type PrivateCoursePath = {
  id: string;
  title: string;
  intro: string;
  topicsLabel: string;
  topics: string[];
  outcomeLabel: string;
  outcome: string;
};

export type PrivateCourseFaq = {
  id: string;
  question: string;
  answer: string;
};

export type PrivateCoursePageCopy = {
  backHome: string;
  label: string;
  title: string;
  description: string;
  descriptionSecondary: string;
  primaryCta: string;
  secondaryCta: string;
  telegramCta: string;
  jumpNavAria: string;
  jumpNavProcess: string;
  jumpNavPaths: string;
  jumpNavIncluded: string;
  jumpNavFaq: string;
  stickyBookCta: string;
  stickyTelegramCta: string;
  pricingNote: string;
  trustItems: string[];
  whyTitle: string;
  whyIntro: string;
  whyPoints: { title: string; description: string }[];
  pathsTitle: string;
  pathsIntro: string;
  paths: PrivateCoursePath[];
  pathsUnsureTitle: string;
  pathsUnsureBody: string;
  pathsUnsureCta: string;
  audienceTitle: string;
  audienceItems: string[];
  methodTitle: string;
  methodIntro: string;
  methodSteps: string[];
  methodNote: string;
  includedTitle: string;
  includedItems: string[];
  processTitle: string;
  processSteps: {
    title: string;
    description: string;
    bullets?: string[];
  }[];
  honestyTitle: string;
  honestyBody: string;
  instructorSectionTitle: string;
  faqTitle: string;
  faqs: PrivateCourseFaq[];
  finalTitle: string;
  finalBody: string;
  finalPriceLabel: string;
  finalPriceOutside: string;
  finalPriceInside?: string;
  finalCreditNote: string;
  finalCta: string;
  finalHint: string;
};

const en: PrivateCoursePageCopy = {
  backHome: "← Back to home",
  label: "Private online AI training",
  title: "Private AI Courses Tailored to Your Goals and Projects",
  description:
    "AI training is most effective when it begins with your real needs, not a generic curriculum designed for everyone. At MX AI Academy, we assess your current level, professional or personal goals, project and available learning time before creating a programme specifically for you.",
  descriptionSecondary:
    "Your sessions are delivered online and one-to-one, so you focus on the skills and tools that directly support the outcome you want.",
  primaryCta: "Book a 30-Minute Consultation",
  secondaryCta: "Explore the Available Learning Paths",
  telegramCta: "Message us on Telegram",
  jumpNavAria: "On this page",
  jumpNavProcess: "How it works",
  jumpNavPaths: "Paths",
  jumpNavIncluded: "Included",
  jumpNavFaq: "FAQ",
  stickyBookCta: "Book consultation",
  stickyTelegramCta: "Telegram",
  pricingNote:
    "The consultation costs US$30. If we agree to begin a private course, the full consultation fee will be credited towards your final course fee.",
  trustItems: [
    "Live one-to-one sessions",
    "A fully personalised learning programme",
    "Practical training based on real projects",
    "Sessions delivered through Google Meet",
    "Every session recorded",
    "Permanent access to your session recordings",
  ],
  whyTitle: "Why Choose Private AI Training?",
  whyIntro:
    "General courses can provide a useful introduction, but some lessons may be too basic, too advanced or unrelated to your actual needs. Private training creates a focused route around your level, work, goals and project.",
  whyPoints: [
    {
      title: "Learn Only What You Need",
      description:
        "Your time is spent on skills, tools and applications that directly support your intended outcome.",
    },
    {
      title: "Work on a Real Project",
      description:
        "Examples and exercises can be connected to your own role, business, content, website, product or project wherever the agreed scope allows.",
    },
    {
      title: "Progress at the Right Pace",
      description:
        "We can move quickly through familiar subjects and spend more time on areas that require deeper explanation or practice.",
    },
    {
      title: "Receive Direct Feedback",
      description:
        "You can ask questions, complete tasks during the session, identify mistakes and receive specific guidance in real time.",
    },
    {
      title: "Build an Outcome You Can Use",
      description:
        "The goal is not simply to introduce AI tools. It is to help you apply what you learn independently in a real professional or personal setting.",
    },
  ],
  pathsTitle: "Available Private AI Courses",
  pathsIntro:
    "Choose one learning path or combine several subjects in a personalised programme. The exact tools, depth and syllabus will be agreed after your consultation.",
  paths: [
    {
      id: "ai-fundamentals",
      title: "AI Fundamentals",
      intro:
        "This path is suitable for beginners who want a clear and practical introduction to AI and need help deciding which tools and methods to use.",
      topicsLabel: "Topics may include",
      topics: [
        "What AI can and cannot do",
        "Choosing the right tool for a task",
        "Prompt writing principles",
        "Drafting, summarising and rewriting text",
        "Research, source comparison and fact checking",
        "Working with documents, images and simple data",
        "Creating a personal productivity workflow",
        "Privacy, information security and responsible use",
      ],
      outcomeLabel: "Expected outcome",
      outcome:
        "You will be able to select suitable AI tools, write clearer instructions, evaluate output quality and use AI more confidently in everyday tasks.",
    },
    {
      id: "ai-for-business",
      title: "AI for Business",
      intro:
        "This path is designed for business owners, managers, freelancers and marketers who want to apply AI to genuine commercial and operational needs.",
      topicsLabel: "Topics may include",
      topics: [
        "Identifying valuable AI use cases in your business",
        "Reviewing repetitive and time-consuming processes",
        "Applying AI to marketing and sales",
        "Supporting customer service and response workflows",
        "Market research and initial competitor analysis",
        "Creating reusable prompts and team templates",
        "Producing reports, proposals and internal documents",
        "Deciding where human review is required",
        "Building a practical AI implementation roadmap",
      ],
      outcomeLabel: "Expected outcome",
      outcome:
        "You will have a clearer view of where AI can add value in your organisation and a practical plan for introducing it responsibly.",
    },
    {
      id: "ai-content-creation",
      title: "AI Content Creation",
      intro:
        "This path is suitable for content creators, social media managers, educators, brands, online shops and digital agencies.",
      topicsLabel: "Topics may include",
      topics: [
        "Content strategy and content pillars",
        "Audience-focused idea generation",
        "Writing hooks, scripts, captions and calls to action",
        "Generating and improving AI images",
        "Creating videos and planning individual shots",
        "Product, advertising and educational content",
        "Maintaining a consistent brand voice and visual identity",
        "Repurposing one idea for several platforms",
        "Creating a faster content production and approval workflow",
        "Reviewing weak outputs and improving quality",
      ],
      outcomeLabel: "Expected outcome",
      outcome:
        "You will be able to build a repeatable system for planning, producing and refining written, visual or video content for your brand.",
    },
    {
      id: "ai-website-development",
      title: "AI Website Development",
      intro:
        "This path is for anyone who wants to use AI-assisted tools to plan, build and publish a professional website, landing page, portfolio or business website.",
      topicsLabel: "Topics may include",
      topics: [
        "Turning an idea into a clear website brief",
        "Planning pages and user journeys",
        "Structuring content and page messaging",
        "Building user interfaces with AI assistance",
        "Responsive design for mobile and desktop",
        "Connecting forms and essential functionality",
        "Domains, hosting and deployment",
        "Essential on-page and technical SEO",
        "Testing, debugging and improving the website",
        "Updating and maintaining the site after launch",
      ],
      outcomeLabel: "Expected outcome",
      outcome:
        "Depending on your level and agreed scope, you can build a publishable website and learn how to manage and develop it after launch.",
    },
    {
      id: "ai-vibe-coding",
      title: "AI Vibe Coding and Programming",
      intro:
        "This path is for people who want to move beyond a simple website and use AI to create an application, online tool, dashboard or digital product.",
      topicsLabel: "Topics may include",
      topics: [
        "Turning an idea into clear product and technical requirements",
        "Working effectively with AI coding assistants and agents",
        "Understanding project structure and programming fundamentals",
        "Building pages, components and interactions",
        "Working with APIs, databases and authentication where relevant",
        "Version control with Git and GitHub",
        "Reading errors and debugging with AI",
        "Functional testing and user experience review",
        "Understanding the security limits of AI-generated code",
        "Deploying an initial version and planning future development",
      ],
      outcomeLabel: "Expected outcome",
      outcome:
        "You can turn an idea into a usable prototype and learn how to inspect, correct and extend AI-generated code instead of accepting it without review.",
    },
    {
      id: "n8n-automation",
      title: "AI Automation with n8n",
      intro:
        "This path is for people who want to reduce repetitive work, connect different tools and build intelligent business workflows.",
      topicsLabel: "Topics may include",
      topics: [
        "Mapping a manual process before automating it",
        "Understanding workflows, triggers, nodes and actions",
        "Building workflows in n8n",
        "Connecting forms, email, Google Sheets and business tools",
        "Using webhooks and APIs",
        "Adding AI steps to a workflow",
        "Processing, classifying and moving information",
        "Adding human approval to sensitive stages",
        "Error handling, logging and duplicate prevention",
        "Workflow security, access and maintenance",
      ],
      outcomeLabel: "Expected outcome",
      outcome:
        "You will design a working automation around a real need and learn how to review, improve and maintain it.",
    },
    {
      id: "custom-programme",
      title: "A Custom Programme Beyond These Paths",
      intro:
        "If your goal does not match one of the paths above, tell us what you need. We design a personalised programme around your project, tools and outcome during the consultation.",
      topicsLabel: "How it works",
      topics: [
        "You describe your goal, project and current level",
        "We assess whether a custom route is the right fit",
        "A syllabus is built around your specific needs",
        "Session count, topics and fee are confirmed before you begin",
      ],
      outcomeLabel: "Expected outcome",
      outcome:
        "You get a private learning plan that is not limited to the listed paths, shaped around what you actually need to achieve.",
    },
  ],
  pathsUnsureTitle: "Not Sure Which Path Is Right for You?",
  pathsUnsureBody:
    "You do not need to choose your final course before the consultation. During the 30-minute session, we will assess your needs and recommend the most suitable combination of subjects.",
  pathsUnsureCta: "Book a Consultation to Choose Your Learning Path",
  audienceTitle: "Who Is This Training For?",
  audienceItems: [
    "Beginners who want to develop strong AI foundations",
    "Content creators and social media managers",
    "Business owners and managers seeking better productivity",
    "Digital marketers and freelancers",
    "People who want to build a website or digital product with AI",
    "Learners with a specific project who need guided implementation",
    "People who have completed general courses but still struggle to apply their knowledge",
  ],
  methodTitle: "How Your Private Training Works",
  methodIntro:
    "The sessions are not limited to tool demonstrations. Each subject begins with a clear explanation, followed by a practical demonstration. You then apply the skill to your own task or project and receive direct feedback.",
  methodSteps: [
    "Understand the concept and its purpose",
    "See a practical demonstration",
    "Complete the task yourself",
    "Review errors and receive feedback",
    "Turn the skill into a repeatable workflow",
  ],
  methodNote:
    "The pace, technical depth, exercises and sequence are defined in your personalised programme.",
  includedTitle: "What Is Included?",
  includedItems: [
    "One-to-one online sessions with Milad",
    "Assessment of your current level, goal and project",
    "A personalised syllabus",
    "Agreed session count and session length before training begins",
    "Practical teaching based on your needs",
    "Session times coordinated around the available schedule",
    "Delivery through Google Meet",
    "Recording of every session",
    "Permanent access to the session recordings",
    "A complete course fee provided before the first training session",
  ],
  processTitle: "From Consultation to Your First Session",
  processSteps: [
    {
      title: "Book a 30-Minute Consultation",
      description:
        "During a 30-minute online consultation, we review your current level, personal or professional goal, intended project, existing tools and the time you can commit to learning. The consultation costs US$30. If we agree to proceed with a private course, the full consultation fee will be credited towards your final course fee.",
    },
    {
      title: "Receive Your Personalised Learning Programme",
      description:
        "Within 1 to 2 days after the consultation, your personalised learning programme will be prepared and sent to you.",
      bullets: [
        "The intended learning outcome",
        "The number of sessions",
        "The length of each session",
        "The topics and their order",
        "Suggested exercises or project work",
        "The complete course fee",
      ],
    },
    {
      title: "Approve the Programme and Begin",
      description:
        "After you approve the programme, session times will be arranged with you according to the available schedule. Sessions are delivered and recorded through Google Meet. You will receive permanent access to the recordings so that you can revisit the material whenever needed.",
    },
  ],
  honestyTitle: "Practical Training Without Unrealistic Promises",
  honestyBody:
    "These courses do not promise guaranteed income, instant success or results without practice. Your outcome depends on your starting point, goal, effort, available time and implementation. MX AI Academy provides a clear, practical and personalised learning path so that you can work with greater understanding and rely less on disconnected tutorials.",
  instructorSectionTitle: "Learn Directly with Milad",
  faqTitle: "Frequently Asked Questions About Private AI Courses",
  faqs: [
    {
      id: "faq-difference",
      question: "How is a private AI course different from a general course?",
      answer:
        "A general course gives every learner the same curriculum. Private training adapts the syllabus, pace, number of sessions and practical work to your current level, goal and project.",
    },
    {
      id: "faq-experience",
      question: "Do I need previous AI experience?",
      answer:
        "No. A beginner's programme can start with essential concepts and skills. If you already have experience, your level will be assessed during the consultation so that repeated material can be removed.",
    },
    {
      id: "faq-consultation",
      question: "What happens during the consultation?",
      answer:
        "During the 30-minute consultation, we discuss your goal, current level, role, project, existing tools, constraints and availability. This information is used to design your personalised programme.",
    },
    {
      id: "faq-consultation-cost",
      question: "How much does the consultation cost?",
      answer: "The consultation costs US$30.",
    },
    {
      id: "faq-credit",
      question: "Is the consultation fee deducted from the course fee?",
      answer:
        "Yes. If we agree to begin a private course, the full consultation fee will be credited towards the final course fee.",
    },
    {
      id: "faq-course-cost",
      question: "How much does a private course cost?",
      answer:
        "There is no single fixed fee because each programme is based on the learning goal, session count, session length, technical depth and required subjects. The complete price is provided in your learning programme before any training session begins.",
    },
    {
      id: "faq-sessions",
      question: "How many sessions will I need?",
      answer:
        "The number of sessions depends on your starting point, intended outcome and the scope of the subjects. The exact number is included in your learning programme within 1 to 2 days after the consultation.",
    },
    {
      id: "faq-length",
      question: "How long is each session?",
      answer:
        "Session length is selected according to the learning path and your needs. It will be clearly stated in your programme before you begin.",
    },
    {
      id: "faq-start",
      question: "When can the sessions start?",
      answer:
        "After the programme and fee are approved, session times are arranged with you according to the available schedule.",
    },
    {
      id: "faq-where",
      question: "Where are the sessions delivered?",
      answer: "All private sessions are delivered online through Google Meet.",
    },
    {
      id: "faq-recorded",
      question: "Are the sessions recorded?",
      answer:
        "Yes. Every session is recorded and you receive permanent access to the recordings for future review.",
    },
    {
      id: "faq-combine",
      question: "Can I combine several course subjects?",
      answer:
        "Yes. For example, AI content creation can be combined with AI for business, or website development can be combined with vibe coding and n8n automation. The final combination should remain realistic for your goal and available time.",
    },
    {
      id: "faq-project",
      question: "Can I work on my own project during the course?",
      answer:
        "Yes. Your project will be reviewed during the consultation. If its size and complexity fit the agreed training scope, it can become part of the practical programme.",
    },
    {
      id: "faq-tools",
      question: "Which AI tools will be used?",
      answer:
        "Tools are selected according to your goal, technical level, access and current market changes. The main required tools will be named in your learning programme before training begins.",
    },
    {
      id: "faq-paid-tools",
      question: "What if a paid tool is required?",
      answer:
        "If your learning path requires a paid tool or subscription, its name and approximate cost will be explained before the course begins. The treatment of third-party subscription fees will be stated clearly in the final proposal.",
    },
  ],
  finalTitle: "Ready for an AI Learning Path Built Around You?",
  finalBody:
    "If you want to stop moving between disconnected tutorials and too many tools, book a consultation. We will review your goal and identify the skills, tools and number of sessions most suitable for the outcome you want.",
  finalPriceLabel: "30-minute consultation fee",
  finalPriceOutside: "US$30",
  finalCreditNote:
    "If we agree to begin a private course, the full consultation fee will be credited towards your final course fee.",
  finalCta: "Book a 30-Minute Consultation",
  finalHint:
    "You will be redirected to Google Calendar to choose a time and complete your booking.",
};

const fa: PrivateCoursePageCopy = {
  backHome: "← بازگشت به خانه",
  label: "آموزش خصوصی و آنلاین هوش مصنوعی",
  title: "دوره خصوصی هوش مصنوعی متناسب با هدف و پروژه شما",
  description:
    "یادگیری هوش مصنوعی زمانی بیشترین نتیجه را دارد که از نیاز واقعی شما شروع شود، نه از یک سرفصل عمومی و یکسان برای همه. در دوره خصوصی MX AI Academy، سطح فعلی، هدف شغلی یا شخصی، پروژه موردنظر و زمانی که برای یادگیری دارید بررسی می‌شود. سپس یک برنامه آموزشی اختصاصی برای شما طراحی خواهد شد.",
  descriptionSecondary:
    "جلسات به صورت آنلاین و یک به یک برگزار می‌شوند تا فقط روی مهارت‌ها و ابزارهایی تمرکز کنید که برای رسیدن به هدف شما کاربرد دارند.",
  primaryCta: "رزرو جلسه مشاوره ۳۰ دقیقه‌ای",
  secondaryCta: "مشاهده مسیرهای آموزشی",
  telegramCta: "پیام در تلگرام",
  jumpNavAria: "در این صفحه",
  jumpNavProcess: "روند کار",
  jumpNavPaths: "مسیرها",
  jumpNavIncluded: "شامل چیست",
  jumpNavFaq: "سؤالات",
  stickyBookCta: "رزرو مشاوره",
  stickyTelegramCta: "تلگرام",
  pricingNote:
    "هزینه مشاوره برای متقاضیان خارج از ایران ۳۰ دلار آمریکا و برای متقاضیان داخل ایران ۳٬۵۰۰٬۰۰۰ تومان است. در صورت شروع دوره خصوصی، کل هزینه مشاوره از مبلغ نهایی دوره کسر می‌شود.",
  trustItems: [
    "جلسات آنلاین و یک به یک",
    "برنامه آموزشی کاملاً اختصاصی",
    "آموزش بر اساس پروژه واقعی",
    "برگزاری جلسات در Google Meet",
    "ضبط تمام جلسات",
    "دسترسی دائمی به فایل جلسات",
  ],
  whyTitle: "چرا دوره خصوصی هوش مصنوعی؟",
  whyIntro:
    "دوره‌های عمومی می‌توانند برای آشنایی اولیه مفید باشند، اما ممکن است بخشی از مطالب برای شما تکراری، بیش از حد ساده یا نامرتبط با نیاز واقعی‌تان باشد. در آموزش خصوصی، مسیر یادگیری از روی هدف، سطح دانش، نوع فعالیت و پروژه شما ساخته می‌شود.",
  whyPoints: [
    {
      title: "فقط آنچه واقعاً نیاز دارید",
      description:
        "به جای صرف زمان برای موضوعات غیرضروری، روی مهارت‌ها، ابزارها و کاربردهایی کار می‌کنید که مستقیماً به هدف شما مرتبط هستند.",
    },
    {
      title: "یادگیری با پروژه واقعی",
      description:
        "تمرین‌ها و مثال‌ها تا حد امکان بر اساس کار، کسب و کار، محتوا، وب‌سایت، محصول یا ایده واقعی شما انتخاب می‌شوند.",
    },
    {
      title: "سرعت متناسب با شما",
      description:
        "اگر موضوعی را از قبل می‌دانید، سریع‌تر از آن عبور می‌کنیم. اگر بخشی نیاز به توضیح و تمرین بیشتری داشته باشد، زمان بیشتری به آن اختصاص می‌دهیم.",
    },
    {
      title: "بازخورد مستقیم و دقیق",
      description:
        "در طول جلسه می‌توانید سؤال بپرسید، کار خود را اجرا کنید، اشتباهات را همان لحظه بررسی کنید و بازخورد مشخص دریافت کنید.",
    },
    {
      title: "تمرکز بر نتیجه قابل استفاده",
      description:
        "هدف فقط شناخت ابزارهای هوش مصنوعی نیست. هدف این است که بتوانید پس از دوره، آموخته‌های خود را به صورت مستقل در کار یا پروژه واقعی اجرا کنید.",
    },
  ],
  pathsTitle: "دوره‌های خصوصی هوش مصنوعی قابل ارائه",
  pathsIntro:
    "می‌توانید یک مسیر را انتخاب کنید یا بر اساس هدفتان، چند مسیر را در یک برنامه اختصاصی ترکیب کنید. ابزارها و سرفصل‌های دقیق پس از جلسه مشاوره و متناسب با سطح شما مشخص می‌شوند.",
  paths: [
    {
      id: "ai-fundamentals",
      title: "آموزش مبانی هوش مصنوعی",
      intro:
        "این مسیر برای افرادی مناسب است که می‌خواهند استفاده از هوش مصنوعی را از پایه، ساده و اصولی یاد بگیرند و هنوز نمی‌دانند از کدام ابزار یا روش باید شروع کنند.",
      topicsLabel: "موضوعات قابل پوشش",
      topics: [
        "هوش مصنوعی چیست و چه محدودیت‌هایی دارد",
        "انتخاب ابزار مناسب برای هر نوع کار",
        "اصول پرامپت نویسی و نوشتن دستورهای دقیق",
        "تولید، خلاصه‌سازی و بازنویسی متن",
        "تحقیق، مقایسه منابع و بررسی صحت پاسخ‌ها",
        "کار با فایل‌ها، اسناد، تصاویر و داده‌های ساده",
        "ساخت یک روند شخصی برای کارهای روزانه",
        "حریم خصوصی، امنیت اطلاعات و استفاده مسئولانه",
      ],
      outcomeLabel: "نتیجه مورد انتظار",
      outcome:
        "در پایان این مسیر می‌توانید ابزارهای اصلی هوش مصنوعی را آگاهانه انتخاب کنید، دستورهای بهتر بنویسید، کیفیت خروجی را ارزیابی کنید و از AI در فعالیت‌های روزانه خود استفاده کنید.",
    },
    {
      id: "ai-for-business",
      title: "آموزش هوش مصنوعی برای کسب و کار",
      intro:
        "این مسیر برای صاحبان کسب و کار، مدیران، فریلنسرها، بازاریابان و افرادی طراحی می‌شود که می‌خواهند هوش مصنوعی را وارد فرایندهای واقعی کاری خود کنند.",
      topicsLabel: "موضوعات قابل پوشش",
      topics: [
        "شناسایی فرصت‌های واقعی استفاده از AI در کسب و کار",
        "بررسی فرایندهای زمان‌بر و تکراری",
        "استفاده از هوش مصنوعی در بازاریابی و فروش",
        "کمک به خدمات مشتری و پاسخ‌گویی",
        "تحقیق بازار و تحلیل اولیه رقبا",
        "ساخت پرامپت‌ها و قالب‌های قابل استفاده برای تیم",
        "طراحی روند تولید گزارش، پیشنهاد و مستندات",
        "انتخاب کارهایی که باید با نظارت انسانی انجام شوند",
        "تهیه یک نقشه اجرایی متناسب با کسب و کار شما",
      ],
      outcomeLabel: "نتیجه مورد انتظار",
      outcome:
        "شما یک دید روشن از کاربردهای مناسب هوش مصنوعی در کسب و کارتان و یک مسیر عملی برای اجرای آن‌ها خواهید داشت.",
    },
    {
      id: "ai-content-creation",
      title: "آموزش تولید محتوا با هوش مصنوعی",
      intro:
        "این مسیر برای تولیدکنندگان محتوا، مدیران شبکه‌های اجتماعی، برندها، مدرس‌ها، فروشگاه‌ها و آژانس‌های دیجیتال مناسب است.",
      topicsLabel: "موضوعات قابل پوشش",
      topics: [
        "طراحی استراتژی و ستون‌های محتوایی",
        "ایده‌پردازی بر اساس مخاطب و هدف",
        "نوشتن سناریو، هوک، کپشن و فراخوان به اقدام",
        "ساخت و بهبود تصویر با ابزارهای هوش مصنوعی",
        "ساخت ویدیو و طراحی شات‌های ویدیویی",
        "تولید محتوای محصول، تبلیغات و محتوای آموزشی",
        "حفظ لحن، هویت و ظاهر یکپارچه برند",
        "بازطراحی یک محتوا برای چند پلتفرم",
        "ساخت یک روند سریع‌تر برای تولید و تأیید محتوا",
        "ارزیابی کیفیت و اصلاح خروجی‌های ضعیف",
      ],
      outcomeLabel: "نتیجه مورد انتظار",
      outcome:
        "در پایان، می‌توانید یک روند منظم برای ایده‌پردازی، تولید و بهینه‌سازی محتوای متنی، تصویری یا ویدیویی متناسب با برند خود بسازید.",
    },
    {
      id: "ai-website-development",
      title: "آموزش طراحی و توسعه وب‌سایت با هوش مصنوعی",
      intro:
        "این مسیر برای افرادی مناسب است که می‌خواهند با کمک ابزارهای هوش مصنوعی یک وب‌سایت حرفه‌ای، لندینگ پیج، پورتفولیو یا وب‌سایت کسب و کار طراحی و منتشر کنند.",
      topicsLabel: "موضوعات قابل پوشش",
      topics: [
        "تبدیل ایده به بریف و ساختار سایت",
        "طراحی نقشه صفحات و مسیر حرکت کاربر",
        "برنامه‌ریزی محتوا و پیام اصلی هر صفحه",
        "ساخت رابط کاربری با کمک ابزارهای AI",
        "طراحی واکنش‌گرا برای موبایل و دسکتاپ",
        "اتصال فرم‌ها و بخش‌های ضروری",
        "آشنایی با دامنه، هاست و انتشار سایت",
        "اصول پایه سئو داخلی و سئو فنی",
        "بررسی خطاها، تست و بهبود سایت",
        "روش به‌روزرسانی و نگهداری سایت پس از انتشار",
      ],
      outcomeLabel: "نتیجه مورد انتظار",
      outcome:
        "بسته به سطح و هدف برنامه، می‌توانید یک وب‌سایت قابل انتشار بسازید و روش مدیریت و توسعه آن را یاد بگیرید.",
    },
    {
      id: "ai-vibe-coding",
      title: "آموزش وایب کدینگ و برنامه نویسی با هوش مصنوعی",
      intro:
        "این مسیر برای افرادی است که می‌خواهند فراتر از یک وب‌سایت ساده بروند و با کمک هوش مصنوعی اپلیکیشن، ابزار آنلاین، داشبورد یا محصول دیجیتال بسازند.",
      topicsLabel: "موضوعات قابل پوشش",
      topics: [
        "تبدیل ایده به نیازمندی و مشخصات فنی روشن",
        "روش صحیح کار با دستیارها و عامل‌های کدنویسی",
        "درک ساختار پروژه و اصول پایه برنامه نویسی",
        "ساخت صفحه‌ها، کامپوننت‌ها و تعاملات",
        "کار با API، پایگاه داده و احراز هویت در صورت نیاز",
        "مدیریت نسخه و کار با Git و GitHub",
        "خواندن خطاها و اشکال‌زدایی با کمک AI",
        "تست عملکرد و بررسی تجربه کاربری",
        "شناخت محدودیت‌های امنیتی کد تولیدشده با AI",
        "انتشار نسخه اولیه و برنامه‌ریزی برای توسعه بعدی",
      ],
      outcomeLabel: "نتیجه مورد انتظار",
      outcome:
        "می‌توانید ایده خود را به یک نمونه اولیه قابل استفاده تبدیل کنید و به جای پذیرش کورکورانه کد تولیدشده، ساختار آن را بررسی، اصلاح و توسعه دهید.",
    },
    {
      id: "n8n-automation",
      title: "آموزش اتوماسیون هوش مصنوعی با n8n",
      intro:
        "این مسیر برای افرادی مناسب است که می‌خواهند کارهای تکراری را کاهش دهند، ابزارهای مختلف را به هم متصل کنند و فرایندهای کاری هوشمند بسازند.",
      topicsLabel: "موضوعات قابل پوشش",
      topics: [
        "تبدیل یک فرایند دستی به نقشه اتوماسیون",
        "آشنایی با Workflow، Trigger، Node و Action",
        "ساخت گردش کار در n8n",
        "اتصال فرم، ایمیل، Google Sheets و ابزارهای کاری",
        "آشنایی با Webhook و API",
        "افزودن مراحل هوش مصنوعی به گردش کار",
        "پردازش، دسته‌بندی و انتقال اطلاعات",
        "طراحی تأیید انسانی برای مراحل حساس",
        "مدیریت خطا، ثبت لاگ و جلوگیری از اجرای تکراری",
        "اصول نگهداری، امنیت و مدیریت دسترسی‌ها",
      ],
      outcomeLabel: "نتیجه مورد انتظار",
      outcome:
        "در طول مسیر، یک گردش کار واقعی متناسب با نیاز شما طراحی می‌شود و یاد می‌گیرید چگونه آن را بررسی، اصلاح و نگهداری کنید.",
    },
    {
      id: "custom-programme",
      title: "برنامه اختصاصی فراتر از این مسیرها",
      intro:
        "اگر هدف شما با مسیرهای بالا هم‌خوان نیست، نیازتان را بگویید. در جلسه مشاوره یک برنامه آموزشی اختصاصی بر اساس پروژه، ابزارها و نتیجه موردنظر شما طراحی می‌کنیم.",
      topicsLabel: "چگونه کار می‌کند",
      topics: [
        "هدف، پروژه و سطح فعلی خود را توضیح می‌دهید",
        "بررسی می‌کنیم که مسیر اختصاصی برای شما مناسب است یا نه",
        "سرفصل بر اساس نیاز واقعی شما ساخته می‌شود",
        "تعداد جلسات، موضوعات و هزینه پیش از شروع تأیید می‌شود",
      ],
      outcomeLabel: "نتیجه مورد انتظار",
      outcome:
        "یک برنامه یادگیری خصوصی دریافت می‌کنید که محدود به مسیرهای فهرست‌شده نیست و دقیقاً حول نیاز شما شکل گرفته است.",
    },
  ],
  pathsUnsureTitle: "مطمئن نیستید کدام مسیر مناسب شماست؟",
  pathsUnsureBody:
    "لازم نیست پیش از مشاوره مسیر نهایی را بدانید. در جلسه ۳۰ دقیقه‌ای، هدف و نیاز شما بررسی می‌شود و مناسب‌ترین ترکیب از سرفصل‌ها پیشنهاد خواهد شد.",
  pathsUnsureCta: "برای انتخاب مسیر مناسب مشاوره رزرو کنید",
  audienceTitle: "این دوره برای چه کسانی مناسب است؟",
  audienceItems: [
    "افراد مبتدی که می‌خواهند هوش مصنوعی را اصولی شروع کنند",
    "تولیدکنندگان محتوا و مدیران شبکه‌های اجتماعی",
    "صاحبان کسب و کار و مدیرانی که به دنبال افزایش بهره‌وری هستند",
    "دیجیتال مارکترها و فریلنسرها",
    "افرادی که می‌خواهند با AI وب‌سایت یا محصول دیجیتال بسازند",
    "افرادی که یک پروژه مشخص دارند و به راهنمایی مرحله به مرحله نیاز دارند",
    "کسانی که دوره‌های عمومی دیده‌اند اما هنوز نمی‌توانند آموخته‌ها را در کار واقعی اجرا کنند",
  ],
  methodTitle: "روش آموزش در جلسات خصوصی",
  methodIntro:
    "جلسات فقط شامل معرفی ابزار یا تماشای مدرس نیستند. هر بخش با توضیح روشن شروع می‌شود، سپس یک نمونه واقعی اجرا می‌شود و بعد شما همان مهارت را روی کار یا پروژه خود تمرین می‌کنید.",
  methodSteps: [
    "توضیح مفهوم و کاربرد",
    "نمایش یک نمونه واقعی",
    "اجرای تمرین توسط شما",
    "بررسی خطا و ارائه بازخورد",
    "تبدیل آموخته به یک روند قابل تکرار",
  ],
  methodNote:
    "سرفصل، سرعت آموزش، تمرین‌ها و عمق فنی دوره بر اساس برنامه اختصاصی شما تعیین می‌شوند.",
  includedTitle: "دوره خصوصی شامل چه مواردی است؟",
  includedItems: [
    "جلسه‌های آنلاین و یک به یک با میلاد",
    "بررسی هدف، سطح فعلی و پروژه شما",
    "طراحی سرفصل اختصاصی",
    "مشخص شدن تعداد و مدت جلسات پیش از شروع",
    "آموزش عملی بر اساس نیاز واقعی شما",
    "هماهنگی زمان جلسات بر اساس وقت‌های موجود",
    "برگزاری جلسات در Google Meet",
    "ضبط تمام جلسات",
    "دسترسی دائمی به فایل جلسات ضبط‌شده",
    "اعلام کامل هزینه دوره پیش از شروع جلسات",
  ],
  processTitle: "از مشاوره تا شروع دوره",
  processSteps: [
    {
      title: "رزرو جلسه مشاوره",
      description:
        "در یک جلسه آنلاین ۳۰ دقیقه‌ای، سطح فعلی، هدف، نیاز کاری یا شخصی، پروژه موردنظر، ابزارهایی که استفاده می‌کنید و زمانی که برای یادگیری دارید بررسی می‌شود. هزینه این جلسه برای متقاضیان خارج از ایران ۳۰ دلار آمریکا و برای متقاضیان داخل ایران ۳٬۵۰۰٬۰۰۰ تومان است. اگر پس از جلسه برای شروع دوره خصوصی به توافق برسیم، کل هزینه مشاوره از مبلغ نهایی دوره کسر خواهد شد.",
    },
    {
      title: "طراحی و ارسال برنامه آموزشی",
      description:
        "ظرف ۱ تا ۲ روز پس از جلسه مشاوره، برنامه آموزشی اختصاصی شما تهیه و ارسال می‌شود. این برنامه شامل موارد زیر خواهد بود:",
      bullets: [
        "هدف و نتیجه مورد انتظار دوره",
        "تعداد جلسات",
        "مدت زمان هر جلسه",
        "سرفصل و ترتیب موضوعات",
        "پروژه یا تمرین‌های پیشنهادی",
        "هزینه کامل دوره",
      ],
    },
    {
      title: "تأیید برنامه و شروع جلسات",
      description:
        "پس از تأیید برنامه آموزشی، زمان جلسات با هماهنگی شما و بر اساس وقت‌های موجود مشخص می‌شود. جلسات در Google Meet برگزار و ضبط می‌شوند. فایل ضبط‌شده هر جلسه به صورت دائمی در اختیار شما قرار می‌گیرد تا بتوانید مطالب را دوباره مرور کنید.",
    },
  ],
  honestyTitle: "آموزش عملی، بدون وعده غیرواقعی",
  honestyBody:
    "در این دوره‌ها وعده درآمد قطعی، موفقیت فوری یا نتیجه بدون تمرین داده نمی‌شود. کیفیت نتیجه به هدف، سطح اولیه، تمرین، زمان اختصاص‌داده‌شده و اجرای شما وابسته است. هدف MX AI Academy ارائه یک مسیر روشن، کاربردی و شخصی‌سازی‌شده است تا بتوانید با درک بهتر و وابستگی کمتر به آموزش‌های پراکنده، پروژه خود را پیش ببرید.",
  instructorSectionTitle: "یادگیری مستقیم با میلاد",
  faqTitle: "سؤالات متداول دوره خصوصی هوش مصنوعی",
  faqs: [
    {
      id: "faq-difference",
      question: "دوره خصوصی هوش مصنوعی چه تفاوتی با دوره عمومی دارد؟",
      answer:
        "در دوره عمومی، همه هنرجویان یک برنامه ثابت را دنبال می‌کنند. در دوره خصوصی، سرفصل، سرعت، تعداد جلسات و تمرین‌ها بر اساس سطح، هدف و پروژه شما طراحی می‌شوند.",
    },
    {
      id: "faq-experience",
      question: "آیا برای شرکت در دوره به دانش قبلی نیاز دارم؟",
      answer:
        "خیر. اگر مبتدی باشید، برنامه از مفاهیم و مهارت‌های پایه شروع می‌شود. اگر تجربه قبلی داشته باشید، سطح شما در جلسه مشاوره بررسی می‌شود تا مطالب تکراری حذف و تمرکز روی نیازهای پیشرفته‌تر قرار گیرد.",
    },
    {
      id: "faq-consultation",
      question: "جلسه مشاوره شامل چه مواردی است؟",
      answer:
        "در جلسه ۳۰ دقیقه‌ای درباره هدف، سطح فعلی، نوع فعالیت، پروژه، ابزارهای مورد استفاده، محدودیت‌ها و زمان‌بندی شما صحبت می‌کنیم. این جلسه مبنای طراحی برنامه آموزشی اختصاصی است.",
    },
    {
      id: "faq-consultation-cost",
      question: "هزینه جلسه مشاوره چقدر است؟",
      answer:
        "هزینه مشاوره برای متقاضیان خارج از ایران ۳۰ دلار آمریکا و برای متقاضیان داخل ایران ۳٬۵۰۰٬۰۰۰ تومان است.",
    },
    {
      id: "faq-credit",
      question: "آیا هزینه مشاوره از هزینه دوره کسر می‌شود؟",
      answer:
        "بله. اگر پس از مشاوره برای شروع دوره خصوصی به توافق برسیم، کل هزینه پرداخت‌شده برای مشاوره از مبلغ نهایی دوره کسر می‌شود.",
    },
    {
      id: "faq-course-cost",
      question: "هزینه کامل دوره خصوصی چقدر است؟",
      answer:
        "هزینه دوره ثابت نیست، زیرا هر برنامه بر اساس هدف، تعداد جلسات، مدت هر جلسه، سطح فنی و موضوعات موردنیاز طراحی می‌شود. مبلغ کامل در برنامه آموزشی اعلام می‌شود و پیش از تأیید شما هیچ جلسه‌ای آغاز نخواهد شد.",
    },
    {
      id: "faq-sessions",
      question: "دوره خصوصی چند جلسه است؟",
      answer:
        "تعداد جلسات به هدف، سطح فعلی و وسعت موضوعات بستگی دارد. تعداد دقیق جلسات ظرف ۱ تا ۲ روز پس از مشاوره در برنامه آموزشی شما مشخص می‌شود.",
    },
    {
      id: "faq-length",
      question: "هر جلسه چقدر طول می‌کشد؟",
      answer:
        "مدت هر جلسه بر اساس نوع مسیر و نیاز آموزشی تعیین می‌شود و پیش از شروع در برنامه اختصاصی شما نوشته خواهد شد.",
    },
    {
      id: "faq-start",
      question: "جلسات چه زمانی شروع می‌شوند؟",
      answer:
        "پس از تأیید برنامه و هزینه، زمان جلسات با هماهنگی شما و بر اساس وقت‌های موجود تعیین می‌شود.",
    },
    {
      id: "faq-where",
      question: "جلسات کجا برگزار می‌شوند؟",
      answer: "تمام جلسات به صورت آنلاین و در Google Meet برگزار می‌شوند.",
    },
    {
      id: "faq-recorded",
      question: "آیا جلسات ضبط می‌شوند؟",
      answer:
        "بله. جلسات ضبط می‌شوند و فایل آن‌ها برای مرور دوباره به صورت دائمی در اختیار شما قرار می‌گیرد.",
    },
    {
      id: "faq-combine",
      question: "آیا می‌توانم چند موضوع را در یک دوره ترکیب کنم؟",
      answer:
        "بله. برای مثال می‌توان آموزش تولید محتوا را با هوش مصنوعی برای کسب و کار ترکیب کرد یا طراحی وب‌سایت را همراه با وایب کدینگ و اتوماسیون n8n یاد گرفت. ترکیب نهایی باید با هدف و زمان شما منطقی باشد.",
    },
    {
      id: "faq-project",
      question: "آیا می‌توانم روی پروژه شخصی یا کاری خودم کار کنم؟",
      answer:
        "بله. پروژه شما در جلسه مشاوره بررسی می‌شود. اگر اندازه و پیچیدگی آن با مدت دوره هماهنگ باشد، می‌توان آن را به عنوان بخش عملی برنامه آموزشی در نظر گرفت.",
    },
    {
      id: "faq-tools",
      question: "از چه ابزارهایی در دوره استفاده می‌شود؟",
      answer:
        "ابزارها بر اساس هدف شما، سطح فنی، دسترسی و تغییرات بازار انتخاب می‌شوند. نام ابزارهای اصلی موردنیاز در برنامه آموزشی نوشته خواهد شد تا پیش از شروع بدانید به چه مواردی نیاز دارید.",
    },
    {
      id: "faq-paid-tools",
      question: "اگر یک ابزار پولی لازم باشد چه می‌شود؟",
      answer:
        "اگر مسیر شما به ابزار یا اشتراک پولی نیاز داشته باشد، نام و هزینه تقریبی آن پیش از شروع اعلام می‌شود. شرایط پرداخت اشتراک‌های شخص ثالث در پیشنهاد نهایی دوره به صورت شفاف نوشته می‌شود.",
    },
  ],
  finalTitle: "آماده‌اید یک مسیر یادگیری مخصوص خودتان داشته باشید؟",
  finalBody:
    "اگر نمی‌خواهید بین آموزش‌های پراکنده و ابزارهای متعدد سردرگم بمانید، جلسه مشاوره را رزرو کنید. در این جلسه هدف شما را بررسی می‌کنیم و مشخص می‌کنیم چه مهارت‌ها، چه ابزارهایی و چه تعداد جلسه برای رسیدن به نتیجه موردنظر مناسب‌تر است.",
  finalPriceLabel: "هزینه جلسه ۳۰ دقیقه‌ای",
  finalPriceOutside: "خارج از ایران: ۳۰ دلار آمریکا",
  finalPriceInside: "داخل ایران: ۳٬۵۰۰٬۰۰۰ تومان",
  finalCreditNote:
    "در صورت توافق برای شروع دوره خصوصی، کل هزینه مشاوره از مبلغ نهایی دوره کسر می‌شود.",
  finalCta: "رزرو جلسه مشاوره ۳۰ دقیقه‌ای",
  finalHint:
    "برای انتخاب زمان و تکمیل رزرو به تقویم گوگل هدایت می‌شوید.",
};

export const privateCoursePageContent: Record<Locale, PrivateCoursePageCopy> = {
  EN: en,
  FA: fa,
};
