-- Farsi blog: Paper Cut Collage with ChatGPT and Higgsfield
-- Run in Supabase SQL editor (updates existing post)

insert into public.blog_posts (
  slug,
  locale,
  title,
  author,
  cover_image,
  excerpt,
  content,
  date,
  published_at
)
values (
  'paper-cut-collage-prompt',
  'FA',
  'راهنمای ساخت تصویر Paper Cut Collage با ChatGPT و Higgsfield',
  'MX AI Academy',
  '/images/Paper Cut Collage.jpeg',
  'راهنمای گام‌به‌گام ساخت تصویر Paper Cut Collage با ChatGPT و Higgsfield، از پیدا کردن تصویر مرجع در Pinterest تا ساخت ویدیو با Seedance.',
  $html$
<h2>مرحله ۱. پیدا کردن تصویر مرجع</h2>

<p>اول وارد <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer noopener">Pinterest</a> شوید.</p>

<p>در Pinterest این عبارت را سرچ کنید:</p>

<p>paper cut collage poster</p>

<p>یک تصویر پیدا کنید که سبک، ترکیب بندی، رنگ، حس و حال یا چیدمان آن را دوست دارید.</p>

<p>بعد تصویر را کپی کنید یا اسکرین شات بگیرید و داخل <a href="https://chatgpt.com/" target="_blank" rel="noreferrer noopener">ChatGPT</a> آپلود کنید.</p>

<p>همراه با تصویر، پرامپتی که پایین قرار داده شده را هم در ChatGPT قرار دهید.</p>

<h2>مرحله ۲. تکمیل پرامپت</h2>

<p>در پرامپت، بخش‌هایی که داخل [ ] نوشته شده‌اند را با اطلاعات دلخواه خودتان پر کنید.</p>

<p>ترجمه بخش‌های مهم:</p>

<p>Main subject یعنی سوژه اصلی</p>

<p>Text to include یعنی متنی که می‌خواهید داخل تصویر باشد</p>

<p>Colour palette یعنی پالت رنگی</p>

<p>Main elements to include یعنی عناصر اصلی که باید داخل تصویر باشد</p>

<p>Extra elements to add یعنی عناصر اضافی یا جزئیات تکمیلی</p>

<p>Mood یعنی حس و حال تصویر</p>

<p>Aspect ratio یعنی نسبت تصویر</p>

<p>اگر به هر کدام از این بخش‌ها نیاز ندارید، آن بخش را حذف کنید.</p>

<p>مثلاً اگر نمی‌خواهید متنی روی تصویر باشد، در بخش Text to include بنویسید:</p>

<p>No text.</p>

<p>نکته مهم:</p>

<p>این پرامپت در زبان انگلیسی خیلی بهتر کار می‌کند.</p>

<p>اگر ایده شما فارسی است، یک چت جدید در <a href="https://chatgpt.com/" target="_blank" rel="noreferrer noopener">ChatGPT</a> باز کنید، ایده خودتان را فارسی بنویسید و از ChatGPT بخواهید آن را به انگلیسی تبدیل کند.</p>

<p>بعد متن انگلیسی را داخل بخش‌های [ ] قرار دهید.</p>

<p><strong>PROMPT TEMPLATE:</strong></p>

<!-- prompt-template -->

<!-- course-cards -->

<h2>مرحله ۳. ساخت تصویر</h2>

<p>وقتی ChatGPT پرامپت نهایی را به شما داد، می‌توانید همان پرامپت را به ChatGPT بدهید و از آن بخواهید تصویر را برای شما بسازد.</p>

<p>یا می‌توانید از ابزارهای دیگر مثل Nano Banana 2 در <a href="https://higgsfield.ai/" target="_blank" rel="noreferrer noopener">Higgsfield</a> یا هر پلتفرمی که اکانت دارید استفاده کنید.</p>

<p>پرامپت نهایی را داخل ابزار ساخت تصویر قرار دهید.</p>

<p>سایز یا نسبت تصویر مورد نظر خودتان را انتخاب کنید.</p>

<p>بعد تصویر را generate کنید.</p>

<h2>مرحله ۴. تبدیل تصویر به ویدیو در Higgsfield</h2>

<p>بعد از اینکه تصویر نهایی را ساختید، وارد <a href="https://higgsfield.ai/" target="_blank" rel="noreferrer noopener">Higgsfield</a> شوید.</p>

<p>برای این بخش باید در Higgsfield اکانت داشته باشید.</p>

<p>داخل Higgsfield به بخش Video بروید.</p>

<p>روی Seedance کلیک کنید.</p>

<p>مدل Seedance Mini را انتخاب کنید.</p>

<p>زمان ویدیو، سایز ویدیو و کیفیت ویدیو را انتخاب کنید.</p>

<p>تصویری که ساخته‌اید را آپلود کنید.</p>

<p>کمی صبر کنید تا تصویر کامل آپلود شود. این مرحله ممکن است ۱ تا ۲ دقیقه طول بکشد.</p>

<p>بعد از آپلود تصویر، پرامپت زیر را وارد کنید:</p>

<p><strong>ANIMATION PROMPT:</strong></p>

<!-- prompt-animation -->

<h2>مرحله ۵. ساخت ویدیو</h2>

<p>بعد از وارد کردن پرامپت، روی Generate بزنید.</p>

<p>صبر کنید تا ویدیو ساخته شود.</p>

<p>در پایان، شما یک تصویر Paper Cut Collage دارید که به شکل تکه‌های کاغذی و مرحله به مرحله وارد صحنه می‌شود و به ترکیب نهایی تبدیل می‌شود.</p>

<!-- course-cards -->
$html$,
  '۲۳ ژوئن ۲۰۲۶',
  now()
)
on conflict (slug, locale) do update set
  title = excluded.title,
  author = excluded.author,
  cover_image = excluded.cover_image,
  excerpt = excluded.excerpt,
  content = excluded.content,
  date = excluded.date,
  published_at = excluded.published_at,
  updated_at = now();
