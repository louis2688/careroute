import type { Booking } from "./booking";

// Fare table in cents. The live estimate and the stored quote both come from here.
export const PRICING = {
  currency: "USD",
  base: { ambulatory: 3500, wheelchair: 5500, stretcher: 15000 },
  perMile: { ambulatory: 250, wheelchair: 300, stretcher: 500 },
  roundTripFactor: 1.9,
};

export const kmToMiles = (km: number) => km * 0.621371;

export function estimateFare(
  km: number,
  mobility: Booking["mobility"],
  tripType: Booking["tripType"],
): number {
  const oneWay = PRICING.base[mobility] + Math.round(kmToMiles(km) * PRICING.perMile[mobility]);
  return tripType === "round-trip" ? Math.round(oneWay * PRICING.roundTripFactor) : oneWay;
}

export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: PRICING.currency });
