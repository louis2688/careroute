"use client";

import { useEffect, useRef } from "react";

// Fills two hidden inputs with the device position, if the driver allows it. Blank otherwise.
export function GeoFields() {
  const lat = useRef<HTMLInputElement>(null);
  const lon = useRef<HTMLInputElement>(null);
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        if (lat.current) lat.current.value = String(p.coords.latitude);
        if (lon.current) lon.current.value = String(p.coords.longitude);
      },
      () => {},
      { maximumAge: 60_000, timeout: 8_000 },
    );
  }, []);
  return (
    <>
      <input ref={lat} type="hidden" name="lat" />
      <input ref={lon} type="hidden" name="lon" />
    </>
  );
}
