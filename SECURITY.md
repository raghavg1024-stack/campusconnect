# Security notes

- Supabase credentials are server-only runtime secrets. `.dev.vars`, `.env` files, local framework state, and generated build artifacts are ignored by Git.
- The public repository contains no API key values, database password, production data export, or student contact list.
- Authentication is verified on the server. Client-supplied IDs never establish identity.
- Attendee lists and organiser writes check ownership on each request. A signed-in student cannot inspect or edit another organiser's event.
- Supabase table RLS remains enabled as configured. The adapter uses a server credential and performs application authorisation before privileged requests.
- Reservation/capacity operations lock the event row in short transactions. The database functions are invoker-mode, service-only, and inaccessible to publishable-key clients.
- Cross-origin writes are rejected. Supabase fetches have timeouts. User content is rendered as React text, and CSV cells neutralise spreadsheet formula prefixes.
- Before a wider campus rollout, define the institution's retention policy, administrator/contact process, and abuse controls. The repository documents schema limitations rather than silently storing sensitive data elsewhere.

If a credential is accidentally disclosed, rotate it through Supabase and update the hosting runtime secret. Do not post credentials or personal student records in public GitHub issues.
