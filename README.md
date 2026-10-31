# SK Digital Seva Portal

A static frontend starter for a cyber-cafe services portal:
- Customer signup and login (Supabase Auth)
- New customer accounts start as `pending`
- Admin approval / block controls
- Admin-managed HTTPS service directory
- Customer dashboard and service click activity log
- Premium Blue & White responsive layout

## Free stack
- GitHub Pages: static website hosting
- Supabase Free: Auth + PostgreSQL database
- HTML, CSS and JavaScript

Free tiers and provider limits can change. Supabase Free projects may pause after inactivity. Check current provider terms before relying on this for business operations.

## Setup

### 1. Create Supabase project
1. Create a project at https://supabase.com/dashboard
2. Open **SQL Editor → New query**.
3. Paste all contents of `supabase-setup.sql` and run it.
4. Open **Authentication → URL Configuration** and set your site URL after GitHub Pages is enabled. Add the GitHub Pages URL to Redirect URLs.
5. For a first test, you can temporarily disable email confirmation under Authentication settings; for a real portal, configure email confirmation/SMTP properly.

### 2. Configure frontend
1. Open `config.js`.
2. Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with the Project URL and Publishable (or legacy anon) key from Supabase Project Settings → API.
3. Never put a `service_role` or Secret key in browser code or GitHub.

### 3. Create your Admin account
1. Open the portal and use Customer Signup with your own email.
2. Confirm your email if email confirmation is enabled.
3. In Supabase SQL Editor, run this, replacing the email:
   ```sql
   update public.profiles
   set role='admin', status='approved'
   where email='YOUR_ADMIN_EMAIL@example.com';
   ```
4. Log in again. You should see Customer Approvals and Manage Services.

Only do this for the account you own. Do not share admin credentials.

### 4. Test customer approval
1. Sign up using a second test email.
2. In Admin → Customer Approvals, click Approve.
3. The customer logs out and logs back in; services should now be visible.
4. Try Block to suspend access.

### 5. Publish with GitHub Pages
1. Create a GitHub repository, e.g. `sk-digital-seva-portal`.
2. Upload `index.html`, `style.css`, `app.js`, `config.js` and this README. (The SQL file may remain in your private working copy; do not upload database passwords or secrets.)
3. In repository Settings → Pages, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, Save.
4. Wait for GitHub Pages to publish. Add the resulting `https://YOURNAME.github.io/sk-digital-seva-portal/` URL to Supabase Authentication URL Configuration.

## Important security / legal limits before real customer use
- This starter stores customer profile data and service usage logs, not application forms or identity documents.
- Do not collect/store Aadhaar numbers, PAN numbers, OTPs, biometric information, government portal passwords, or scans in this starter.
- Do not proxy or automate government websites. Open official HTTPS destinations in a new tab. Follow each portal's operator/agent authorization requirements; adding a link does not make the cafe an authorized service provider.
- Admin can approve/block accounts and manage links, but cannot view a customer's password. Passwords are handled by Supabase Auth.
- Keep RLS enabled. Test with separate admin and customer accounts before production.
- Supabase Free is not a guaranteed business-grade backup/uptime plan. Export backups and review terms/limits regularly.
- This is a working starter, not a complete regulated-service/CSC integration. Have a qualified developer review security, privacy notices, consent, retention, and local legal requirements before accepting real customer data or payments.

## Files
- `index.html` — app shell and forms
- `style.css` — responsive Blue & White UI
- `app.js` — Supabase auth, dashboards, approval and service management
- `config.js` — public project configuration placeholders
- `supabase-setup.sql` — schema, trigger, RLS policies and sample official links
