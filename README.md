# Bhoben Narzary – Portfolio

Static React + Vite + Tailwind portfolio, deployed on GitHub Pages.
Content is edited live through a Google-sign-in admin backed by **Firebase** (see `FIREBASE_SETUP.md`).
There are **no passwords or private keys** in this repo.

## Edit content
- **Live (recommended):** sign in on the site with the 🔒 button → add/edit projects, skills, experience, CV.
- Defaults / fallback content, email and social links → `src/data/siteData.ts`
- Photo → `src/assets/images/bhoben-avatar.webp`

## Run locally
```bash
npm install
npm run dev
```

## Deploy on GitHub Pages
0. Complete `FIREBASE_SETUP.md` first.
1. Push this folder to a GitHub repo (branch `main`).
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push again (or run the workflow manually in the **Actions** tab). Done.

## Security notes
- No passwords exist anywhere. Admin = Google sign-in; Firestore rules allow writes only for your verified Google email.
- The Firebase web config is public by design (not a secret). Never put real secrets (service-account keys, etc.) in a Vite/React app.
- `.env*` files are git-ignored.
- A Content-Security-Policy is added to the production build.
- All external links use `rel="noopener noreferrer"` and only `http(s)` URLs are allowed for projects.
