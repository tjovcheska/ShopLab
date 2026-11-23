"use server";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB per file

export type UploadedFile = { name: string; size: number; type: string };
export type UploadState = {
  files: UploadedFile[];
  error: string | null;
};

/**
 * Receives the files from the upload forms and reports back their names and
 * sizes. Nothing is stored: the files are discarded after the request.
 */
export async function uploadFiles(
  _previous: UploadState,
  formData: FormData,
): Promise<UploadState> {
  // An empty file input still submits one entry: a 0-byte File without a
  // real name (React sends its name as "" or "undefined"). Skip those.
  const files = formData
    .getAll("files")
    .filter((f): f is File => typeof f === "object")
    .filter((f) => !(f.size === 0 && ["", "undefined"].includes(f.name)));

  if (files.length === 0) {
    return { files: [], error: "Choose at least one file first." };
  }
  const tooBig = files.find((f) => f.size > MAX_FILE_BYTES);
  if (tooBig) {
    return {
      files: [],
      error: `${tooBig.name} is larger than 2 MB.`,
    };
  }
  return {
    files: files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type || "unknown",
    })),
    error: null,
  };
}
