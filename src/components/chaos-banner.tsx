import { getChaosSettings } from "@/lib/chaos";
import { ChaosBannerView } from "./chaos-banner-view";

/**
 * Yellow banner shown on every page while chaos is active. The server knows
 * the cookie and env values; the browser part adds ?delay from the page URL.
 */
export async function ChaosBanner() {
  const settings = await getChaosSettings();
  // Not wrapped in <Suspense>, so it also shows with JavaScript disabled.
  return <ChaosBannerView settings={settings} />;
}
