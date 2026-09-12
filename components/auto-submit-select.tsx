"use client";

import type { ComponentProps } from "react";

// A select that submits its form on change. Saves a button per row on the dispatch board.
export function AutoSubmitSelect(props: ComponentProps<"select">) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
