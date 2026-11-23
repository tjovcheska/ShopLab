"use client";

import { useState, type ReactNode } from "react";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const buttonClass =
  "w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600";
const secondaryClass =
  "w-fit rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50";

export function VisibilityDemo() {
  const [showHidden, setShowHidden] = useState(false);
  const [attached, setAttached] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [overlay, setOverlay] = useState(true);
  const [coveredClicks, setCoveredClicks] = useState(0);
  const [farClicks, setFarClicks] = useState(0);
  const [scrollClicks, setScrollClicks] = useState(0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Hidden">
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <code>hidden</code> attribute:{" "}
            <span data-testid="hidden-attribute" hidden={!showHidden}>
              Now you see me
            </span>
          </li>
          <li>
            <code>visibility: hidden</code>:{" "}
            <span
              data-testid="hidden-visibility"
              className={showHidden ? "visible" : "invisible"}
            >
              Now you see me
            </span>
          </li>
          <li>
            <code>opacity: 0</code> (Playwright still calls this visible!):{" "}
            <span
              data-testid="hidden-opacity"
              className={showHidden ? "opacity-100" : "opacity-0"}
            >
              Now you see me
            </span>
          </li>
          <li>
            zero size:{" "}
            <span
              data-testid="hidden-zero-size"
              className={`inline-block overflow-hidden align-bottom ${
                showHidden ? "" : "h-0 w-0"
              }`}
            >
              Now you see me
            </span>
          </li>
        </ul>
        <button
          type="button"
          onClick={() => setShowHidden((s) => !s)}
          className={secondaryClass}
        >
          {showHidden ? "Hide the messages" : "Show the messages"}
        </button>
      </Section>

      <Section title="Removed from the DOM">
        {attached ? (
          <p data-testid="removable" className="text-sm">
            I am in the DOM.
          </p>
        ) : (
          <p className="text-sm text-gray-500">(The element was removed.)</p>
        )}
        <button
          type="button"
          onClick={() => setAttached((a) => !a)}
          className={secondaryClass}
        >
          {attached ? "Remove the element" : "Add the element back"}
        </button>
      </Section>

      <Section title="Disabled">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          I agree to the terms
        </label>
        <button
          type="button"
          disabled={!agreed}
          onClick={() => setSubmitted(true)}
          className={buttonClass}
        >
          Submit
        </button>
        {submitted && (
          <p role="status" className="text-sm text-green-700">
            Submitted!
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor="disabled-input" className="text-sm font-medium">
            Disabled input
          </label>
          <input
            id="disabled-input"
            disabled
            defaultValue="You cannot edit me"
            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          aria-disabled="true"
          className="w-fit cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600"
        >
          Looks disabled (aria-disabled)
        </button>
      </Section>

      <Section title="Covered by an overlay">
        <div className="relative w-fit">
          <button
            type="button"
            onClick={() => setCoveredClicks((c) => c + 1)}
            className={buttonClass}
          >
            Covered button
          </button>
          {overlay && (
            <div
              data-testid="overlay"
              className="absolute -inset-2 flex items-center justify-center rounded-md bg-gray-900/60 text-xs font-medium text-white"
            >
              Overlay
            </div>
          )}
        </div>
        <p className="text-sm" data-testid="covered-clicks">
          Covered button clicked {coveredClicks}{" "}
          {coveredClicks === 1 ? "time" : "times"}
        </p>
        <button
          type="button"
          onClick={() => setOverlay((o) => !o)}
          className={secondaryClass}
        >
          {overlay ? "Remove the overlay" : "Show the overlay"}
        </button>
      </Section>

      <Section title="Outside the viewport">
        <p className="text-sm text-gray-600">
          One button sits far down the page; another is inside a box that
          scrolls on its own. A third element is positioned off-screen.
        </p>
        <div
          data-testid="scroll-box"
          className="h-32 overflow-y-auto rounded-md border border-gray-200 p-3"
        >
          <div className="h-96 text-sm text-gray-500">
            Scroll down inside this box…
          </div>
          <button
            type="button"
            onClick={() => setScrollClicks((c) => c + 1)}
            className={buttonClass}
          >
            Button inside the scroll box
          </button>
        </div>
        <p className="text-sm" data-testid="scroll-clicks">
          Scroll-box button clicked {scrollClicks}{" "}
          {scrollClicks === 1 ? "time" : "times"}
        </p>
        <p className="text-sm" data-testid="far-clicks">
          Far-away button clicked {farClicks}{" "}
          {farClicks === 1 ? "time" : "times"}
        </p>
        <span data-testid="off-screen" className="absolute -left-[9999px]">
          I am positioned off-screen
        </span>
      </Section>

      {/* Far below everything else: needs scrolling to be in view. */}
      <div className="pt-[150vh] lg:col-span-2">
        <button
          type="button"
          onClick={() => setFarClicks((c) => c + 1)}
          className={buttonClass}
        >
          Far-away button
        </button>
      </div>
    </div>
  );
}
