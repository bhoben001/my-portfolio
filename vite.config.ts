import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * GitHub Pages cannot send custom HTTP headers, so we add a Content-Security-Policy
 * via <meta> in the production build only (dev server needs inline scripts for HMR).
 * It blocks inline scripts and any script/connection except Google/Firebase.
 */
function cspPlugin(): Plugin {
  const csp = [
    "default-src 'self'",
    // apis.google.com / gstatic: loaded by Firebase Auth for the Google sign-in popup
    "script-src 'self' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    // Firebase Auth + Firestore
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com",
    "frame-src https://*.firebaseapp.com https://accounts.google.com https://apis.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ');

  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
      );
    },
  };
}

export default defineConfig({
  // Relative base works for both username.github.io and username.github.io/repo-name
  base: './',
  plugins: [react(), tailwindcss(), cspPlugin()],
  build: {
    sourcemap: false,
  },
});
