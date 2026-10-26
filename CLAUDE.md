# CLAUDE.md

**Raahe Hidayat** is an Islamic community app for Bilaspur (BSP). It covers masjid jamat times, prayer times, Qibla, the Quran and Kanzul PDFs, tasbih/zikr/durood counters with weekly rewards, notices, events and registrations, a masjid-committee portal, a local store directory and a job portal.

It's one Next.js codebase shipped two ways:
- **Web + API**: deployed on Vercel at `https://raahehidayat.vercel.app`. It's the only place the API routes run.
- **Mobile**: Tauri 2 Android (`com.prayer.madni`) and iOS (`com.prayer.raahe`). These ship a static export (`out/`) that calls the Vercel API over HTTPS.

## ⚠️ Rule #1: every change must work in the Tauri mobile app, not just the browser
The Android/iOS apps are **not native**. They're this same Next.js code running as a **static export inside a Tauri WebView**. A feature that only works in `npm run dev` in a desktop browser is **not done**. Before calling any change complete, check it against the list below.
- **No server code in pages.** There is no Node server in the app, so no server components that fetch data, no `cookies()`/`headers()`, no server actions and no `getServerSideProps`. Pages are client components (`"use client"`) that fetch through `apiClient`.
- **All data goes through `apiClient`** (`src/lib/apiClient.js`). It hits `https://raahehidayat.vercel.app` in the app. Never hardcode a relative `fetch("/api/...")` that skips it. If you use raw `fetch`/`axios`, prefix `NEXT_PUBLIC_API_BASE_URL` when `NEXT_PUBLIC_TAURI_BUILD === "1"`.
- **New API routes must be CORS-safe.** The app calls cross-origin from `tauri://localhost` / `http://tauri.localhost`. They also have to be **deployed to Vercel** before the app can use them, and older app versions already in users' hands keep calling the old API shape, so keep API changes backward-compatible.
- **No new dynamic route segments** (`[id]`) for user-facing pages. Use query params (`?id=`) with `useSearchParams` inside `<Suspense>`. If a segment is unavoidable, add `generateStaticParams` with the `__placeholder` fallback pattern.
- **Native features go through Tauri plugins, not web APIs alone.**
  - External links: `@tauri-apps/plugin-opener`, falling back to `window.open`. `target="_blank"` doesn't work.
  - Location: `@tauri-apps/plugin-geolocation`. Haptics: `plugin-haptics`. Notifications: `@choochmeque/tauri-plugin-notifications-api`. OS detection: `plugin-os`.
  - Always `await import(...)` them inside effects/handlers and wrap them in try/catch with a browser fallback.
  - A **new** plugin also needs the Rust crate in `src-tauri/Cargo.toml`, registration in `src-tauri/src/lib.rs`, a permission in `src-tauri/capabilities/default.json`, and the stub entry in `src/lib/tauri-stubs.js` + `next.config.mjs`.
  - It also means a **new store release**, unlike a pure web/API change.
- **Permissions:** anything needing camera, location, the compass (DeviceOrientation on iOS), file access or notifications needs Android `AndroidManifest.xml` / iOS `Info.plist` entries (`fix-ios-plist.sh`) and a user-gesture permission request on iOS.
- **Browser-only APIs to avoid or guard:** `window.open`, downloads via `<a download>`, `alert`/`confirm`/`prompt` (they behave poorly in the WebView; use toasts or modals), blob/object URLs across navigation, service workers and Web Push (the app uses FCM via the Tauri plugin), and `navigator.share` without a fallback.
- **Guard `window`/`document`/`localStorage`.** `next build` still prerenders pages at build time, so access these only inside `useEffect` or handlers.
- **Mobile layout:** account for safe areas/notch (`env(safe-area-inset-*)`, the `IosClassSetter` class), the fixed `TopNav`, touch targets and small screens. Don't rely on hover.
- **Assets:** use `next/image` only with `unoptimized` behaviour in mind (`images.unoptimized` in the Tauri build), or plain `<img>`. Files in `public/` get bundled into the app, so keep them small.
- **How to verify:** `npm run android:dev` (hot reload on emulator/device) or `npm run ios:dev`. At minimum, run `npm run build:tauri` and make sure the static export succeeds, then `npm run move-api` to restore the API folder.

