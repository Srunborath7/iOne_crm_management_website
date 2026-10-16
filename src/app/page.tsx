import HomePageClient from "./HomePageClient";

// The page waits for the browser session and role check before rendering.
export const instant = false;

export default function HomePage() {
  return <HomePageClient />;
}
