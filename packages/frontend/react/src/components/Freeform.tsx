"use client";

import { useFreeform } from "../hooks/useFreeform.js";
import type { FreeformProps, UseFreeformResult } from "../types.js";
import { FormLoader } from "./FormLoader.js";
import { FreeformView } from "./FreeformView.js";

export function Freeform({
  children,
  className,
  loadingMessage,
  loadingFallback,
  errorFallback = (error) => <div role="alert">{error.message}</div>,
  ...options
}: FreeformProps) {
  const form = useFreeform(options);
  const loader = loadingFallback ?? (
    <FormLoader message={loadingMessage ?? "Loading form…"} />
  );

  if (children) {
    return <>{children(form)}</>;
  }

  if (form.loading) {
    return <>{loader}</>;
  }

  if (form.error) {
    return <>{errorFallback(form.error)}</>;
  }

  if (!form.manifest) {
    return null;
  }

  return (
    <FreeformView form={form as LoadedFreeformResult} className={className} />
  );
}

type LoadedFreeformResult = UseFreeformResult & {
  manifest: NonNullable<UseFreeformResult["manifest"]>;
};