## Stack
- Next.js 16 (App Router), React 19.1, plain **JavaScript** (no TS in `src`, `strict: false`). Path alias `@/*` → `src/*`.
- Tailwind 4 + DaisyUI 5, `forest` theme only (`src/app/globals.css`, `data-theme="forest"` in the root layout). Icons: `lucide-react`, `react-icons`. Toasts: `react-toastify`. Animation: framer-motion, gsap. Rich text: TipTap. PDFs: `pdfjs-dist` with assets in `public/pdfjs`.
- Postgres on Supabase via **Prisma 6** (`prisma/schema.prisma`). Supabase is also used for Storage buckets (`notice`, `committee`, `Quran`, …), Auth (the `/api/auth/*` user accounts) and realtime (home page).
- Push: Firebase Cloud Messaging **topics**. `firebase-admin` runs on the server and `@choochmeque/tauri-plugin-notifications-api` on device. No device-token table.
- HTTP client: `src/lib/apiClient.js` (axios). Its base URL is `NEXT_PUBLIC_API_BASE_URL`, falling back to `window.location.origin`. It rewrites `localhost` → `10.0.2.2` on the Android emulator.

## Commands
```bash
npm run dev            # next dev on 0.0.0.0:3000, webpack mode (NEXT_DISABLE_TURBOPACK=1)
npm run build          # Vercel build: move-api, prisma generate, prisma migrate, next build
npm run build:tauri    # static export to out/ (run by tauri beforeBuildCommand, rarely by hand)
npm run lint           # eslint (next/core-web-vitals)
npm run db:generate    # prisma generate
npx prisma migrate dev --name <name>   # new migration (uses DATABASE_DIRECT_URL)
npm run android:dev    # sets devUrl to LAN IP, then hot-reload on emulator/device
npm run android:build  # release AAB/APK
npm run ios:dev        # opens Xcode
npm run ios:appstore   # archive + export IPA (build-ios-appstore.sh → ipa_output/)
node scripts/push-doctor.js   # diagnose FCM/push config
```
There are no tests. To verify a change, run `npm run lint` and exercise it in `npm run dev`.

## The API-folder shuffle (important)
Static export can't contain route handlers, so the scripts move the API folder around:
- `move-api` (dev/build): `src/utils/api` → `src/app/api`
- `move-api-back` (build:tauri): `src/app/api` → `src/utils/api`

The normal state is `src/app/api/` populated and `src/utils/` empty. If a Tauri build was interrupted, the routes may be sitting in `src/utils/api`. Run `npm run move-api` before editing. **Never edit both copies.**

Consequences for the static (Tauri) build:
- Pages must be client-renderable. Detail pages take **query params**, not dynamic segments: `?id=` via `useSearchParams` in `*Client.js` components wrapped by a `page.js`, e.g. `events/view`, `local-stores/viewStore`, `masjidLists/viewThisMasjid`.
- The few `[slug]`/`[id]` routes (mostly under `admin/`) need `generateStaticParams`. The existing ones fetch the live Vercel API and fall back to a `__placeholder` param. Copy that pattern.
- `@tauri-apps/*` packages must never execute server-side. `next.config.mjs` aliases them to `src/lib/tauri-stubs.js` for the server/node bundle only. Keep the turbopack alias scoped to `node`, or push silently breaks on device (see the comment there). Import Tauri plugins with dynamic `await import(...)` inside effects/handlers.

## Layout
```
lib/                  # REAL server libs (repo root, outside src)
  prisma.js           #   singleton PrismaClient, forces pgbouncer=true + connection_limit
  supabase.js         #   anon Supabase client (null if env missing)
  push.js             #   FCM: sendTopicPush, updateTopicSubscriptions, PUSH_TOPICS, APNs→FCM token exchange
src/lib/
  apiClient.js        # axios instance — use for all client → API calls
  prisma.js           # re-export of ../../lib/prisma
  supabase.js         # broken self re-export — import root lib/supabase instead
  firebaseClient.js   # web FCM config + service-worker URL (public/firebase-messaging-sw.js)
  tauri-stubs.js      # server-side no-op stubs for Tauri plugins
src/context/          # one React context per domain; all mounted in AppProviders.js
src/components/       # shared UI (AppInitializer, UpdateBanner, ErrorPopup, loaders, …)
src/app/              # pages (public) + admin/ + api/
src-tauri/            # Rust shell (lib.rs = plugin registration only), tauri.conf.json, gen/android, gen/apple
prisma/               # schema + migrations
scripts/              # build helpers (version sync, identifiers, dev URL, push doctor)
```

