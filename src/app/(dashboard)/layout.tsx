import type { ReactNode } from "react";
import DashboardLayoutClient from "./DashboardLayoutClient";

// This route waits for the browser session and role check before rendering.
export const instant = false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
