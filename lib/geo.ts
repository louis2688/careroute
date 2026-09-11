export type Place = { label: string; lat: number; lon: number };
export type Route = { km: number; minutes: number };

type PhotonFeature = {
  properties: Record<string, string | undefined>;
  geometry: { coordinates: [number, number] };
};

const UA = { "User-Agent": "careroute-demo (booking form)" };

// ponytail: free public OSM services (Photon geocoder, OSRM demo router) so the demo needs no API key.
// Production: swap these two functions for Mapbox or Google. Nothing else changes.
export async function searchPlaces(q: string): Promise<Place[]> {
  try {
    const r = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en`,
      { headers: UA, next: { revalidate: 86400 } },
    );
    if (!r.ok) return [];
    const { features } = (await r.json()) as { features: PhotonFeature[] };
    const seen = new Set<string>();
    return features.flatMap((f) => {
      const p = f.properties;
      const line1 = [p.housenumber, p.street].filter(Boolean).join(" ") || p.name;
      const label = [line1, p.city ?? p.county, p.state, p.postcode, p.country]
        .filter(Boolean)
        .join(", ");
      if (!line1 || seen.has(label)) return [];
      seen.add(label);
      return [{ label, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] }];
    });
  } catch {
    return [];
  }
}

export async function drivingRoute(a: Place, b: Place): Promise<Route | null> {
  try {
    const r = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`,
      { headers: UA },
    );
    if (!r.ok) return null;
    const d = (await r.json()) as { routes?: { distance: number; duration: number }[] };
    const leg = d.routes?.[0];
    return leg ? { km: leg.distance / 1000, minutes: leg.duration / 60 } : null;
  } catch {
    return null;
  }
}

export function isPlace(p: unknown): p is Place {
  const x = p as Place;
  return (
    typeof x === "object" &&
    x !== null &&
    typeof x.label === "string" &&
    x.label.length <= 300 &&
    Number.isFinite(x.lat) &&
    Math.abs(x.lat) <= 90 &&
    Number.isFinite(x.lon) &&
    Math.abs(x.lon) <= 180
  );
}
