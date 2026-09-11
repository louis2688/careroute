# CareRoute

Demo website for a non-emergency medical transportation (NEMT) company. Built with Next.js 16, React 19, Tailwind CSS 4, and Supabase (Postgres).

## Pages

- `/` company overview: description, mission, vision, services summary, how booking works
- `/services` the eight NEMT services with what each includes
- `/terms` terms and conditions of service
- `/book` ride request form. Validated on the server, saved to Postgres, returns a reference number
- `/admin` dispatch view: every request, newest first, with confirm and cancel buttons. Password protected.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open http://localhost:3000.

| Variable | Where it comes from |
|---|---|
| `SUPABASE_URL` | Supabase dashboard, Settings > API, Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, service_role key. Server only, never shipped to the browser. |
| `ADMIN_PASSWORD` | Anything you like. The browser asks for it on `/admin` (any username). |

Other scripts: `npm run build`, `npm run lint`, `npm test` (validation and auth rules).

## How data flows

1. The form on `/book` posts to a Server Action.
2. `lib/booking.ts` validates every field again on the server. Server Actions are public endpoints.
3. `lib/db.ts` inserts the row through Supabase's REST API with the service role key.
4. `/admin` reads the same table. Row Level Security is on with no policies, so only the server can read or write.

Database schema lives in the Supabase migration `create_bookings`.

## Where things live

- `lib/site.ts` all copy: company name, contact details, services, terms. Rebranding is a one-file edit.
- `lib/booking.ts` booking validation rules, shared by the server action and the test.
- `lib/db.ts` the three database calls: insert, list, update status.
- `lib/auth.ts` and `proxy.ts` the shared-password gate on `/admin`.
- `components/icons.tsx` inline Lucide icons, no icon package needed.
