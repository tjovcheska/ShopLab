"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white"
        >
          Increment
        </button>
        <p data-testid="inner-counter" aria-live="polite">
          Clicked {count} {count === 1 ? "time" : "times"}
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        I found the inner frame
      </label>
      {agreed && (
        <p className="text-sm font-medium text-green-800">Well done!</p>
      )}
    </div>
  );
}
