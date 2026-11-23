import type { Metadata } from "next";
import { getChaosSettings, getCookieChaos, getEnvChaos } from "@/lib/chaos";
import { MAX_DELAY_MS } from "@/lib/chaos-config";
import { clearChaosSettings, saveChaosSettings } from "./actions";

export const metadata: Metadata = { title: "Chaos settings" };

export default async function ChaosPage({ searchParams }: PageProps<"/chaos">) {
  const { saved, cleared } = await searchParams;
  const env = getEnvChaos();
  const fromCookies = await getCookieChaos();
  const effective = await getChaosSettings();

  const show = (value: number | null, unit: string) =>
    value === null ? "not set" : `${value}${unit}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">Chaos settings</h1>
      <p className="text-gray-700">
        Slow down or break the API to practice timeouts, waits, and error
        handling. Settings are stored in cookies for this browser only.
      </p>

      {(saved || cleared) && (
        <p
          role="status"
          className="rounded-md border border-green-300 bg-green-50 px-4 py-2 text-green-800"
        >
          {saved ? "Chaos settings saved." : "Chaos settings cleared."}
        </p>
      )}

      <table className="w-full border-collapse overflow-hidden rounded-lg bg-white text-left text-sm">
        <caption className="mb-2 text-left font-semibold">
          Current values
        </caption>
        <thead>
          <tr className="border-b border-gray-200">
            <th scope="col" className="py-2 pr-4">
              Setting
            </th>
            <th scope="col" className="py-2 pr-4">
              Cookie
            </th>
            <th scope="col" className="py-2 pr-4">
              Env default
            </th>
            <th scope="col" className="py-2">
              In effect
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <th scope="row" className="py-2 pr-4 font-medium">
              Delay
            </th>
            <td className="py-2 pr-4">{show(fromCookies.delayMs, " ms")}</td>
            <td className="py-2 pr-4">{env.delayMs} ms</td>
            <td className="py-2" data-testid="effective-delay">
              {effective.delayMs} ms
            </td>
          </tr>
          <tr>
            <th scope="row" className="py-2 pr-4 font-medium">
              Flaky requests
            </th>
            <td className="py-2 pr-4">{show(fromCookies.flakyPercent, "%")}</td>
            <td className="py-2 pr-4">{env.flakyPercent}%</td>
            <td className="py-2" data-testid="effective-flaky">
              {effective.flakyPercent}%
            </td>
          </tr>
        </tbody>
      </table>

      <form
        action={saveChaosSettings}
        aria-label="Chaos settings"
        className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="chaos-delay" className="text-sm font-medium">
            Delay (ms)
          </label>
          <input
            id="chaos-delay"
            name="delay"
            type="number"
            min={0}
            max={MAX_DELAY_MS}
            step={100}
            defaultValue={fromCookies.delayMs ?? ""}
            aria-describedby="chaos-delay-hint"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <p id="chaos-delay-hint" className="text-xs text-gray-500">
            0–{MAX_DELAY_MS} ms added to every API response. Leave empty to use
            the env default. You can also add <code>?delay=2000</code> to any
            page URL.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="chaos-flaky" className="text-sm font-medium">
            Flaky requests (%)
          </label>
          <input
            id="chaos-flaky"
            name="flaky"
            type="number"
            min={0}
            max={100}
            defaultValue={fromCookies.flakyPercent ?? ""}
            aria-describedby="chaos-flaky-hint"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <p id="chaos-flaky-hint" className="text-xs text-gray-500">
            Percentage of API requests that fail with HTTP 500. Leave empty to
            use the env default.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save
          </button>
          <button
            type="submit"
            formAction={clearChaosSettings}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Clear chaos settings
          </button>
        </div>
      </form>
    </div>
  );
}
