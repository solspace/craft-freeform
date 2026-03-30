export const baseUrl = window.location.href.replace(/(.*\/freeform).*/i, "$1");
export const generateUrl = (url?: string, absolute = true): string => {
  const normalized = (url ?? "")
    .replace(/\/+/g, "/")
    .replace(/^\/(.*)/, "$1")
    .replace(/\/$/, "");

  const finalPath = normalized.length ? `/${normalized}` : "";
  const parsed = new URL(`${baseUrl}${finalPath}`);

  return absolute ? parsed.href : parsed.pathname;
};
