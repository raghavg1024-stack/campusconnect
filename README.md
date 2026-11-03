# CampusConnect

**A campus event platform built around the supplied CampusConnect UI, with a live Supabase backend and a student/organiser workflow.**

[Open the deployed app](https://campusconnect-event-desk.gsumathi61.chatgpt.site/#events) · [Architecture](docs/ARCHITECTURE.md) · [Supabase setup](docs/SUPABASE.md) · [API contract](BACKEND-CONTRACT.md) · [Security](SECURITY.md)


## What the project does

CampusConnect helps students discover campus events, reserve a place, keep their event passes together, and find student communities. Organisers can create events, manage capacity, inspect their own attendees, export attendee lists, and admit walk-ins.

The interface is derived directly from the supplied HTML. Its header, summary cards, search/filter toolbar, attendee table, badges, pagination, walk-in banner, footer, Material Symbols, spacing, and design tokens are preserved in React components. Typography and the indigo colour palette are refined without replacing the original dashboard structure.

## Implementation status

| Feature | Connected Supabase mode |
| --- | --- |
| Event discovery, search, calendar and event details | Live `Events` records |
| Create/edit event title, capacity and date/time | Saved to Supabase |
| Register and cancel your own RSVP | Saved to `Registration` |
| Duplicate/overbooking protection | Event-row locks in server-only SQL functions |
| RSVP list and downloadable pass | Current user's live registrations |
| Organiser attendee directory and CSV export | Live records; owner-only access |
| Walk-in registration | Saved within capacity; attendance itself is not tracked |
| Saved event bookmarks | Browser-local preference |
| Club directory and profiles | Static campus content |
| Club membership, check-in status, participation points | Preview functionality only; current live schema has no persistence for these |
| Extended event metadata and event cancellation state | Not stored by the current schema; unsupported writes fail explicitly |
| Email delivery, payments and camera QR scanning | Not implemented |

The connected backend uses the user's existing schema instead of creating a replacement database. Missing metadata is labelled with display defaults such as “Location to be announced.” The app does not report unsupported changes as successfully saved.

## Technology

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Plus Jakarta Sans, Material Symbols and Lucide icons.
- **Application server:** Vinext with a Cloudflare Worker entry point.
- **Database:** Existing Supabase PostgreSQL tables through the Supabase REST API.
- **Authentication:** Sites' verified ChatGPT sign-in; server-side ownership checks.
- **Transactions:** PostgreSQL invoker-mode functions restricted to `service_role`.
- **Tests:** TypeScript checks and focused Node assertion scripts; live integration checks are opt-in.

## Run locally

Use **Node.js 22.13 or newer** and npm.

```sh
git clone https://github.com/raghavg1024-stack/campusconnect.git
cd campusconnect
npm ci
npm run dev
```

Open the Local URL printed by the server, normally `http://127.0.0.1:5173/`.

With no database configuration, the app opens a clearly labelled interactive preview with fictional records. Preview changes stay in this browser. They are never uploaded when a real backend is connected.

### Connect Supabase

1. Use an existing Supabase project with the schema described in [the setup guide](docs/SUPABASE.md).
2. Create an ignored `.dev.vars` file based on `.env.example`:

   ```dotenv
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET
   ```

3. Apply the additive transaction functions in [`supabase/connection-functions.sql`](supabase/connection-functions.sql) through an authorised SQL session. Do not replace existing tables or disable RLS.
4. Restart the local server. `/api/campus` now returns `provider: "supabase"` and live event data.

**Never put a secret/service-role key in frontend code or a `NEXT_PUBLIC_` variable.** The browser calls `/api/campus`; only the server talks to Supabase. No real project key, password, attendee export, or original student contact list is committed here.

The public repository's hosting manifest intentionally omits the original site's project ID. Configure your own hosting identity before deploying a clone. The original deployed site has its own private runtime secrets.

### Local sign-in

The portable development profile provides a loopback-only mock sign-in route:

```text
http://127.0.0.1:5173/signin-with-chatgpt?return_to=/
```

This development identity is not bundled into production authentication. Hosted deployments use the platform's real identity headers. If deploying outside Sites, replace the identity helper with a verified server-side provider and preserve the ownership checks; never trust headers forwarded directly by an untrusted client.

## Existing database mapping

| Supabase table | Source columns | Frontend mapping |
| --- | --- | --- |
| `Events` | `id`, `organiser_id`, `title`, `capacity`, `timestamp` | `id`, `owner_id`, `title`, `capacity`, `starts_at` |
| `USER` | `id`, `email`, `role` | Student profile and registration contact |
| `Registration` | `id`, `user_id`, `event_id`, `created_id` | RSVP/pass and `created_at` |

Table names are case-sensitive. The adapter preserves `created_id` rather than inventing a `created_at` database column. It resolves the current signed-in user server-side and exposes personal records only within the appropriate ownership boundary.

The connection script adds `campus_register`, `campus_update_event`, and `campus_walkin`. Each uses an event-row lock for capacity checks. These functions do not replace the tables, modify existing records during installation, or change table RLS policies/grants.

## Screens and navigation

| Route | Screen |
| --- | --- |
| `#dashboard` | Original attendee dashboard for an event you own |
| `#events` | Event discovery and search |
| `#event/<id>` | Event details and registration |
| `#calendar` | Campus calendar |
| `#my` | Your RSVPs and communities |
| `#saved` | Saved event collection |
| `#clubs`, `#club/<id>` | Club directory and profile |
| `#organiser` | Your event workspace |
| `#create`, `#edit/<id>` | Event creation/editing |
| `#attendees/<id>` | Owner-only attendee management |
| `#account`, `#notifications` | Account and registration updates |
| `#help`, `#guidelines`, `#privacy`, `#about` | Supporting information |

## Source map

```text
app/
  api/campus/route.ts       Same-origin backend entry point
  campus-app.tsx           Connected screens and interactions
  reference-ui.tsx         Components derived from uploaded HTML
  reference-theme.css      Original design tokens and icon font
  chatgpt-auth.ts          Verified platform identity helpers
lib/
  campus.ts                Frontend types and static club content
  supabase-backend.ts      Live server-side adapter and authorisation
  supabase-model.ts        Existing-table field mapping
  preview.ts               Labelled browser-local demo repository
supabase/
  connection-functions.sql Service-only transaction functions
scripts/
  check-campus.cjs         Preview workflow checks
  check-supabase-model.cjs Supabase mapping checks
  check-supabase-live.cjs  Opt-in live integration checks
docs/                      Architecture and connection guide
worker/                    Cloudflare Worker entry point
```

The repository also retains the starter's build/runtime helpers, optional D1 example, reusable UI primitives, and their included licence notices. Supabase is the active backend when its runtime variables are configured; D1 is not provisioned by this project.

## Validation

```sh
node node_modules/typescript/bin/tsc --noEmit
node scripts/check-campus.cjs
node scripts/check-supabase-model.cjs
npm run build
```

For an opt-in end-to-end check against a configured project and running local server:

```sh
node scripts/check-supabase-live.cjs
```

The live check creates a labelled temporary event, verifies real reads and authenticated writes, concurrent duplicate prevention, capacity protection, ownership isolation, RSVP cancellation, and origin rejection. It removes only its temporary test records. Use a development database for repeated tests.

## Deployment

Set `SUPABASE_URL` and the secret `SUPABASE_SECRET_KEY` as server runtime variables, build with `npm run build`, and deploy the Worker through the supported Sites workflow. The original live site is linked at the top of this README. Public visitors can browse event information; attendee details and write operations require sign-in and ownership checks.

## Known limits and next steps

- Extend the existing schema before persisting descriptions, event locations/categories, clubs/memberships, cancellation state, or check-in status.
- Downloaded passes contain lookup IDs; they are not generated QR images. Calendar exports use a two-hour default duration because the schema has no end time.
- Campus points are illustrative in preview mode and are not redeemable currency.
- Event/student data is not automatically migrated from the browser preview.
- Before a campus-wide rollout, add institutional privacy/retention contacts and appropriate abuse controls. See [SECURITY.md](SECURITY.md).

## Third-party code

Retained third-party notices are included under `vendor/` and `scripts/vite/`. No additional project licence has been selected by the repository owner.
