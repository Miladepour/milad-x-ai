-- Quick fix: strip checkmark emojis from the Claude Farsi extension blog post
update public.blog_posts
set
  content = replace(replace(content, '✅ ', ''), '✅', ''),
  updated_at = now()
where slug = 'claude-farsi-extension-rtl'
  and locale = 'FA';
