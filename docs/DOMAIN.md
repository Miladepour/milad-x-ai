# Domain setup (one.com → Vercel)

Your nameservers point to Vercel. DNS is managed in **Vercel**, not one.com (except NS records at one.com).

## Why `mxaiacademy.com` failed but `www` worked

- `*.mxaiacademy.com` (wildcard) covers **subdomains** like `www`, `blog`, etc.
- It does **not** cover the **apex** root: `mxaiacademy.com` (no subdomain).
- You must add **`mxaiacademy.com`** explicitly to the **project**.

## Step 1 — one.com (nameservers only)

At one.com, domain **mxaiacademy.com** should use Vercel nameservers (you already did this):

- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

Do not add A/CNAME at one.com if DNS is on Vercel.

## Step 2 — Vercel project domains

1. Open [vercel.com](https://vercel.com) → project **milad-x-ai**
2. **Settings** → **Domains**
3. Click **Add** and add:
   - `mxaiacademy.com`
   - `www.mxaiacademy.com` (if not already listed)
4. Assign both to **Production**
5. For `mxaiacademy.com`, enable **Redirect to www** (recommended), or rely on `vercel.json` in this repo.

Wait until both show **Valid Configuration**.

## Step 3 — Vercel DNS records

Open **Vercel** → **Domains** → **mxaiacademy.com** → **DNS Records**.

If empty or wrong, add:

| Type  | Name | Value                 |
|-------|------|------------------------|
| A     | `@`  | `76.76.21.21`          |
| CNAME | `www`| `cname.vercel-dns.com` |

(Vercel may auto-fill these when you add the domain to the project.)

## Step 4 — Environment variables

**Vercel** → **milad-x-ai** → **Settings** → **Environment Variables**:

```env
NEXT_PUBLIC_SITE_URL=https://www.mxaiacademy.com
```

Redeploy after saving.

## Step 5 — Supabase Auth URLs

**Authentication** → **URL Configuration**:

- **Site URL:** `https://www.mxaiacademy.com`
- **Redirect URLs:**
  - `https://www.mxaiacademy.com/**`
  - `https://mxaiacademy.com/**`
  - `http://localhost:3000/**`

## Admin URL (production)

```
https://www.mxaiacademy.com/mx-console-1fdecfa14d9f5494
```

After apex is connected, `https://mxaiacademy.com/...` redirects to `www` via `vercel.json`.

## Checklist

- [ ] Nameservers at one.com → Vercel
- [ ] `mxaiacademy.com` + `www.mxaiacademy.com` on project **milad-x-ai**
- [ ] DNS A + CNAME in Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.mxaiacademy.com`
- [ ] Redeploy
- [ ] Supabase Site URL updated
