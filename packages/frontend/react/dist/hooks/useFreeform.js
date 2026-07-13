"use client";
import {
  CLIENT_NAME as CORE_CLIENT_NAME,
  createFormState,
  createFreeformClient,
} from "@solspace/freeform-core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultTheme } from "../theme/defaultTheme.js";
import { CLIENT_NAME, PACKAGE_VERSION } from "../types.js";
import { buildSecurityMeta } from "../utils/securityMeta.js";

function snapshotFromState(formState, visibilityVersion) {
  return {
    values: { ...formState.values },
    touched: { ...formState.touched },
    fieldErrors: { ...formState.fieldErrors },
    formErrors: [...formState.formErrors],
    pageErrors: [...formState.pageErrors],
    currentPageIndex: formState.currentPageIndex,
    visibilityVersion,
  };
}
export function useFreeform(options) {
  const theme = options.theme ?? defaultTheme;
  const renderers = options.renderers ?? {};
  const allowRawHtml = options.allowRawHtml ?? false;
  const clientRef = useRef(null);
  const formStateRef = useRef(null);
  const extensionMountsRef = useRef(new Map());
  const visibilityVersionRef = useRef(0);
  const [manifest, setManifest] = useState(options.manifest ?? null);
  const [loading, setLoading] = useState(!options.manifest);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [snapshot, setSnapshot] = useState({
    values: {},
    touched: {},
    fieldErrors: {},
    formErrors: [],
    pageErrors: [],
    currentPageIndex: 0,
    visibilityVersion: 0,
  });
  const syncFromFormState = useCallback(() => {
    const formState = formStateRef.current;
    if (!formState) {
      return;
    }
    visibilityVersionRef.current += 1;
    setSnapshot(snapshotFromState(formState, visibilityVersionRef.current));
  }, []);
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = createFreeformClient({
        baseUrl: options.baseUrl,
        clientVersion: options.clientVersion ?? PACKAGE_VERSION,
        fetch: options.fetch,
        credentials: options.credentials,
      });
    }
    return clientRef.current;
  }, [
    options.baseUrl,
    options.clientVersion,
    options.credentials,
    options.fetch,
  ]);
  useEffect(() => {
    if (options.manifest) {
      formStateRef.current = createFormState({
        manifest: options.manifest,
        initialValues: options.initialValues,
      });
      setManifest(options.manifest);
      syncFromFormState();
      setLoading(false);
      return;
    }
    if (!options.handle && !options.profile) {
      setError(new Error("Either handle, profile, or manifest is required."));
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const loaded = await getClient().loadManifest({
          handle: options.handle,
          profile: options.profile,
          properties: options.properties,
        });
        if (cancelled) {
          return;
        }
        formStateRef.current = createFormState({
          manifest: loaded,
          initialValues: options.initialValues,
        });
        setManifest(loaded);
        syncFromFormState();
        options.onManifestLoaded?.(loaded);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError
              : new Error("Failed to load manifest."),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    getClient,
    options.handle,
    options.profile,
    options.properties,
    options.manifest,
    options.initialValues,
    options.onManifestLoaded,
    syncFromFormState,
  ]);
  const setValue = useCallback(
    (handle, value) => {
      formStateRef.current?.setValue(handle, value);
      syncFromFormState();
    },
    [syncFromFormState],
  );
  const getValue = useCallback((handle) => {
    return formStateRef.current?.getValue(handle);
  }, []);
  const isFieldVisible = useCallback((handle) => {
    return formStateRef.current?.isFieldVisible(handle) ?? false;
  }, []);
  const isFieldEnabled = useCallback((handle) => {
    return formStateRef.current?.isFieldEnabled(handle) ?? true;
  }, []);
  const getFieldProps = useCallback(
    (handle) => {
      const formState = formStateRef.current;
      const field = manifest?.fields[handle];
      const value = formState?.getValue(handle);
      return {
        id: `freeform-${handle}`,
        name: handle,
        value: value ?? "",
        onChange: (event) => {
          setValue(handle, event.target.value);
        },
        onBlur: () => {
          const current = formStateRef.current;
          if (!current) {
            return;
          }
          current.touched = { ...current.touched, [handle]: true };
          syncFromFormState();
        },
        disabled: !isFieldEnabled(handle),
        required: field?.required ?? false,
        placeholder: field?.placeholder ?? undefined,
        "aria-invalid": (formState?.fieldErrors[handle]?.length ?? 0) > 0,
      };
    },
    [isFieldEnabled, manifest?.fields, setValue, syncFromFormState],
  );
  const submit = useCallback(
    async (intent = "submit") => {
      const formState = formStateRef.current;
      if (!formState || !manifest) {
        return undefined;
      }
      setIsSubmitting(true);
      try {
        const rawValues = formState.getValuesForSubmit();
        const values = {};
        const files = {};
        for (const [handle, value] of Object.entries(rawValues)) {
          if (value instanceof File || value instanceof Blob) {
            files[handle] = value;
            continue;
          }
          if (
            Array.isArray(value) &&
            value.length > 0 &&
            (value[0] instanceof File || value[0] instanceof Blob)
          ) {
            files[handle] = value;
            continue;
          }
          values[handle] = value;
        }
        const result = await getClient().submit({
          manifest,
          request: {
            values,
            intent,
            meta: {
              client: CLIENT_NAME,
              clientVersion: options.clientVersion ?? PACKAGE_VERSION,
              ...buildSecurityMeta(manifest),
            },
          },
          files: Object.keys(files).length > 0 ? files : undefined,
        });
        formState.applySubmitResponse(result);
        syncFromFormState();
        if (result.complete) {
          setIsComplete(true);
          setSuccessMessage(
            result.message ??
              manifest.settings.successMessage ??
              "Thank you for your submission.",
          );
        }
        if (result.success) {
          options.onSuccess?.(result);
        } else {
          options.onError?.(result);
        }
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      getClient,
      manifest,
      options.clientVersion,
      options.onError,
      options.onSuccess,
      syncFromFormState,
    ],
  );
  const validate = useCallback(() => submit("validate"), [submit]);
  const goNext = useCallback(() => submit("next"), [submit]);
  const goBack = useCallback(() => submit("back"), [submit]);
  const reset = useCallback(() => {
    if (!manifest) {
      return;
    }
    formStateRef.current = createFormState({
      manifest,
      initialValues: options.initialValues,
    });
    setIsComplete(false);
    setSuccessMessage(null);
    syncFromFormState();
  }, [manifest, options.initialValues, syncFromFormState]);
  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault();
      if (!manifest) {
        return;
      }
      const pages = manifest.layout.pages;
      const isLastPage =
        pages.length === 0 || snapshot.currentPageIndex >= pages.length - 1;
      if (manifest.settings.multiPage && !isLastPage) {
        await goNext();
        return;
      }
      await submit("submit");
    },
    [goNext, manifest, snapshot.currentPageIndex, submit],
  );
  const mountFieldExtension = useCallback((handle, element) => {
    extensionMountsRef.current.set(handle, element);
    return () => {
      extensionMountsRef.current.delete(handle);
    };
  }, []);
  const runtime = useMemo(() => {
    if (!manifest) {
      return null;
    }
    return {
      manifest,
      values: snapshot.values,
      touched: snapshot.touched,
      fieldErrors: snapshot.fieldErrors,
      formErrors: snapshot.formErrors,
      pageErrors: snapshot.pageErrors,
      currentPageIndex: snapshot.currentPageIndex,
      isSubmitting,
      isComplete,
      successMessage,
      setValue,
      getValue,
      isFieldVisible,
      isFieldEnabled,
      getFieldProps,
      submit,
      validate,
      goNext,
      goBack,
      reset,
      handleSubmit,
      mountFieldExtension,
    };
  }, [
    getFieldProps,
    getValue,
    goBack,
    goNext,
    handleSubmit,
    isComplete,
    isFieldEnabled,
    isFieldVisible,
    isSubmitting,
    manifest,
    mountFieldExtension,
    reset,
    setValue,
    snapshot,
    submit,
    successMessage,
    validate,
  ]);
  const emptyRuntime = {
    values: {},
    touched: {},
    fieldErrors: {},
    formErrors: [],
    pageErrors: [],
    currentPageIndex: 0,
    isSubmitting: false,
    isComplete: false,
    successMessage: null,
    setValue,
    getValue,
    isFieldVisible,
    isFieldEnabled,
    getFieldProps,
    submit,
    validate,
    goNext,
    goBack,
    reset,
    handleSubmit,
    mountFieldExtension,
  };
  if (!runtime) {
    return {
      loading,
      error,
      manifest: null,
      theme,
      renderers,
      allowRawHtml,
      ...emptyRuntime,
    };
  }
  return {
    ...runtime,
    loading,
    error,
    manifest,
    theme,
    renderers,
    allowRawHtml,
  };
}
// Silence unused import from core in case tree-shaking removes meta usage elsewhere.
void CORE_CLIENT_NAME;
