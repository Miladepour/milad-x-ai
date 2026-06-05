import type { Tutorial } from "../types";
import { youtubeThumbnailUrl } from "../youtube";

const YOUTUBE_ID = "NMlyL61Kgyk";

export const claudeMotionGraphicsFa: Tutorial = {
  slug: "motion-graphics-claude-design",
  locale: "FA",
  youtubeId: YOUTUBE_ID,
  title: "آموزش ساخت موشن گرافیک رایگان | Claude Design",
  author: "میلاد",
  excerpt:
    "با یک پرامپت و Claude AI در کمتر از ۵ دقیقه ویدیو موشن گرافیک حرفه‌ای بسازید — ورود به Claude Design، ساخت پروژه، تنظیم Design System و خروجی MP4.",
  coverImage: youtubeThumbnailUrl(YOUTUBE_ID),
  publishedAt: "2026-04-01",
  date: "۱ آوریل ۲۰۲۶",
  content: `<p>در این ویدیو نشان می‌دهم چطور می‌توانید با یک پرامپت و استفاده از Claude AI، در کمتر از ۵ دقیقه یک ویدیو موشن گرافیک حرفه‌ای با هوش مصنوعی بسازید.</p>
<p>مرحله‌به‌مرحله توضیح داده‌ام که چطور وارد Claude Design شوید، پروژه بسازید، Design System را روی Animated Video تنظیم کنید و پرامپت آماده‌تان را اجرا کنید.</p>

<h2>مراحل کلی</h2>
<ul>
  <li>ورود به Claude Design</li>
  <li>ساخت پروژه جدید</li>
  <li>تنظیم Design System روی حالت Animated Video</li>
  <li>اجرای پرامپت آماده برای ساخت موشن گرافیک</li>
  <li>خروجی گرفتن ویدیو با Claude Code</li>
</ul>

<h2>پرامپت خروجی ویدیو در Claude Code</h2>
<p>زمان خروجی گرفتن ویدیو، این پرامپت را در Claude Code استفاده کنید:</p>
<blockquote>Using Playwright + ffmpeg export this animation as MP4</blockquote>`,
};
