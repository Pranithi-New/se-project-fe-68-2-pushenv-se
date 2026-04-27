"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <Toaster
        richColors
        position="top-right"
        closeButton
        toastOptions={{
          classNames: {
            closeButton:
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          },
        }}
      />
    </>
  );
}
