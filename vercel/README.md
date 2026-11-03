# CampusConnect on Vercel

Production: https://campusconnect-eight-dun.vercel.app

This standalone Next.js app preserves the supplied CampusConnect UI and uses Supabase email/password authentication. The original Sites application remains at the repository root.

Use this directory as the Vercel project root. Run npm ci and npm run build. Configure SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY as server environment variables. Store the server key as a sensitive encrypted variable; never commit credentials. vercel.json selects the Next.js framework.

The API verifies confirmed Supabase users and enforces organiser ownership. Existing schema limitations are retained; check-in and other unsupported fields are not persisted. Email confirmation depends on the Supabase Auth settings.
