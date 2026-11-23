// Helpers for files sent to Server Actions.

/**
 * The real files of a FormData field. An empty file input still submits one
 * entry: a 0-byte File without a real name (React sends it as "" or
 * "undefined"). Those are skipped.
 */
export function filesFrom(formData: FormData, field: string): File[] {
  return formData
    .getAll(field)
    .filter((f): f is File => typeof f === "object")
    .filter((f) => !(f.size === 0 && ["", "undefined"].includes(f.name)));
}

/** 1536 → "1.5 KB (1,536 bytes)" */
export function formatFileSize(bytes: number): string {
  const exact = `${bytes.toLocaleString("en-US")} bytes`;
  if (bytes < 1024) return exact;
  const kb = bytes / 1024;
  return kb < 1024
    ? `${kb.toFixed(1)} KB (${exact})`
    : `${(kb / 1024).toFixed(1)} MB (${exact})`;
}
