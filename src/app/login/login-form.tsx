"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
} from "react";
import { FormField } from "@/components/form-field";
import { loginAction, type LoginState } from "@/lib/auth-actions";

const initialState: LoginState = { error: null };

export function LoginForm({ next }: { next: string | null }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  // Controlled so the email stays filled in after a failed attempt.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Submit by hand: React resets a form after <form action> runs, which
  // would clear the email field after a failed login. (Without JavaScript
  // the browser still posts to `action` natively.)
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Log in"
      className="flex flex-col gap-4"
    >
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </div>
      )}

      <FormField
        id="login-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <FormField
        id="login-password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={pending}
        data-testid="login-submit"
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="text-sm text-gray-600">
        New to ShopLab?{" "}
        <Link
          href={
            next ? `/register?next=${encodeURIComponent(next)}` : "/register"
          }
          className="text-indigo-700 underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
