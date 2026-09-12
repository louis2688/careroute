# CareRoute

Website for a non-emergency medical transportation. Built with Next.js 16, React 19, Tailwind CSS 4, and Supabase (Postgres).

## Pages

- `/` company overview: description, mission, vision, services summary, how booking works
- `/services` the eight NEMT services with what each includes
- `/terms` terms and conditions of service
- `/book` ride request form with address suggestions, a live fare estimate, and standing orders (repeat on chosen weekdays until a date, up to 30 rides). Validated on the server, saved to Postgres, returns a reference number
- `/trip/CR-XXXXXXXX` passenger tracking page: request received, confirmed, driver on the way, completed. Refreshes itself.
- `/admin` dispatch board: every request, day view, driver assignment, status buttons, CSV export. Password protected.
- `/admin/fleet` drivers and vehicles with credential expiry badges (license, CPR, background check, inspection, insurance).
- `/driver` driver app: sign in with phone + PIN, see assigned rides, tap through en route, picked up, completed. Each tap is GPS-stamped; drop-off captures the passenger's signature.
- `/admin/export?from=&to=` proof-of-service CSV for billing: timestamps, GPS, driver, fare, signed yes/no.
- `/facility` facility portal: hospitals and dialysis centers sign in with an access code, book for their patients, and see every ride they booked with driver and live status. Codes are managed on `/admin/facilities`.
- `/account` passenger sign-in with Google. Shows every ride booked with that email, and pre-fills the booking form. Booking never requires an account.

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
| `AUTH_SECRET` | Signs driver, facility, and passenger session cookies. Optional, falls back to `ADMIN_PASSWORD`. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud Console > Credentials > OAuth client ID (Web application). Add `http://localhost:3000/auth/google/callback` and your production URL + `/auth/google/callback` as authorized redirect URIs. Optional. |
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

## Demo logins

Seeded facilities (access code): City Dialysis Center `DIALYSIS-2026`, Harbor View Rehabilitation `HARBOR-2026`.

Seeded drivers (phone, PIN): Marco Alvarez 555-010-3001 / 1234, Denise Okafor 555-010-3002 / 2345, Sam Whitfield 555-010-3003 / 3456. Change them on `/admin/fleet`.

## Where things live

- `lib/site.ts` all copy: company name, contact details, services, terms. Rebranding is a one-file edit.
- `lib/booking.ts` booking validation rules, shared by the server action and the test.
- `lib/db.ts` the database calls: insert, list, get by reference, update status.
- `lib/geo.ts` address search and driving distance. `lib/pricing.ts` the fare table.
- `lib/notify.ts` email and SMS. `lib/phone.ts` turns typed numbers into E.164.
- `lib/auth.ts` and `proxy.ts` the shared-password gate on `/admin`. `lib/token.ts` and `lib/session.ts` the signed cookie for drivers, facilities, and passengers.
- `app/auth/google/` the Google OAuth code flow in two route handlers, no auth library.
- `components/signature-pad.tsx` and `components/geo-fields.tsx` proof of service inputs.
- `components/icons.tsx` inline Lucide icons, no icon package needed.
