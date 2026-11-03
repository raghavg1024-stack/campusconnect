# Login portals and verified roles

- `/login`: portal chooser.
- `/login/student`: email/password sign-in, account creation, confirmation resend, and password recovery.
- `/login/organiser`: sign-in and organiser access requests. A verified faculty administrator approves requests at `/admin`.
- `/login/admin`: faculty sign-in and registration with college name and employee ID. Entering an employee ID never automatically grants access.

Supabase Auth verifies passwords and confirmed emails. Role checks use current, server-verified `app_metadata`: `campus_role: "organiser"`, or `campus_role: "admin"` together with `faculty_verified: true`. User-editable metadata contains access requests only and is never trusted for permissions. The existing public `USER.role` column is not an authorization source. Students cannot create events; approved organisers and faculty can create events and manage only their own attendee lists.

## Initial faculty verification

The college/project owner must independently check the first faculty member's employee ID against official college records. After the faculty member registers and confirms their email, the project owner can set `campus_role: "admin"` and `faculty_verified: true`, and the verified `faculty_employee_id` in that account's **Auth app_metadata** through a trusted Supabase administrator. Never set permissions in user_metadata or approve a faculty account based solely on a typed ID. Subsequent faculty and organiser requests can be reviewed by verified faculty at `/admin`.

The application does not have access to a college employee registry. Faculty verification is a manual college review; it is not an automatic employee-ID validation service. No identity document uploads are collected.

## Email configuration

Supabase Site URL must be `https://campusconnect-eight-dun.vercel.app`. Allowed redirects:

- `https://campusconnect-eight-dun.vercel.app/auth/callback`
- `https://campusconnect-eight-dun.vercel.app/auth/callback?next=/login/reset`

Production email confirmations and password resets require configured SMTP. Keep email confirmation enabled. Gmail SMTP uses `smtp.gmail.com`, port `465`, the sender's full Gmail address as username, and a Google app password stored only in Supabase's encrypted SMTP configuration. Never commit the password. Email delivery remains dependent on a valid sender credential and provider limits.

## Database correction and checks

`../supabase/fix-role-uniqueness.sql` removes an erroneous unique constraint on `USER.role`, while retaining primary-key and email uniqueness. Many accounts must be able to share a role.

Build with `npm run build`. To run the isolated sign-in integration check locally, set the public `SUPABASE_PUBLISHABLE_KEY` environment variable, ensure the parent ignored `.dev.vars` contains the existing server credentials, then run `node scripts/check-portals.cjs`. The check creates temporary test accounts, verifies password sign-in, session persistence, role spoofing rejection, student access denial, faculty approval, organiser event creation, and unconfirmed email errors. It removes only its own test accounts and records afterward. Never point it at a server other than its local production process.
