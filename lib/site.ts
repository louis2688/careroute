import type { IconName } from "@/components/icons";

type Feature = { icon: IconName; title: string; text: string };
type Service = { slug: string; icon: IconName; name: string; summary: string; details: string[] };
type Section = { title: string; body: string[] };

// ponytail: every word of copy lives here. Rebrand = edit this file.
export const site = {
  name: "CareRoute",
  legalName: "CareRoute Medical Transport LLC",
  phone: "+1 (555) 010-2020",
  phoneHref: "tel:+15550102020",
  email: "dispatch@careroute.example",
  address: "1200 Harbor Drive, Suite 210, Portside",
  hours: "Dispatch open 6:00 AM to 8:00 PM, seven days a week",
  timeZone: "America/New_York", // the company's operating timezone, used for every displayed time
  defaultCountryCode: "+1", // assumed for SMS when a passenger types a number without a + prefix
  description:
    "CareRoute drives patients to and from medical appointments when an ambulance is not needed. We run sedans, wheelchair vans, and stretcher vehicles, and every driver is trained to help passengers from their front door to the check-in desk.",
  about: [
    "CareRoute started in 2024 with two wheelchair vans and a dispatcher who answered every call herself. Today we run a mixed fleet of sedans, lift-equipped vans, and stretcher vehicles, and we still answer the phone the same way.",
    "Most of our passengers ride with us every week: dialysis three times a week, physical therapy after a surgery, oncology visits, or a standing appointment with a specialist across town. Hospitals, dialysis centers, nursing facilities, insurers, and transportation brokers book with us on behalf of their patients. Families book directly.",
  ],
  mission:
    "Get every passenger to their appointment safely, on time, and with the help they need at both ends of the trip.",
  vision:
    "A community where nobody skips dialysis, therapy, or a follow-up visit because they had no way to get there.",
  serves: [
    "Patients and families",
    "Hospitals and clinics",
    "Dialysis centers",
    "Skilled nursing and assisted living",
    "Insurers and transportation brokers",
    "Case managers and social workers",
  ],
  included: [
    {
      icon: "clock",
      title: "Early arrival",
      text: "Drivers arrive 10 to 15 minutes before the pickup time and wait up to 10 minutes.",
    },
    {
      icon: "accessibility",
      title: "Door-through-door help",
      text: "Assistance from your door to the vehicle, and from the vehicle to the check-in desk.",
    },
    {
      icon: "shield-check",
      title: "Secured for the trip",
      text: "Seat belts for everyone and four-point tie-downs for every wheelchair.",
    },
    {
      icon: "phone",
      title: "A person on the line",
      text: "Dispatch confirms every request and can reach your driver during the trip.",
    },
  ] satisfies Feature[],
  proof: [
    {
      icon: "shield-check",
      title: "Licensed and insured",
      text: "Commercial auto and liability coverage on every vehicle.",
    },
    {
      icon: "accessibility",
      title: "ADA-compliant fleet",
      text: "Lift-equipped vans with four-point wheelchair tie-downs.",
    },
    {
      icon: "user",
      title: "Trained drivers",
      text: "Background checks, CPR and first aid, defensive driving, passenger assistance.",
    },
    {
      icon: "phone",
      title: "Live dispatch",
      text: "Open seven days a week and staffed by people, not a phone tree.",
    },
  ] satisfies Feature[],
  steps: [
    {
      title: "Request a ride",
      text: "Use the booking form or call dispatch. Tell us where you are going, when, and what help you need.",
    },
    {
      title: "We confirm",
      text: "Dispatch checks vehicle availability and calls or emails you within one business hour with the pickup window and the price.",
    },
    {
      title: "Your driver arrives early",
      text: "Drivers show up 10 to 15 minutes before pickup, help you into the vehicle, and walk you to the check-in desk.",
    },
  ],
  services: [
    {
      slug: "ambulatory",
      icon: "user",
      name: "Ambulatory transport",
      summary: "Door-to-door rides for passengers who can walk with little or no help.",
      details: [
        "Sedan or minivan with a driver who escorts you to the entrance",
        "Room for a cane, walker, or folding wheelchair",
        "Curb-to-curb or door-through-door, your choice",
      ],
    },
    {
      slug: "wheelchair",
      icon: "accessibility",
      name: "Wheelchair transport",
      summary: "Lift-equipped vans for passengers who ride in their own wheelchair or need one for the trip.",
      details: [
        "Hydraulic lift or ramp, four-point tie-downs, lap and shoulder belts",
        "Loaner wheelchair on request",
        "Drivers trained to assist on stairs, ramps, and narrow entries",
      ],
    },
    {
      slug: "stretcher",
      icon: "bed-single",
      name: "Stretcher transport",
      summary: "Non-emergency transport for passengers who must stay lying down.",
      details: [
        "Two trained attendants on every stretcher trip",
        "Hospital, rehab, and home pickups",
        "Not a substitute for an ambulance. Call emergency services for urgent medical needs.",
      ],
    },
    {
      slug: "dialysis",
      icon: "refresh-cw",
      name: "Dialysis transport",
      summary: "Recurring rides built around your chair time, three times a week or as prescribed.",
      details: [
        "Standing orders, so you book once instead of before every session",
        "Return pickup timed to the end of your treatment",
        "The same driver whenever the schedule allows",
      ],
    },
    {
      slug: "appointments",
      icon: "stethoscope",
      name: "Medical appointments",
      summary: "Doctor visits, physical therapy, infusion, imaging, lab work, and dental.",
      details: [
        "One-way or round trip, with a wait-and-return option",
        "One companion rides free",
        "Reminder call the day before",
      ],
    },
    {
      slug: "discharge",
      icon: "hospital",
      name: "Hospital discharge",
      summary: "A ride home or to a care facility once the hospital clears you to leave.",
      details: [
        "Same-day pickup when a vehicle is available",
        "We coordinate directly with the case manager or nurse station",
        "Help with belongings, medications, and equipment",
      ],
    },
    {
      slug: "long-distance",
      icon: "route",
      name: "Long-distance and inter-facility",
      summary: "Transfers between cities, hospitals, rehab centers, and nursing homes.",
      details: [
        "Flat quote per trip, agreed before we confirm",
        "Rest stops planned into longer trips",
        "Wheelchair and stretcher vehicles available",
      ],
    },
    {
      slug: "medical-travel",
      icon: "plane",
      name: "Medical travel and airport assistance",
      summary: "Transfers for patients traveling into or out of the region for treatment.",
      details: [
        "Meet and greet at arrivals, with help for luggage",
        "Airport, hotel, and clinic transfers on one booking",
        "Timing coordinated with your care team",
      ],
    },
  ] satisfies Service[],
  termsEffective: "September 1, 2026",
  terms: [
    {
      title: "Acceptance of these terms",
      body: [
        "These terms apply to every ride booked with CareRoute, whether by phone, online, or through a facility or broker. By booking a ride you agree to them on your own behalf and on behalf of any passenger you book for.",
      ],
    },
    {
      title: "Scope of service",
      body: [
        "CareRoute provides non-emergency medical transportation only. Our vehicles are not ambulances and our drivers do not provide medical care beyond basic first aid. If a passenger has a medical emergency before or during a trip, call your local emergency number.",
        "We do not transport passengers who need oxygen we did not arrange in advance, IV pumps, or cardiac monitoring during the trip.",
      ],
    },
    {
      title: "Booking and scheduling",
      body: [
        "Book at least 24 hours before pickup. Same-day requests are accepted when a vehicle is available and may carry a surcharge.",
        "A booking is confirmed only when dispatch sends a confirmation by phone, text, or email. The pickup window runs from 15 minutes before to 15 minutes after the confirmed time.",
      ],
    },
    {
      title: "Cancellations and no-shows",
      body: [
        "Cancel free of charge up to two hours before the scheduled pickup. Later cancellations and no-shows are billed at the base fare.",
        "Drivers wait 10 minutes at the pickup point. After that the trip is marked as a no-show unless you have contacted dispatch. Three no-shows within 30 days may result in a deposit requirement for future bookings.",
      ],
    },
    {
      title: "Passenger responsibilities",
      body: [
        "Give accurate pickup and destination addresses, appointment times, and mobility information. Be ready at the pickup point at the start of your window. Bring any mobility equipment in safe working order.",
        "Tell us at booking if you need a companion, a loaner wheelchair, or extra time to get ready. We can only plan for what we know about.",
      ],
    },
    {
      title: "Companions and minors",
      body: [
        "One companion may ride free with each passenger. Additional companions must be approved at booking and may be charged.",
        "Passengers under 18 must be accompanied by a parent, guardian, or authorized caregiver unless the referring facility has arranged otherwise in writing.",
      ],
    },
    {
      title: "Safety and conduct",
      body: [
        "Seat belts and wheelchair tie-downs are required for the full trip. No smoking, vaping, alcohol, or open food in vehicles. Service animals are welcome. Other pets need prior approval.",
        "Drivers may end a trip if a passenger or companion threatens their safety or the safety of others. Trips ended for this reason are billed in full.",
      ],
    },
    {
      title: "Payment and insurance",
      body: [
        "Private-pay trips are quoted before confirmation and are due at booking or at pickup. We accept major cards and facility purchase orders.",
        "For insurance, Medicaid, Medicare Advantage, or broker-funded trips, the passenger or referring facility is responsible for obtaining authorization before the trip and for any co-pay or charge the payer does not approve. Facility accounts are invoiced monthly under a separate agreement.",
      ],
    },
    {
      title: "Delays and liability",
      body: [
        "We plan for traffic and weather, but we are not responsible for missed appointments caused by conditions outside our control, including road closures, severe weather, or a facility releasing a passenger late.",
        "Report lost items to dispatch within 48 hours. We hold found items for 30 days.",
      ],
    },
    {
      title: "Privacy and health information",
      body: [
        "We collect only the information needed to complete your trip and bill for it. Health information is shared only with the facility, payer, or caregiver involved in the trip, and only as allowed by applicable privacy law.",
        "Booking records are kept for as long as billing and regulatory rules require, then deleted. Contact dispatch to request a copy of the records we hold about you.",
      ],
    },
    {
      title: "Changes to these terms",
      body: [
        "We may update these terms from time to time. The date at the top of this page shows the current version. Using the service after a change means you accept the updated terms.",
      ],
    },
  ] satisfies Section[],
};
