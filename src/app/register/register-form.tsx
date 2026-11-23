"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
} from "react";
import { FormField } from "@/components/form-field";
import { registerAction, type RegisterState } from "@/lib/auth-actions";
import {
  validateRegister,
  type FieldErrors,
  type RegisterField,
  type RegisterInput,
} from "@/lib/validation/auth";

const initialState: RegisterState = { fieldErrors: {} };

export function RegisterForm({ next }: { next: string | null }) {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );
  const [values, setValues] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  // After a failed submit in the browser, errors are re-checked live as the
  // user types; once the server answers, its errors are shown instead.
  const [liveValidation, setLiveValidation] = useState(false);
  const [lastServerState, setLastServerState] = useState(state);
  if (state !== lastServerState) {
    setLastServerState(state);
    setLiveValidation(false);
  }
  let errors: FieldErrors<RegisterField> = state.fieldErrors;
  if (liveValidation) {
    const result = validateRegister(values);
    errors = result.success ? {} : result.fieldErrors;
  }

  // Functional update: several fields may be set in a row (e.g. text typed
  // before hydration is adopted field by field).
  function update(field: RegisterField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // We submit by hand instead of letting <form action> do it, because
    // React resets the form after an action and would clear the inputs.
    // (Without JavaScript the browser still posts to `action` natively.)
    event.preventDefault();
    const result = validateRegister(values);
    if (!result.success) {
      // Invalid: show errors in the browser; the server action never runs.
      setLiveValidation(true);
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Create account"
      className="flex flex-col gap-4"
    >
      {next && <input type="hidden" name="next" value={next} />}

      <FormField
        id="register-name"
        name="name"
        label="Full name"
        autoComplete="name"
        value={values.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
      />
      <FormField
        id="register-email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        data-testid="register-email"
        value={values.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
      />
      <FormField
        id="register-password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        hint="At least 8 characters, including a number."
        data-testid="register-password"
        value={values.password}
        onChange={(e) => update("password", e.target.value)}
        error={errors.password}
      />
      <FormField
        id="register-confirm-password"
        name="confirmPassword"
        type="password"
        label="Confirm password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={(e) => update("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="text-indigo-700 underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
