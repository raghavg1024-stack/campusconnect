# Database integration contract

The deployed application uses the existing Supabase project through the adapter in `lib/supabase-backend.ts`. Table definitions and RLS policies are preserved; additive service-only transaction functions are included in `supabase/connection-functions.sql`. See `docs/SUPABASE.md` for the actual column mapping and live capability limits. The optional D1 implementation remains available when Supabase is not configured.

Connected responses also include `provider`, `viewer`, and `capabilities`. `viewer` is the server-resolved current user; it is never accepted from client input. `capabilities` marks absent backend fields such as attendance, memberships, cancellation state, and extended event metadata. Unsupported live actions return HTTP 501 rather than silently saving to browser storage.

## Identity

The server obtains identity through `getChatGPTUser()` in `app/chatgpt-auth.ts`. Use the immutable `userId` for ownership and registrations. Email is a contact field, not the permission key. If using another identity provider, replace this server helper and the sign-in/sign-out links consistently; never trust a user ID supplied by the client.

## GET /api/campus

Without a backend, return `{ "backendConnected": false }` to enable the labelled local preview. With a backend, return:

```json
{
  "events": [{"id":"event-id","owner_id":"user-id","title":"Event title","description":"Description","category":"Technology","club":"tech","starts_at":"2026-12-01T12:00:00.000Z","location":"Campus hall","capacity":50,"mode":"In-Person","status":"published","registered":0}],
  "registrations": [],
  "memberships": ["tech"]
}
```

Registrations must contain only the current user's records, with `id`, `event_id`, `user_id`, `name`, `email`, integer `checked_in` (0/1), and ISO `created_at`. Memberships are the current user's club IDs. Include cancelled events so registered students can see their cancellation.

## GET /api/campus?attendees=EVENT_ID

Return `{ "attendees": [...] }` only if the current user created that event. Other callers must receive 401/403. Each item uses the registration shape above.

## POST /api/campus

Require authenticated identity and a matching request origin. JSON body includes `action`:

| Action | Fields | Behaviour |
| --- | --- | --- |
| `saveEvent` | optional `eventId`, `title`, `description`, `category`, `club`, `starts_at`, `location`, `capacity`, `mode` | Create or update the current user's event. Validate all fields; preserve registrations. |
| `register` | `eventId`, `name` | Reserve one spot for the current user. Email comes from server identity. |
| `cancelRsvp` | `eventId` | Release only the current user's spot. |
| `club` | `clubId`, boolean `join` | Join or leave a club for the current user. |
| `eventStatus` | `eventId`, `status` | Owner-only cancellation or reopening. |
| `checkIn` | `eventId`, `registrationId`, boolean `checked` | Owner-only check-in or undo. |
| `walkIn` | `eventId`, `name`, `email` | Owner-only admission, respecting capacity and duplicate emails. |
| `samples` | none | Explicitly insert fictional sample events owned by the signed-in creator. |

Success is `{ "ok": true }`. Errors are `{ "error": "Human-readable message" }` with appropriate HTTP status codes. Never silently fall back to preview if a connected backend fails.

## Constraints

Use unique `(event_id, user_id)` registration and `(club_id, user_id)` membership keys. Reserve capacity atomically; a read-count-then-insert sequence can overbook under concurrency. Do not allow reductions in capacity below current registration counts. Only event owners may view personal attendee data, edit events, check in students, or admit walk-ins. Enforce these rules on the server, even if the UI hides the controls.

Club IDs: `tech`, `arts`, `music`, `sport`. Categories: `Technology`, `Arts & Culture`, `Music`, `Sports`, `Community`. Modes: `In-Person`, `Virtual`. Statuses: `published`, `cancelled`.

The optional D1 handler and `db/schema.ts` are an implementation starting point. If using it, create and configure your database and schema through your own setup before setting the manifest's D1 binding to `DB`. If using a different database, replace the route rather than provisioning a D1 database.
