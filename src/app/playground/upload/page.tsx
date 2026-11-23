import type { Metadata } from "next";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = { title: "Upload and download playground" };

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Upload and download playground</h1>
        <p className="mt-2 text-gray-600">
          Files are sent to the server, which reports back their names and
          sizes. Nothing is stored. Maximum 2 MB per file.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UploadForm
          id="single"
          title="Single file"
          inputLabel="Choose a file"
          multiple={false}
        />
        <UploadForm
          id="multiple"
          title="Multiple files"
          inputLabel="Choose files"
          multiple
        />
      </div>

      <section
        aria-labelledby="download-heading"
        className="rounded-lg border border-gray-200 bg-white p-6"
      >
        <h2 id="download-heading" className="mb-2 text-xl font-semibold">
          Download
        </h2>
        <p className="mb-3 text-sm text-gray-600">
          A CSV file with every product (id, name, category, price, stock).
        </p>
        <a
          href="/api/playground/download"
          download
          className="inline-block rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Download product list (CSV)
        </a>
      </section>
    </div>
  );
}
