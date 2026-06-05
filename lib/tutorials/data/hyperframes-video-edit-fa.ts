import type { Tutorial } from "../types";
import { youtubeThumbnailUrl } from "../youtube";

const YOUTUBE_ID = "KXnKd8Xi9LI";

export const hyperframesVideoEditFa: Tutorial = {
  slug: "edit-video-hyperframes",
  locale: "FA",
  youtubeId: YOUTUBE_ID,
  title: "ادیت ویدیو با هوش مصنوعی کاملاً رایگان | HyperFrames + Claude + ChatGPT",
  author: "میلاد",
  excerpt:
    "یاد بگیرید چطور با ایجنت‌های Claude و ChatGPT و پلتفرم HyperFrames ویدیوهایتان را حرفه‌ای ادیت کنید یا از صفر بسازید — کاملاً رایگان با لیمیت اکانت خودتان.",
  coverImage: youtubeThumbnailUrl(YOUTUBE_ID),
  publishedAt: "2026-04-15",
  date: "۱۵ آوریل ۲۰۲۶",
  content: `<p>در این ویدیو یاد می‌گیرید چطور با کمک ایجنت‌های هوش مصنوعی، ویدیوهایتان را به صورت حرفه‌ای ادیت کنید و ویدیوهای جدید بسازید.</p>
<p>این کار را با دو ابزار قدرتمند انجام می‌دهیم: Claude و ChatGPT. مهم‌ترین نکته این است که کل این فرآیند کاملاً رایگان است چون فقط از لیمیت اکانتی که دارید استفاده می‌کنید.</p>

<h2>HyperFrames چیست؟</h2>
<p>ابزار اصلی که در این ویدیو با آن کار می‌کنیم <strong>HyperFrames</strong> است. یک پلتفرم هوشمند که از طریق کدنویسی HTML و CSS با کمک AI ویدیوهای شما را ادیت می‌کند یا از صفر می‌سازد و در نهایت خروجی با کیفیت بالا می‌دهد. نیازی به دانستن کدنویسی ندارید — فقط یک پرامپت کافی است.</p>

<h2>ادیت ویدیو با ChatGPT و Codex</h2>
<p>برای ادیت ویدیو با ChatGPT از پلتفرم <strong>Codex</strong> استفاده می‌کنیم — ابزار رسمی OpenAI برای کدنویسی از طریق agent. بعد از نصب و لاگین، پلاگین HyperFrames را به آن اضافه می‌کنید، فولدر ویدیویتان را معرفی می‌کنید و پرامپت آماده را paste می‌کنید. AI تمام مراحل ادیت را خودش انجام می‌دهد.</p>

<h2>ساخت زیرنویس با NotebookLM</h2>
<p>اگر transcript ویدیوی صوتی ندارید، با <strong>Google NotebookLM</strong> می‌توانید فایل صوتی را آپلود کنید و به صورت کاملاً رایگان متن آن را بگیرید. سپس آن را به صورت فایل text ذخیره کنید و کنار ویدیو در فولدر بگذارید تا AI بتواند زیرنویس فارسی را دقیق اضافه کند.</p>

<h2>لینک‌های مفید</h2>
<ul>
  <li>ChatGPT Codex: <a href="https://chatgpt.com/codex" target="_blank" rel="noreferrer noopener">chatgpt.com/codex</a></li>
  <li>Claude Desktop: <a href="https://claude.com/download" target="_blank" rel="noreferrer noopener">claude.com/download</a></li>
  <li>HyperFrames: <a href="https://www.hyperframes.dev" target="_blank" rel="noreferrer noopener">hyperframes.dev</a></li>
  <li>فایل پرامپت‌های آماده: <a href="https://docs.google.com/document/d/1cwro-el5pXnRIOqLURyvqhssqRBZe5VepPGEJc0NUI8/edit?usp=sharing" target="_blank" rel="noreferrer noopener">Google Docs</a></li>
</ul>`,
};
