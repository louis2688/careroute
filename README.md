# CareRoute

Demo website for a non-emergency medical transportation (NEMT) company. Built with Next.js 16, React 19, and Tailwind CSS 4.

## Pages

- `/` company overview: description, mission, vision, services summary, how booking works
- `/services` the eight NEMT services with what each includes
- `/terms` terms and conditions of service
- `/book` ride request form with server-side validation and a confirmation reference

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts: `npm run build`, `npm run lint`, `npm test` (validation rules).

## Where things live

- `lib/site.ts` all copy: company name, contact details, services, terms. Rebranding is a one-file edit.
- `lib/booking.ts` booking validation rules, shared by the server action and the test.
- `app/book/actions.ts` the server action. Bookings are validated and logged. Swap the log for a database insert or an email to dispatch.
- `components/icons.tsx` inline Lucide icons, no icon package needed.
