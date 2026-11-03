# Supabase integration

## Existing schema

The connection uses the project's existing tables, preserving case and column names:

| Table | Columns used |
| --- | --- |
| `public."Events"` | `id uuid`, `organiser_id uuid`, `title text`, `capacity integer`, `timestamp timestamptz` |
| `public."USER"` | `id uuid`, `email text`, `role text` |
| `public."Registration"` | `id uuid`, `user_id uuid`, `event_id uuid`, `created_id timestamptz` |

`Registration.user_id` references `USER.id`; `Registration.event_id` references `Events.id`. The existing column `created_id` is mapped to the frontend's `created_at`. `Events.organiser_id` maps to `owner_id`, and `Events.timestamp` is used as the event date/time.

## Environment

Create an ignored `.dev.vars` file for local development:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET
```

Prefer a current Supabase secret key. The adapter also accepts an existing legacy `service_role` key for compatibility. A publishable key cannot substitute for this server credential because the application uses the hosting platform's identity provider rather than Supabase Auth. Never prefix the server key with `NEXT_PUBLIC_`, commit it, or use it in browser code.

For production, set these two runtime variables in the hosting environment. Treat `SUPABASE_SECRET_KEY` as a secret. Redeploy after changing runtime variables. The original connected project's URL and key values are intentionally not committed to this public repository.

## Transaction helpers

Apply `supabase/connection-functions.sql` through an authorised SQL session. For the connected project, these helpers were applied and verified during integration. This script adds three functions; it does not replace tables, migrate records, disable RLS, or change table grants.

| Function | Purpose |
| --- | --- |
| `campus_register(event_id,user_id)` | Atomically reject duplicates, closed events, and overbooking before reserving a place. |
| `campus_update_event(event_id,owner_id,title,capacity,timestamp)` | Verify ownership and prevent capacity dropping below current registrations. |
| `campus_walkin(event_id,owner_id,email)` | Verify ownership, resolve/create a student, and admit within capacity. |

All functions revoke `PUBLIC`, `anon`, and `authenticated` execution and grant execution only to the existing `service_role`. The API checks the real signed-in identity and event ownership before using them.

## Supported live actions

Reading real events, event counts, creating/updating title/capacity/date, registering/cancelling your own RSVP, viewing/downloading your pass, owner-only attendee lists and CSV export, and owner-only walk-in admission.

## Backend fields not present

Check-in status, club membership, event cancellation status, event descriptions, location, category, and attendance mode have no corresponding persistent columns/tables. The UI retains the supplied design, disables unsupported event inputs, marks attendance as not tracked, and rejects unavailable writes explicitly. Add the appropriate schema and access rules before implementing persistence for these features.

## Verification

`node scripts/check-supabase-live.cjs` runs against the local server and your configured project. It creates a labelled temporary event, verifies live reads/writes, duplicate and capacity protection, ownership checks, cancellation, and request-origin validation. It cleans up only the temporary records it creates. Use a development database for repeated testing.

The existing project's real records are not exported into source control. No real attendee email addresses are included in fixtures.
