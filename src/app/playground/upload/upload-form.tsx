"use client";

import { useActionState } from "react";
import { uploadFiles, type UploadState } from "./actions";

const initialState: UploadState = { files: [], error: null };

/** 1536 → "1.5 KB (1,536 bytes)" */
function formatSize(bytes: number): string {
  const exact = `${bytes.toLocaleString("en-US")} bytes`;
  if (bytes < 1024) return exact;
  const units = ["KB", "MB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]} (${exact})`;
}

export function UploadForm({
  id,
  title,
  inputLabel,
  multiple,
}: {
  id: string;
  title: string;
  inputLabel: string;
  multiple: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    uploadFiles,
    initialState,
  );
  const inputId = `${id}-file-input`;

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6"
    >
      <h2 id={`${id}-heading`} className="text-xl font-semibold">
        {title}
      </h2>
      <form action={formAction} className="flex flex-col gap-3">
        <label htmlFor={inputId} className="text-sm font-medium">
          {inputLabel}
        </label>
        <input
          id={inputId}
          name="files"
          type="file"
          multiple={multiple}
          data-testid={multiple ? "multiple-file-input" : undefined}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.files.length > 0 && (
        <div role="status">
          <p className="mb-2 text-sm font-medium text-green-800">
            Uploaded {state.files.length}{" "}
            {state.files.length === 1 ? "file" : "files"}:
          </p>
          <ul aria-label={`${title}: uploaded files`} className="text-sm">
            {state.files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex justify-between gap-4 border-b border-gray-100 py-1"
              >
                <span className="font-medium">{file.name}</span>
                <span className="text-gray-600">{formatSize(file.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
