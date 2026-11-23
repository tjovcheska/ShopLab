"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import {
  removeAvatarAction,
  uploadAvatarAction,
  type AvatarState,
} from "@/lib/account-actions";

const initialState: AvatarState = { ok: false, message: null };

/** Single-file upload of a profile picture, plus "Remove" with confirm(). */
export function AvatarSection({
  name,
  hasAvatar,
  version,
}: {
  name: string;
  hasAvatar: boolean;
  version: string;
}) {
  const router = useRouter();
  const [state, formAction, uploading] = useActionState(
    uploadAvatarAction,
    initialState,
  );
  const [removeMessage, setRemoveMessage] = useState<string | null>(null);
  const [removing, startRemoving] = useTransition();
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRemoveMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(() => formAction(formData));
    form.reset(); // clear the chosen file
  }

  function remove() {
    // A native confirm() dialog: tests must handle page.on('dialog').
    if (!window.confirm("Remove your profile picture?")) return;
    startRemoving(async () => {
      const result = await removeAvatarAction();
      setRemoveMessage(result.message);
      router.refresh();
    });
  }

  const message = removeMessage ?? state.message;
  return (
    <section
      aria-labelledby="avatar-heading"
      className="mb-6 flex flex-wrap items-center gap-6"
    >
      {hasAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- user upload served by our own route
        <img
          src={`/account/avatar?v=${version}`}
          alt={`Profile picture of ${name}`}
          width={80}
          height={80}
          className="h-20 w-20 rounded-full border border-gray-200 object-cover"
        />
      ) : (
        <span
          aria-label="No profile picture"
          role="img"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700"
        >
          {initials}
        </span>
      )}
      <div className="flex flex-col gap-2">
        <h2 id="avatar-heading" className="font-semibold">
          Profile picture
        </h2>
        <form
          action={formAction}
          onSubmit={handleSubmit}
          aria-label="Profile picture"
          className="flex flex-wrap items-center gap-2"
        >
          <label htmlFor="avatar-input" className="sr-only">
            Choose a profile picture
          </label>
          <input
            id="avatar-input"
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            data-testid="avatar-input"
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700"
          />
          <button
            type="submit"
            disabled={uploading}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload picture"}
          </button>
          {hasAvatar && (
            <button
              type="button"
              onClick={remove}
              disabled={removing}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Remove picture
            </button>
          )}
        </form>
        {message && (
          <p
            role={state.ok || removeMessage ? "status" : "alert"}
            className="text-sm text-gray-700"
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
