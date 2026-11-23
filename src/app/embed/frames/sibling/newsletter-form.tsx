"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) setSubscribed(email.trim());
  }

  if (subscribed) {
    return (
      <p role="status" className="text-sm font-medium text-amber-900">
        Subscribed {subscribed} to the newsletter.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="newsletter-email" className="text-sm font-medium">
        Email
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5"
      />
      <button
        type="submit"
        className="rounded-md bg-amber-600 px-4 py-1.5 text-sm font-medium text-white"
      >
        Subscribe
      </button>
    </form>
  );
}
