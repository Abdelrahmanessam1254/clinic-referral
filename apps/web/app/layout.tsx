import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Patient Referral | Pain Management & Neurology Clinic",
  description:
    "Submit a new patient referral to our pain management and neurology clinic.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Providers must wrap children so every page has tRPC + React Query context */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