### Data flow pattern
Page → `useXContext()` → `apiClient` → `src/app/api/<route>/route.js` → Prisma/Supabase.
- Each context (`src/context/*Context.js`) has `fetchAll` with a fetched-once ref and an in-flight promise ref (dedupes calls; pass `{ force: true }` to refetch), plus CRUD helpers and `getById`. Follow this shape when adding a domain.
- `AppProviders` nests every provider. `AppInitializer` fires most `fetchAll`s on app mount. New providers go in both if they need eager data.
- API routes return `NextResponse.json`, usually `{ error }` with a status on failure. Uploads use `request.formData()` and go to a Supabase Storage bucket via the **service role** key. Routes that are hit cross-origin set `export const dynamic = "force-dynamic"` and/or explicit CORS/OPTIONS handlers.
- CORS is set in three places: `middleware.js`, `next.config.mjs` `headers()` and `vercel.json`. The app on device calls cross-origin, so new routes must keep working with it.

### API routes (`src/app/api`)
`all-masjids`, `api-jamatTimes`, `api-prayerTimes` (scrapes the islamicfinder widget), `api-quran`, `kanzul`, `pdf-proxy`, `api-notice`, `api-rewards`, `api-tasbihUsers`, `api-zikr`, `api-job-lists`, `api-job-seekers` (+`/auth`), `local-stores`, `auth/{login,register,delete}` (Supabase Auth + `User` table), `events` + `events/[slug]` + `events/[slug]/submit` (public), `admin/events` (+`[slug]`, `[slug]/submissions`, `reorder`), `committee-events`, `committee-event-responses`, `masjid-committee` (+`/login`), `masjid-committee-event`, `push/topics`, `version`.

### Domain models (Prisma)
`AllMasjid` (jamat times, committee login via `loginId`/`password`, imaam/moizzan), `TasbihUser` (durood counts, weekly + history JSON), `Reward` (weekly winners), `Zikr`, `NoticeImage`, `User`, `LocalStore`, `JobList`, `JobSeeker`, `EventPage` (a form builder: `schemaFields` JSON, `slug`, `gender`, `position`) → `EventSubmission`, `CommitteeEvent` → `CommitteeEventResponse` (one per masjid per event). Newer models use snake_case `@map` columns. Match that convention per model.

## Navigation / how pages open
- The home page (`src/app/page.js`) is a grid of section cards. Each is a `CardLink` (`src/components/CardLink.client.js`). On tap it calls `router.push(href)`, injects a full-screen `#global-navigation-loader` overlay into `document.body`, and polls `location.href` every 100 ms. The overlay is removed once the URL changes, or after 10 s.
- `TopNav` is rendered in the root layout and hides itself on `/admin`, `/login` and `/pdf-viewer`. `BottomNav` exists but is commented out. Full-screen modals add `body.bottom-nav-hidden`.
- The admin area has its own `admin/layout.js`, with `AdminSidebar` and the logout that clears the cookie.
- Detail pages are opened with query strings (`/events/view?slug=…`, `/local-stores/viewStore?id=…`) so they work in the static export (see above).
- External links in the app: use `@tauri-apps/plugin-opener` (`open`/`openUrl`), falling back to `window.open`. See `jamat-times/page.js` and `UpdateBanner`. A plain `<a target="_blank">` is not reliable inside the Tauri WebView.

## PDF viewing (Quran / Para / Surah / Kanzul Imaan)
All PDFs live in **Supabase Storage** (bucket `Quran`, folder `Kanzul Imaan/`, plus the `FileTable` rows for the 30 paras). They're opened **in-app on `/quran`**, not by navigating:
1. `/quran/page.js` resolves the storage URL:
   - Para: `GET /api/api-quran` returns the `FileTable` rows, matched by `id === para number`.
   - Surah: `GET /api/api-quran?surah=<name>` builds `Quran/<name>.pdf`. The names are a hardcoded `surahs` array.
   - Kanzul: `GET /api/kanzul` returns `fileUrl`.
