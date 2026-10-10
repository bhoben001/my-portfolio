# Firebase setup (one time, ~10 minutes, free Spark plan)

## 1. Create the project
1. Go to https://console.firebase.google.com → **Add project** (disable Google Analytics, you don't need it).
2. **Project settings (gear) → General → Your apps → Web (`</>`)** → register an app (skip Hosting).
   Copy `apiKey`, `authDomain`, `projectId`, `appId` from the config shown.

## 2. Turn on Google sign-in
**Build → Authentication → Get started → Sign-in method → Google → Enable** → Save.
Do **not** enable Email/Password – there is no password in this setup at all.

Then **Authentication → Settings → Authorized domains → Add domain**:
`YOUR-GITHUB-USERNAME.github.io`  (`localhost` is already there for local testing)

## 3. Create the database + lock it down
1. **Build → Firestore Database → Create database** → choose a region near you → **Production mode**.
2. Open the **Rules** tab, paste the contents of `firestore.rules` from this repo,
   **replace `YOUR_ADMIN_EMAIL@gmail.com` with your own Gmail**, and click **Publish**.

Those rules are what really protect your site: anyone can *read* the content, but only your
verified Google account can *write* it. Even if someone edits the JavaScript in their browser,
Firebase will reject their writes.

## 4. Give GitHub the config
Repo → **Settings → Secrets and variables → Actions → New repository secret**. Add these 5:

| Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | authDomain (`xxxx.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | projectId |
| `VITE_FIREBASE_APP_ID` | appId |
| `VITE_ADMIN_EMAIL` | your Gmail (same one as in the rules) |

Then **Settings → Pages → Source: GitHub Actions**, and push to `main`.

## 5. (Recommended) Restrict the API key
Google Cloud Console → **APIs & Services → Credentials** → open the *Browser key* →
**Application restrictions: Websites** → add `https://YOUR-GITHUB-USERNAME.github.io/*` and `http://localhost:*`.

## Local development
Copy `.env.example` to `.env.local`, fill in the values, run `npm install && npm run dev`.

## Using the admin
Click the 🔒 in the navbar → sign in with your Google account. You'll see **CV**, **+ Project** and
**Logout** in the navbar, **Edit skills / Edit experience** buttons on those sections, and
edit/delete icons on each project card. Changes are live for all visitors immediately – no rebuild needed.
Signing in with any other Google account does nothing (it is signed out again and the rules block writes).

## Troubleshooting
- *"unauthorized domain"* → step 2, add your github.io domain.
- *"Permission denied" when saving* → the email in the rules doesn't exactly match your Google account, or the rules weren't published.
- *Sign-in popup does nothing* → allow popups for the site; check the browser console for a Content-Security-Policy message.
