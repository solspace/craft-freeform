import { compareVersions, resolveUrl } from "../utils/url.js";
export class ManifestCompatibilityError extends Error {
  constructor(message) {
    super(message);
    this.name = "ManifestCompatibilityError";
  }
}
export async function fetchManifest(options, params) {
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
  const envelope = await response.json();
  if (!envelope.success || !envelope.data) {
    throw new Error(
      envelope.message ?? "Manifest response was not successful.",
    );
  }
  assertClientCompatibility(envelope.data, options.clientVersion);
  return envelope.data;
}
function buildManifestUrl(baseUrl, params) {
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
function assertClientCompatibility(manifest, clientVersion) {
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
