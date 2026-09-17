# 今晚收工 · CLOCK OUT

Take your night back. A mobile-first wind-down app with Chinese / English switching, a lazy cat companion, a furnished room, sound, breathing guidance, nightly notes and LIFE rewards.

## Run locally

Requires Node.js 22.13 or newer and pnpm 11.25.0 (the version in package.json).

```sh
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Open the localhost URL printed by the development server (normally http://localhost:5173).
No API keys, login or database are required for the current app.

## Build and check

```sh
pnpm exec tsc --noEmit
node --experimental-strip-types --test tests/*.test.mjs
pnpm build
pnpm start
```

The app uses React, TypeScript, Tailwind CSS and Vinext (Next.js-compatible routing), with a Cloudflare Worker build. GitHub stores the source; uploading it does not deploy a website. This is not a static GitHub Pages export. The existing live Sites deployment remains separate.

## Upload to GitHub

Unzip this archive first. Create an empty GitHub repository, then run the following inside the extracted `clock-out` folder. Replace YOUR_USERNAME with your GitHub username and adjust the repository name if needed.

```sh
git init
git add .
git commit -m "Add CLOCK OUT app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clock-out.git
git push -u origin main
```

Alternatively, use GitHub Desktop: add the extracted folder as a local repository, create a commit and publish it.

## Main files

- `app/page.tsx`: onboarding, ritual, home, room and LIFE screens
- `app/globals.css`: visual system and animations
- `components/slow-space.tsx`: sound and breathing controls
- `lib/copy.json` and `lib/i18n.tsx`: Chinese / English copy and language switching
- `lib/clock-out.ts`: nightly records and reward rules
- `lib/sound.ts`: audio playback
- `public/`: cat and room images, sound files
- `tests/`: reward, note, translation and audio logic checks

## Data and behavior

Records are stored per browser in localStorage (`clock-out-v3`), and language preference in `clock-out-language`. This source archive contains no user records or test history. A new browser/origin starts empty; use the in-app reset option to clear an existing browser's records.

Clock-out times are self-reported. The web app does not detect sleep or track other apps. A night runs from noon to the next noon in Malaysian time. Each night earns 100 LIFE, plus 50 for a nonempty note or gratitude entry, once per night. Next-day notes appear when the app is opened, not as background push notifications. Sound requires a user tap; device volume and browser playback policies still apply.

## Export details

Based on source commit ea9a649adf588f9bd75de948e5d35ebaaf8297a0.
Includes application source, assets, lockfile and build helpers. Git history, credentials, dependencies, local runtime state and generated build output are excluded. `.openai/hosting.json` retains empty binding declarations needed by the build, with the original hosted project identifier removed. The original starter documentation is in `docs/STARTER.md`.
