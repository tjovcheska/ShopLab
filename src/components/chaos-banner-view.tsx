"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  isChaosActive,
  parseDelay,
  type ChaosSettings,
} from "@/lib/chaos-config";

export function ChaosBannerView({ settings }: { settings: ChaosSettings }) {
  const pageDelay = parseDelay(useSearchParams().get("delay"));
  const effective = { ...settings, delayMs: pageDelay ?? settings.delayMs };
  if (!isChaosActive(effective)) return null;

  return (
    <div
      data-testid="chaos-banner"
      className="bg-yellow-300 px-4 py-1 text-center text-sm font-medium text-yellow-950"
    >
      Chaos mode: delay {effective.delayMs} ms, flaky {effective.flakyPercent}%{" "}
      <Link href="/chaos" className="underline">
        (change)
      </Link>
    </div>
  );
}
