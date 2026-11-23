"use client";

import { useState } from "react";

// window.alert / confirm / prompt block the page until answered.
// The result of each one is written to the "Result" line.
export function DialogButtons() {
  const [result, setResult] = useState("No dialog opened yet.");

  function showAlert() {
    window.alert("Hello from ShopLab!");
    setResult("Alert was closed.");
  }

  function showConfirm() {
    const ok = window.confirm("Do you want to continue?");
    setResult(ok ? "Confirm: you clicked OK." : "Confirm: you clicked Cancel.");
  }

  function showPrompt() {
    const answer = window.prompt("What is your name?", "Guest");
    setResult(
      answer === null
        ? "Prompt: you clicked Cancel."
        : `Prompt: you entered “${answer}”.`,
    );
  }

  const buttonClass =
    "rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={showAlert} className={buttonClass}>
          Show alert
        </button>
        <button type="button" onClick={showConfirm} className={buttonClass}>
          Show confirm
        </button>
        <button type="button" onClick={showPrompt} className={buttonClass}>
          Show prompt
        </button>
      </div>
      <p className="text-gray-800">
        Result:{" "}
        <output
          data-testid="dialog-result"
          aria-live="polite"
          className="font-medium"
        >
          {result}
        </output>
      </p>
    </div>
  );
}
