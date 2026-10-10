# Bhoben Narzary – Portfolio

A static React + Vite + Tailwind portfolio deployed on Cloudflare Pages.
The website content is managed through a Google-sign-in admin panel
backed by Firebase.

## Live Website

https://bhoben.pages.dev

## Features

- Responsive portfolio website
- Firebase Google authentication for admin access
- Live content management for projects, skills, and experience
- CV/resume management
- Firestore security rules for admin-only writes

## Edit Content

You can update portfolio content without changing the code.

1. Open the live website.
2. Click the lock icon.
3. Sign in with the authorized Google account.
4. Update projects, skills, experience, or CV.
5. Save your changes.

Content is stored in Firebase and displayed on the website.

## Run Locally

Requirements: Node.js and npm.

Install dependencies:

    npm install

Create a `.env.local` file in the project root and configure:

    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_APP_ID=your_firebase_app_id
    VITE_ADMIN_EMAIL=your_admin_email

Start the development server:

    npm run dev

Build for production:

    npm run build

The generated production files are placed in the `dist` directory.

## Deployment on Cloudflare Pages

This project is connected to GitHub and deployed through Cloudflare Pages.

Build settings:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: `None` (manual Vite configuration)

Configure the following environment variables in Cloudflare Pages:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_EMAIL`

### Deploy Updates

After modifying the code:

    git add .
    git commit -m "Update portfolio"
    git push

Cloudflare Pages automatically builds and deploys changes pushed to
the connected GitHub production branch.

Content changes made through the Firebase admin panel do not require
a new deployment.

## Security Notes

- Admin access uses Google sign-in.
- Firestore security rules restrict writes to the authorized admin account.
- Firebase web configuration is public by design.
- Never commit service-account keys, private credentials, or other secrets.
- `.env*` files are excluded through `.gitignore`.
- The production build includes a Content Security Policy.
- External links use `rel="noopener noreferrer"`.
- Project URLs are restricted to HTTP and HTTPS.
