# CareRoute

Website for a non-emergency medical transportation. Built with Next.js 16, React 19, Tailwind CSS 4, and Supabase (Postgres).

## Pages

- `/` company overview: description, mission, vision, services summary, how booking works
- `/services` the eight NEMT services with what each includes
- `/terms` terms and conditions of service
- `/book` ride request form with address suggestions and a live fare estimate. Validated on the server, saved to Postgres, returns a reference number
- `/trip/CR-XXXXXXXX` passenger tracking page: request received, confirmed, driver on the way, completed. Refreshes itself.
- `/admin` dispatch view: every request, newest first, with confirm, en route, complete, and cancel buttons. Password protected.

Every status change emails and texts the passenger (Resend and Twilio). Without keys the message prints to the server log.

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
| `SUPABASE_SECRET_KEY` | Same page, create a secret key (`sb_secret_...`). Server only, never shipped to the browser. Legacy `service_role` keys also work. |
| `ADMIN_PASSWORD` | Anything you like. The browser asks for it on `/admin` (any username). |
| `RESEND_API_KEY`, `EMAIL_FROM` | resend.com. Optional. Without a verified domain, Resend only delivers to the account owner's address. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | twilio.com. Optional. A trial account texts verified numbers only. |

Other scripts: `npm run build`, `npm run lint`, `npm test` (validation and auth rules).

## How data flows

1. The form on `/book` posts to a Server Action.
2. `lib/booking.ts` validates every field again on the server. Server Actions are public endpoints.
3. If both addresses were picked from the suggestions, the server routes the trip again and prices it from the fare table in `lib/pricing.ts`. The browser's estimate is never trusted.
4. `lib/db.ts` inserts the row through Supabase's REST API with the secret key. A Postgres trigger appends every status change to `booking_events`, which feeds the tracking page.
5. `/admin` reads the same table. Row Level Security is on with no policies, so only the server can read or write.
6. After the response is sent, `lib/notify.ts` emails and texts the passenger.

Address suggestions and distances come from free OpenStreetMap services (Photon and the OSRM demo router), so the demo needs no map API key. For production, swap the two functions in `lib/geo.ts` for Mapbox or Google.

Database schema lives in the Supabase migrations `create_bookings` and `trip_status_and_quotes`.

## Where things live

- `lib/site.ts` all copy: company name, contact details, services, terms. Rebranding is a one-file edit.
- `lib/booking.ts` booking validation rules, shared by the server action and the test.
- `lib/db.ts` the database calls: insert, list, get by reference, update status.
- `lib/geo.ts` address search and driving distance. `lib/pricing.ts` the fare table.
- `lib/notify.ts` email and SMS. `lib/phone.ts` turns typed numbers into E.164.
- `lib/auth.ts` and `proxy.ts` the shared-password gate on `/admin`.
- `components/icons.tsx` inline Lucide icons, no icon package needed.
