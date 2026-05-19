## Goal

Apnar admin login flow ar password ek dom same thakbe ("1122" diyei login korben), kintu hacker ra ar:
- Password ta browser bundle theke read korte parbe na
- Anon API key diye direct database e likhte / mute / read korte parbe na
- `notify-admin` edge function abuse kore admin inbox flood korte parbe na
- Leads er PII (name, email, phone, message) public ভাবে dekhte parbe na

Kono "user signup/login" add hocche na — eta still ekta portfolio site. Sudhu admin gate ta secure hocche.

---

## Approach (high level)

```text
Browser (public visitor)         Browser (admin)              Edge Functions             Database
─────────────────────────         ───────────────              ──────────────             ────────
  read site_settings    ───────────────────────────────────────────────────────────────►  RLS: public SELECT ✓
  submit lead/review    ──► submit-lead / submit-review ──►  insert + notify-admin ──►  service role
                                                                                          (RLS bypass)

                                  type "1122" ──► admin-login ──► check ADMIN_PASSWORD ──► returns token
                                  edit content ──► admin-write ──► verify token ─────────► service role
```

- Frontend e "1122" ar thakbe na. Apni jokhon password type korben, oi password edge function e jay, server e `ADMIN_PASSWORD` secret er sathe match hoy, then ekta short-lived signed token return ashe.
- Sob admin write (site_settings update, blog/case study/portfolio CRUD, review approve/delete, lead delete, etc.) oi token niye edge function er madhyom e hobe — direct supabase client theke noy.
- Public visitor ra sudhu read korte parbe (jegula public hote hobe) ar form submit korte parbe (lead/review insert) — kintu shei insert o ekta edge function diye hobe, jate validation + rate-limit + notification ek shathe hoy.

---

## Database changes (migration)

Sob "USING (true)" wide-open policy drop kore, restrictive RLS bhalo ভাবে set hobe:

- **`leads`**
  - Drop: public SELECT, public DELETE, public INSERT
  - Keep: kichu nei; sob access service role diye edge function theke
- **`reviews`**
  - Drop: public INSERT, public UPDATE, public DELETE
  - Keep: public SELECT but only `approved = true` (so site visitors see approved reviews only)
  - Admin moderation/delete: service role via edge function
- **`blog_posts`**
  - Drop: public INSERT, UPDATE, DELETE
  - Keep: public SELECT (so blog page works for visitors)
  - Admin CRUD: service role via edge function
- **`site_settings`**
  - Drop: public UPDATE
  - Keep: public SELECT (frontend needs to read content)
  - Admin update: service role via edge function
- **`page_visits`**
  - Drop: public SELECT
  - Keep: public INSERT (visit tracking still works)
  - Admin read (for analytics in dashboard): service role via edge function
- **`purge_old_leads()`** SECURITY DEFINER function — revoke EXECUTE from anon and authenticated; only service role can call it (admin endpoint).

---

## Edge functions

New / updated edge functions:

1. **`admin-login`** (new, public)
   - Input: `{ password: string }`
   - Compares to `ADMIN_PASSWORD` secret server-side.
   - On match: returns a signed token (HMAC of `{exp, role:"admin"}` using `ADMIN_JWT_SECRET`) valid for ~12 hours.
   - Includes basic IP-based rate-limit (in-memory per cold start; lightweight, but enough to slow brute-force).

2. **`admin-action`** (new, public but token-verified)
   - Input: `{ token, op, payload }`
   - Verifies HMAC token + expiry.
   - `op` whitelist: `update_site_settings`, `blog_create`, `blog_update`, `blog_delete`, `review_update`, `review_delete`, `lead_delete`, `purge_old_leads`, `leads_list`, `visits_list`.
   - Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for these specific ops only.

3. **`submit-lead`** (new, public)
   - Input: `{ name, email, phone, service, message }` — validated with Zod.
   - Inserts into `leads` via service role.
   - Internally invokes `notify-admin` with a server-side internal token.
   - Basic rate-limit (e.g., max 5 per IP per 10 min) so a bot can't spam.

4. **`submit-review`** (new, public)
   - Input: `{ name, role, quote, rating }` — validated.
   - Inserts into `reviews` with `approved=false` via service role.
   - Same internal `notify-admin` call + rate-limit.

5. **`notify-admin`** (update existing)
   - Require header `X-Internal-Token` matching `NOTIFY_INTERNAL_TOKEN` secret.
   - Without it → 401. This kills the "anyone can spam admin inbox" hole because the token never reaches the browser; only the other edge functions hold it.

---

## Frontend changes

- **`src/context/AdminContext.tsx`**
  - Remove `if (pw === "1122")` check. `login(pw)` now calls `admin-login` edge function. On success store the returned token in `localStorage` (key `anirise_admin_token`) and in memory.
  - All write helpers (`addPost`, `updatePost`, `deletePost`, `updateContent`, `updateCaseStudy`, `addLead`/`addReview` paths that go through admin moderation, `deleteLead`, `approveReview`, etc.) now call `admin-action` instead of `supabase.from(...).update/insert/delete`.
  - Reads stay direct (`supabase.from("site_settings").select()` for content, blog list, approved reviews) because RLS allows public SELECT on those.
  - For admin-only reads (leads list, all reviews including unapproved, page_visits analytics) we call `admin-action` with `leads_list` / `visits_list` ops.
  - On startup: if a saved token exists, do a lightweight `admin-action` "ping" to confirm it's still valid; if not, drop it and force re-login.

- **`src/components/site/Navbar.tsx`**
  - Remove the inline `if (adminPw === "1122")` check; use the same `login()` from context.

- **Public form submissions** (`StrategyCall.tsx`, `Testimonials.tsx`)
  - Switch from `supabase.from("leads").insert(...)` / `reviews.insert(...)` to `supabase.functions.invoke("submit-lead" | "submit-review", ...)`. Notification email keeps working through the edge function chain.

---

## Secrets to add

I'll request these via the secret tool when implementing:

- `ADMIN_PASSWORD` = `1122` (apnar same password, just stored server-side now)
- `ADMIN_JWT_SECRET` = random 32-byte string (for signing admin tokens — I'll generate)
- `NOTIFY_INTERNAL_TOKEN` = random 32-byte string (so only our other edge functions can call `notify-admin`)

`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` already ache.

---

## What stays exactly the same for you

- Admin URL ar password ("1122") — same.
- Admin dashboard er saat-shoddho features (content edit, blog CRUD, leads dekha, review approve) — same UI, same flow.
- Site visitor experience — same.
- Email notification for new leads/reviews — same inbox.

---

## What I will need from you during implementation

- Apnar approval ekta one-time secret form e ("Add ADMIN_PASSWORD = 1122" etc.) bhorbar jonno. Password apni nijei bhorben — ami dekhbo na.

---

## Out of scope (intentionally not doing)

- Proper multi-user Supabase Auth / signup-login system — apni explicitly chan na.
- Changing the admin password from "1122" — apni explicitly chan na.
- Two-factor auth for admin.

Eta later upgrade kora jabe jodi kokhono chai.