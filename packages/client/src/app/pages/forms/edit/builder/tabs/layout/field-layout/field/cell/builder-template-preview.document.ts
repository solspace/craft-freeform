import DOMPurify from "dompurify";

export const buildBuilderTemplatePreviewDocument = (html: string): string => {
  const safe = DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "iframe", "object", "embed"],
    FORBID_ATTR: ["srcdoc"],
  });

  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' https: http: data:; style-src 'unsafe-inline' https: http:; font-src 'self' https: http: data:; form-action 'none'"><style>html,body{margin:0;max-width:100%;}body{box-sizing:border-box;font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere;}*,*::before,*::after{box-sizing:border-box;}</style></head><body>${safe}</body></html>`;
};
