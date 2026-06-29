"use client";

import { useEffect } from "react";

/** Registers the current browser on /learn visits (soft mode: never blocks). */
export default function StudentDeviceRegistrar() {
  useEffect(() => {
    void fetch("/api/members/device", {
      method: "POST",
      credentials: "same-origin",
    });
  }, []);

  return null;
}
