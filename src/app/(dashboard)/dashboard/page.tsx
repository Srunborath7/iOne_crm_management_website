import DashboardPageClient from "./DashboardPageClient";

// This page is behind a browser session and role check, so it may block.
export const instant = false;

export default function DashboardPage() {
  return <DashboardPageClient />;
}
