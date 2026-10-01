import type { FreeformManifest, ManifestEnvelope } from "../types/manifest.js";
import { compareVersions, resolveUrl } from "../utils/url.js";

export type ManifestClientOptions = {
  baseUrl: string;
  clientVersion: string;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
};

export type FetchManifestOptions = {
  handle?: string;
  profile?: string;
  properties?: Record<string, string | number | boolean>;
};

export class ManifestCompatibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManifestCompatibilityError";
  }
}

export async function fetchManifest(
  options: ManifestClientOptions,
  params: FetchManifestOptions,
): Promise<FreeformManifest> {
  const fetchFn = options.fetch ?? fetch;
  const url = buildManifestUrl(options.baseUrl, params);
  const response = await fetchFn(url, {
    method: "GET",
    credentials: options.credentials ?? "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest (${response.status}).`);
  }

  const envelope = (await response.json()) as ManifestEnvelope;
  if (!envelope.success || !envelope.data) {
    throw new Error(
      envelope.message ?? "Manifest response was not successful.",
    );
  }

  assertClientCompatibility(envelope.data, options.clientVersion);

  return envelope.data;
}

function buildManifestUrl(
  baseUrl: string,
  params: FetchManifestOptions,
): string {
  if (params.profile) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params.properties ?? {})) {
      search.set(`properties[${key}]`, String(value));
    }
    const query = search.toString();

    return resolveUrl(
      baseUrl,
      `/freeform/api/manifests/${encodeURIComponent(params.profile)}/manifest${query ? `?${query}` : ""}`,
    );
  }

  if (!params.handle) {
    throw new Error(
      "Either handle or profile is required to fetch a manifest.",
    );
  }

  return resolveUrl(
    baseUrl,
    `/freeform/api/forms/${encodeURIComponent(params.handle)}/manifest`,
  );
}

function assertClientCompatibility(
  manifest: FreeformManifest,
  clientVersion: string,
): void {
  if (manifest.schemaVersion !== "1.0") {
    throw new ManifestCompatibilityError(
      `Unsupported manifest schema version "${manifest.schemaVersion}".`,
    );
  }

  if (
    manifest.minimumClientVersion &&
    compareVersions(clientVersion, manifest.minimumClientVersion) < 0
  ) {
    throw new ManifestCompatibilityError(
      `Manifest requires client >= ${manifest.minimumClientVersion}, but ${clientVersion} is installed.`,
    );
  }
}
