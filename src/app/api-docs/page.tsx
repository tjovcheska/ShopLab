import type { Metadata } from "next";
import { openApiDocument, type OpenApiOperation } from "@/lib/openapi";

export const metadata: Metadata = { title: "API docs" };

// Renders src/lib/openapi.ts (also served at /api/v1/openapi.json) as a
// readable page, without any external scripts or stylesheets.

const METHODS = ["get", "post", "put", "patch", "delete"] as const;

const METHOD_STYLES: Record<string, string> = {
  get: "bg-blue-100 text-blue-800",
  post: "bg-green-100 text-green-800",
  put: "bg-amber-100 text-amber-800",
  patch: "bg-purple-100 text-purple-800",
  delete: "bg-red-100 text-red-800",
};

const ACCESS_LABELS = {
  public: { text: "Public", style: "bg-gray-100 text-gray-700" },
  user: { text: "Login required", style: "bg-indigo-100 text-indigo-800" },
  admin: { text: "Admin only", style: "bg-red-100 text-red-800" },
};

type Endpoint = { method: string; path: string; operation: OpenApiOperation };

function allEndpoints(): Endpoint[] {
  const endpoints: Endpoint[] = [];
  for (const [path, item] of Object.entries(openApiDocument.paths)) {
    for (const method of METHODS) {
      const operation = (item as Record<string, unknown>)[method];
      if (operation) {
        endpoints.push({
          method,
          path,
          operation: operation as OpenApiOperation,
        });
      }
    }
  }
  return endpoints;
}

const anchor = (e: Endpoint) =>
  `${e.method}${e.path}`
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-+$/, "")
    .toLowerCase();

function schemaType(schema: Record<string, unknown>): string {
  if (schema.type === "array") return "array";
  if (Array.isArray(schema.enum)) return (schema.enum as string[]).join(" | ");
  return String(schema.type ?? "");
}

export default function ApiDocsPage() {
  const endpoints = allEndpoints();
  const { info, servers, tags } = openApiDocument;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">{info.title}</h1>
        <p className="max-w-3xl text-gray-700">
          A JSON REST API at{" "}
          <code className="rounded bg-gray-100 px-1">{servers[0].url}</code>.
          The machine-readable OpenAPI {openApiDocument.openapi} document is at{" "}
          <a href="/api/v1/openapi.json" className="text-indigo-700 underline">
            /api/v1/openapi.json
          </a>
          .
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="mb-1 font-semibold">Authentication</h2>
            <p>
              Send the <code>shoplab_session</code> cookie (set when you log in
              on the website) <strong>or</strong> the header{" "}
              <code>Authorization: Bearer &lt;token&gt;</code> with a token from{" "}
              <code>POST /auth/login</code>.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="mb-1 font-semibold">Errors</h2>
            <pre className="overflow-x-auto rounded bg-gray-900 p-2 text-xs text-gray-100">
              {`{ "error": {\n    "code": "VALIDATION_ERROR",\n    "message": "…",\n    "details": { "fields": { … } }\n} }`}
            </pre>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="mb-1 font-semibold">Chaos</h2>
            <p>
              Every endpoint honours <code>?delay=&lt;ms&gt;</code> and the{" "}
              <code>shoplab_delay</code> / <code>shoplab_flaky</code> cookies.
              Flaky failures return <code>500 CHAOS_FLAKY</code>. See{" "}
              <a href="/chaos" className="text-indigo-700 underline">
                /chaos
              </a>
              .
            </p>
          </div>
        </div>
      </header>

      <nav
        aria-label="Endpoints"
        className="rounded-lg border border-gray-200 bg-white p-4"
      >
        <h2 className="mb-2 font-semibold">Endpoints</h2>
        <ul className="grid gap-1 text-sm md:grid-cols-2">
          {endpoints.map((e) => (
            <li key={anchor(e)}>
              <a href={`#${anchor(e)}`} className="hover:text-indigo-700">
                <span className="inline-block w-16 font-mono text-xs font-semibold uppercase">
                  {e.method}
                </span>
                <code>{e.path}</code>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {tags.map((tag) => (
        <section
          key={tag.name}
          aria-labelledby={`tag-${tag.name}`}
          className="flex flex-col gap-4"
        >
          <div>
            <h2 id={`tag-${tag.name}`} className="text-2xl font-semibold">
              {tag.name}
            </h2>
            <p className="text-gray-600">{tag.description}</p>
          </div>
          {endpoints
            .filter((e) => e.operation.tags.includes(tag.name))
            .map((e) => (
              <EndpointCard key={anchor(e)} endpoint={e} />
            ))}
        </section>
      ))}
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const { method, path, operation } = endpoint;
  const id = anchor(endpoint);
  const access = ACCESS_LABELS[operation["x-access"]];
  const example = operation.requestBody?.content["application/json"].example;

  return (
    <article
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-4 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h3
          id={`${id}-title`}
          className="flex items-center gap-2 font-mono text-lg"
        >
          <span
            className={`rounded px-2 py-0.5 text-sm font-bold uppercase ${METHOD_STYLES[method]}`}
          >
            {method}
          </span>
          {path}
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${access.style}`}
        >
          {access.text}
        </span>
      </div>
      <p className="font-medium">{operation.summary}</p>
      {operation.description && (
        <p className="text-sm text-gray-700">{operation.description}</p>
      )}

      {operation.parameters && operation.parameters.length > 0 && (
        <table className="w-full text-left text-sm">
          <caption className="mb-1 text-left font-semibold">Parameters</caption>
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th scope="col" className="py-1 pr-4">
                Name
              </th>
              <th scope="col" className="py-1 pr-4">
                In
              </th>
              <th scope="col" className="py-1 pr-4">
                Type
              </th>
              <th scope="col" className="py-1">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {operation.parameters.map((p) => (
              <tr key={p.name} className="border-b border-gray-100 align-top">
                <th scope="row" className="py-1 pr-4 font-mono font-normal">
                  {p.name}
                  {p.required && (
                    <span className="text-red-600" title="required">
                      {" "}
                      *
                    </span>
                  )}
                </th>
                <td className="py-1 pr-4">{p.in}</td>
                <td className="py-1 pr-4 font-mono text-xs">
                  {schemaType(p.schema)}
                </td>
                <td className="py-1">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {example !== undefined && (
        <div>
          <p className="mb-1 text-sm font-semibold">Example request body</p>
          <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
            {JSON.stringify(example, null, 2)}
          </pre>
        </div>
      )}

      <table className="w-full text-left text-sm">
        <caption className="mb-1 text-left font-semibold">Responses</caption>
        <thead>
          <tr className="border-b border-gray-200 text-gray-600">
            <th scope="col" className="w-20 py-1">
              Status
            </th>
            <th scope="col" className="py-1">
              Meaning
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(operation.responses)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([status, response]) => (
              <tr key={status} className="border-b border-gray-100 align-top">
                <th scope="row" className="py-1 font-mono font-semibold">
                  {status}
                </th>
                <td className="py-1">{response.description}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </article>
  );
}
