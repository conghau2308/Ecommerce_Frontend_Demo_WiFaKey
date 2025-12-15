import React from "react";
import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-center">
      {children}
      <Toaster richColors position="top-right" />
    </section>
  );
}
