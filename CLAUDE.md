# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm i

# Development server (HTTPS, port 8000)
npm run dev
# Access at https://localhost:8000/ (pure frontend, no auth) or https://localhost:7007/ (with backend)

# Production build — outputs to ../public (sibling directory of this repo)
npm run build
```

There is no linter and no test suite configured (`npm test` exits with an error by default).

To develop with full authentication and API, the backend must be running simultaneously. See the backend repo at `https://github.com/idsinge/hiaudio_backend`.

## Environment / API endpoint

`src/common/js/config.js` controls which backend is targeted via the `MODE` constant (`'DEV'`, `'STAGE'`, `'PROD'`). In `DEV` and `STAGE`, the endpoint resolves to `window.location.protocol//window.location.host`, so the frontend proxies through the backend dev server (port 7007). Switch to `'PROD'` to point at `https://hiaudio.fr`.

## Architecture overview

**Build tool:** Parcel 2 (`src/*.html` and `src/static/*.html` are the entry points). All JS uses ES6 `import/export` modules — Parcel resolves and bundles them. The `.parcelrc` adds raw transformer support for `.mp4` files.

**UI framework:** Bootstrap 4.6 (CDN) + FontAwesome 6 (CDN). jQuery is available globally via Bootstrap's dependency and is used for modal control (`$(...).modal(...)`).

### Page structure

| Page | Entry point | Role |
|---|---|---|
| Home / listings | `src/index.html` | Composition/collection browser, dynamic nav |
| DAW editor | `src/composition.html` | Multi-track audio editor |
| Login | `src/login.html` | Email + verification code, Google OAuth |
| Profile | `src/profile.html` | User settings and API token |
| GDPR refusal | `src/refusal.html` | Data deletion request |
| Static info pages | `src/static/*.html` | About, Terms, Privacy, Cookies, GitHub, How-To, Research, Support, Automated Data Generation, **News** |

Static pages in `src/static/` all share the same minimal structure: Bootstrap navbar, `<main class="container">`, and `<hi-audio-footer>` web component.

### Home page data flow (`src/pages/home/`)

`home.js` is the entry point. On load it:
1. Calls `/profile` to determine auth state (`IS_AUTH`).
2. Reads URL query params (`?userid=` / `?collectionid=`) to decide which API endpoint to call.
3. Renders composition cards into `#grid` via `home_ui.js`.
4. Builds the nav menu dynamically via `initNavigationMenu()` in `home_ui.js` (both authenticated and unauthenticated variants are generated in JS, not HTML).
5. Sets up breadcrumb navigation (`breadcrumbhandler.js`) which handles the Recent / My Music / All tabs without page reloads using `history.replaceState`.

Compositions are grouped before rendering: by collection (`groupedbycoll`), by user/collab (`groupedbyuser_final` / `groupedbycollab`), and singles. The grouping logic lives in `home_helper.js`.

### Composition editor (`src/pages/composition/`)

Wraps the `waveform-playlist` library (bundled as `waveform-playlist.umd.js` — this is a custom fork, not npm). Key classes:
- `TrackHandler` — CRUD for tracks (add, delete, rename, set collection).
- `FileUploader` — uploads audio to `/fileUpload` with composition metadata.
- `Recorder` — Web Audio API microphone recording.
- `LatencyTestHandler` — round-trip latency measurement.
- `MetronomeHandler` — in-browser metronome.

State is shared across modules via exports from `composition.js` (`playlist`, `trackHandler`, `fileUploader`, `COMPOSITION_ID`, `USER_PERMISSION`).

### Shared utilities (`src/common/js/`)

- `utils.js` — `callJsonApi()` wraps all authenticated REST calls; also exports `UserRole` and `LevelPrivacy` enums, loader helpers, and `isSafari`.
- `config.js` — single source for `ENDPOINT` and `UPLOAD_ENDPOINT`.
- `modaldialog.js` — singleton `DynamicModal` instance for runtime alert/confirm dialogs (used across both home and composition pages).
- `collectionshandler.js` — fetches `/mycollections` and populates collection `<select>` dropdowns.
- `footer-component.js` — defines `<hi-audio-footer>` custom element. Accepts `static-path`, `show-license`, and `show-fab-button` attributes. Used on all pages.
- `acceptterms.js` — generates and handles the terms-acceptance modal on first login.
- `indexedDB.js` — local caching layer for compositions (used by the audio player on the home page).

### Modal conventions

Bootstrap modals defined statically in HTML: `#newMusicModal`, `#editCollectionsModal`, `#cloneMusicModal`, `#acceptTermsModal`. The `DynamicModal` singleton (`#dynamicModal`) is created programmatically for transient alerts and confirmations. Toggle links use `data-toggle="modal" data-target="#..."`.

News is a plain static page (`src/static/news.html`) — not a modal. The nav links in `home_ui.js` point to `/static/news.html` directly.

### Asset handling

Static videos (`src/static/videos/`) are included as Parcel entry points in both `dev` and `build` scripts to ensure they are copied to the output directory. The `.parcelrc` raw transformer is required for `.mp4` passthrough.

The `waveform-playlist` submodule lives in a sibling directory and should not be edited here; `waveform-playlist.umd.js` is the pre-built bundle checked into this repo.
