import React from "react";

export default function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-center">
      {children}
    </section>
  );
}