2. It wraps the URL as `/api/pdf-proxy?url=<encoded>`, prefixed with `NEXT_PUBLIC_API_BASE_URL` when `NEXT_PUBLIC_TAURI_BUILD=1`. The proxy only allows the `NEXT_PUBLIC_SUPABASE_URL` host. It forwards `Range`, adds CORS and sets a 1-year cache.
3. It sets `readerUrl` and shows a fixed full-screen modal (`z-[120]`) that renders `<ClientPdfViewer file={readerUrl} zoom={zoom} />`, with zoom from 0.5× to 3×.
4. `src/app/pdf-viewer/ClientPdfViewer.js`:
   - It dynamic-imports pdf.js from `/pdfjs/pdf.min.mjs` (`webpackIgnore`, worker `/pdfjs/pdf.worker.min.mjs`). It's not bundled, so update `public/pdfjs` together with `pdfjs-dist`.
   - It `fetch`es the **whole file** into an ArrayBuffer and renders the first 3 pages up front. The rest render lazily via `IntersectionObserver`.
   - Each page is drawn to a canvas at scale 1.5 and stored as a PNG data URL in `<img>`. Memory grows with the number of pages viewed.
5. `/pdf-viewer?file=<url>&title=<t>` is the same viewer as a standalone page with a back button. No current code navigates to it.

Committee event PDFs (`CommitteeEvent.pdfAttachments`, bucket `committee`) are **not** using the viewer. `committee/rhPrograms` renders them as `<a href target="_blank">`.

## Auth (all lightweight, client-side)
- **Admin** (`/admin/*`): `src/app/login/page.js` compares against hardcoded credentials and sets the cookie `isAuthenticated=true`. `middleware.js` only checks that cookie. API routes have **no auth**.
- **Masjid committee** (`/committee/*`): `POST /api/masjid-committee/login` with `loginId` and a numeric password. State lives in localStorage (`masjidCommittee_*`).
- **Job seekers**: `/api/api-job-seekers/auth`. **App users**: Supabase Auth via `/api/auth/*`.

## Push notifications
- The device subscribes on every launch (`PushNotificationContext`) to the broadcast topics (`events_programs`, `weekly_rewards`, `notices`, `job_portal`) plus `masjid_<id>` for the selected masjid, via `POST /api/push/topics`.
- Admin create/update routes call `sendTopicPush`. It's wrapped in `safely()` so a push failure never blocks the write. Keep that guarantee.
- iOS tokens are raw APNs and get exchanged for FCM tokens server-side (`lib/push.js`). Env: `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIREBASE_IOS_BUNDLE_ID`, `PUSH_APNS_SANDBOX`.

## Versioning / forced updates
- The source of truth is `src-tauri/tauri.conf.json` `version` and `bundle.android.versionCode`. Bump both for a store release.
- `scripts/sync-version.js` writes `NEXT_PUBLIC_APP_VERSION` into `.env.production.local`. `set-android-identifier.js` copies the version into `public/app-config.json` `current_version`.
- `UpdateBanner.client.jsx` always fetches `https://raahehidayat.vercel.app/app-config.json` (no-cache in `vercel.json`) and compares `min_version_*` / `latest_version_*`. **Deploy to Vercel to change mandatory-update behaviour**, no app release needed.

## Env (`.env`, see `.env.example`)
`DATABASE_URL` (Supabase transaction pooler :6543, pgbouncer), `DATABASE_DIRECT_URL` (:5432, migrations), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_FIREBASE_*` (+`_VAPID_KEY`), `FIREBASE_SERVICE_ACCOUNT_JSON`, `PRISMA_CONNECTION_LIMIT`, `PRISMA_POOL_TIMEOUT`. Connection-limit troubleshooting: `SUPABASE_CONNECTION_DEBUG.md`.

## Gotchas
- `npm run build` runs `prisma migrate` against the real DB. Schema changes need a committed migration in `prisma/migrations/`. Don't edit applied migrations.
- Server imports use long relative paths to the root `lib/` (`../../../../lib/prisma`). Count the `../`s against the route depth.
- PDF quirks: `PdfProxyContext` and the `localStorage` PDF caches in `quran/page.js` are effectively dead. Paras are saved as base64 but never read back, and `kanzul_imaan_pdf` is read but never written. The viewer decodes `file` with `decodeURIComponent`, so it hands `fetch` a proxy URL whose inner `url=` is unencoded. That works for current file names but breaks if one contains `&`, `#` or `+`.
- `src/app/local-stores/page.js.bak`, `x-archive/`, `ipa_output/`, `query_events.js`, `test-toggle.js` and `out/` are leftovers or artifacts, not live code.
- Don't commit or print secrets. Signing material (`*.jks`, `keystore.properties`, `key-creds-new.txt`, `*.pem`) and `.env*` must stay out of diffs.
- Other docs: `MOBILE_SETUP.md`, `COMMANDS.md`, `IOS_QIBLA_FIX.md` (compass permission), `eventPlan.md` (event builder design).
