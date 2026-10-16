import type { Metadata } from "next";
import SessionHydrator from "@/src/components/SessionHydrator";
import { ToastProvider } from "@/src/components/ui/ToastProvider";
import icon from "@/public/icon.png";
import "./globals.css";

export const metadata: Metadata = {
  title: "iOne CRM",
  icons: {
    icon: icon.src,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <SessionHydrator />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}