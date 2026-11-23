"use client";

import { useState, type FormEvent } from "react";

export function Greeter() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGreeting(`Hello, ${name.trim() || "stranger"}! (from the outer frame)`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="outer-name" className="text-sm font-medium">
          Your name
        </label>
        <input
          id="outer-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white"
      >
        Greet
      </button>
      {greeting && (
        <p role="status" className="w-full text-sm text-indigo-900">
          {greeting}
        </p>
      )}
    </form>
  );
}
