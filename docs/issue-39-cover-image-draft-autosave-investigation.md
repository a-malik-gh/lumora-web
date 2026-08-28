# Issue #39 investigation: cover image upload + draft auto-save

This document records the findings from investigating issue #39 ("Cover image
upload and draft auto-save") against the current state of this repository,
what infrastructure is missing to implement the acceptance criteria
correctly, and recommended next steps. No functional code is changed by this
branch — see the accompanying (draft) PR for why.

## What exists today

- Campaign creation is a client-side, multi-step wizard under
  `src/app/create-campaign/*` (`basic` → `story` → `funding` → `milestones`
  → `assets` → `review` → `deploy`), backed by `useCampaignStore`
  (`src/stores/campaignStore.ts`).
- The cover image field lives on the `assets` step
  (`src/app/create-campaign/assets/page.tsx`). It is a **plain `<input
  type="url">`** where the creator pastes a URL — there is no file picker,
  no drag-and-drop target, no image preview, no crop step, and no size/type
  validation. See `creationData.coverImage` in `src/types/campaign.ts` /
  `src/stores/campaignStore.ts`, which is typed simply as `string`.
- `useCampaignStore` uses Zustand's `persist` middleware
  (`src/stores/campaignStore.ts`) to write the in-progress wizard state
  (`creationStep`, `creationData`) to **`localStorage`** under the key
  `lumora-campaign-creation`. This is real persistence, but:
  - it is client-only (never sent to the backend),
  - it holds exactly **one** in-progress campaign at a time (there is no
    concept of multiple named/listed drafts),
  - there is no periodic "save" — it just mirrors store state into
    `localStorage` synchronously on every change, and
  - there is no "Draft saved" indicator anywhere in the UI.
- There is no `/dashboard` route at all (`src/app/` has no `dashboard`
  directory). `src/proxy.ts` treats `/dashboard` as a protected-route
  *prefix* for auth redirects, but no page exists to actually serve it, so
  `/dashboard/drafts` is a 404 today.
- `src/lib/api.ts` (the shared Axios client) exposes no draft or upload
  endpoints — only auth (challenge/verify/refresh), campaign shares, and
  campaign recommendations.

## What's missing for the acceptance criteria

### Cover image upload (drag-and-drop, Cloudinary, JPG/PNG/WebP, 5MB, 16:9 crop)

- **No Cloudinary integration anywhere.** `.env.example` only defines
  `NEXT_PUBLIC_API_URL` and Sentry variables — no `NEXT_PUBLIC_CLOUDINARY_*`
  / `CLOUDINARY_URL` / upload-preset config, and `package.json` has no
  `cloudinary` or `next-cloudinary` dependency. This frontend talks to a
  separate backend service (`NEXT_PUBLIC_API_URL`) for everything else, so
  "Cloudinary-optimized" upload almost certainly belongs behind a backend
  endpoint (e.g. the backend mints a signed upload signature/preset, or
  proxies the upload) rather than shipping a Cloudinary API secret to the
  browser — but no such backend endpoint exists or is documented here, and
  this repo doesn't contain the backend.
- **No crop-UI library.** Neither `react-easy-crop` nor `react-image-crop`
  (nor any cropping library) is in `package.json`. Implementing the
  required "crop step, not a silent stretch/crop" would mean introducing a
  brand-new dependency with no established pattern in this codebase to
  follow.
- **No drag-and-drop/file-picker component exists anywhere in `src/`** to
  extend (grepped for `upload`, `dropzone`, `crop` — no matches besides this
  investigation).

### Draft auto-save (backend, 30s, indicator, `/dashboard/drafts`, cap of 5)

- **No backend draft API.** `src/lib/api.ts` has no
  `getDrafts`/`saveDraft`/`deleteDraft`-style calls, and there's no
  documented backend contract (OpenAPI spec, etc.) in this repo to model
  request/response shapes against. "Auto-saved to the backend" requires
  server endpoints that simply aren't there.
- **No draft data model.** `CampaignCreationData` (the wizard's shape) has
  no `id`, `updatedAt`, or per-user ownership fields — nothing to key a
  list of up-to-5 drafts by, and no server-assigned identity to
  create/update/delete against.
- **No `/dashboard` app directory**, so `/dashboard/drafts` has no page to
  render a draft list even once the data existed.

## Why this wasn't force-implemented

Building this correctly would mean inventing, end-to-end and without any
existing pattern to anchor to:

1. A backend draft-storage contract (create/list/update/delete, ownership,
   the 5-per-user cap) that this repo doesn't own or document — the actual
   backend service lives outside this repository.
2. A Cloudinary integration and credential-handling strategy (signed
   uploads vs. backend proxy) with no existing env vars, utility, or
   backend endpoint to build on.
3. A new crop-UI dependency with no precedent in `package.json`.

Per the task's guidance, speculative backend architecture invented from
inside the frontend repo would very likely not match what the real backend
team ships, so this PR is opened as a **draft** with these findings instead
of a speculative implementation.

## Recommended next steps

1. **Backend first**: define (in the backend repo) `POST/GET/PATCH/DELETE
   /campaigns/drafts` endpoints — draft = a partial `CampaignCreationData`
   snapshot with `id`, `updatedAt`, and an enforced max of 5 per
   authenticated user (409/400 on a 6th create, matching the `friendlyMessage`
   pattern already in `src/lib/api.ts`). Document the Cloudinary upload
   contract too: most likely the backend mints a short-lived signed upload
   (signature + timestamp + upload preset) so the browser can upload
   directly to Cloudinary without embedding an API secret, and returns the
   optimized delivery URL for the frontend to store as `coverImage`.
2. **Frontend, once the backend contract exists**:
   - Add `getDrafts`/`saveDraft`/`deleteDraft` to `src/lib/api.ts` following
     the existing Axios + friendly-error-toast pattern, and a React Query
     hook (query key added to `src/lib/queryKeys.ts`) for `/dashboard/drafts`.
   - Add a `src/app/dashboard/drafts/page.tsx` list view (protected by the
     existing `proxy.ts` matcher, which already covers `/dashboard/:path*`).
   - Replace the `useCampaignStore` `persist`-to-`localStorage` autosave
     with (or supplement it with) a 30s interval that calls `saveDraft`
     when `creationData` has changed, surfacing a "Draft saved" indicator
     (e.g. near the wizard's step header) the way `sonner` toasts are used
     elsewhere in this repo.
   - Add a real upload widget to `assets/page.tsx` (drag-and-drop + file
     picker, client-side JPG/PNG/WebP + 5MB validation before upload), add
     `react-easy-crop` (a small, actively-maintained, dependency-free crop
     library) for the mandatory 16:9 crop step, then submit the cropped
     blob to whatever the backend's signed-upload contract turns out to be.
3. Until the backend contract is settled, this repo has nothing safe to
   build the upload/draft UI against without guessing at request/response
   shapes that would likely need to be reworked once the real contract
   lands.
