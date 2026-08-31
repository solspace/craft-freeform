import {
  CLIENT_NAME as CORE_CLIENT_NAME,
  collectExtensionSubmitMeta,
  createFormState,
  createFreeformClient,
  type FieldValue,
  type FormState,
  type FreeformClient,
  type FreeformExtension,
  type FreeformManifest,
  type ManifestCaptchaSecurity,
  prepareSubmitValues,
  runExtensionAfterSubmit,
  runExtensionSetups,
  type SubmitIntent,
} from "@solspace/freeform-core";
import {
  computed,
  type MaybeRefOrGetter,
  onScopeDispose,
  reactive,
  ref,
  shallowRef,
  toValue,
  watch,
  watchEffect,
} from "vue";
import { defaultTheme } from "../theme/defaultTheme.js";
import {
  CLIENT_NAME,
  type FreeformRuntime,
  PACKAGE_VERSION,
  type UseFreeformOptions,
  type UseFreeformResult,
} from "../types.js";
import { buildSecurityMeta } from "../utils/securityMeta.js";

type Snapshot = {
  values: Record<string, FieldValue>;
  touched: Record<string, boolean>;
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
  pageErrors: string[];
  currentPageIndex: number;
  visibilityVersion: number;
};

function snapshotFromState(
  formState: FormState,
  visibilityVersion: number,
): Snapshot {
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

export function useFreeform(
  options: MaybeRefOrGetter<UseFreeformOptions>,
): UseFreeformResult {
  const opts = computed(() => toValue(options));
  const theme = computed(() => opts.value.theme ?? defaultTheme);
  const renderers = computed(() => opts.value.renderers ?? {});
  const allowRawHtml = computed(() => opts.value.allowRawHtml ?? false);

  const clientRef = shallowRef<FreeformClient | null>(null);
  const formStateRef = shallowRef<FormState | null>(null);
  const extensionMountsRef = shallowRef(new Map<string, HTMLElement>());
  const captchaCleanupsRef = shallowRef(new Map<string, () => void>());
  const extensionsRef = shallowRef<FreeformExtension[]>([]);
  const visibilityVersionRef = ref(0);
  const draftHydrateKeyRef = ref<string | null>(null);

  const manifest = ref<FreeformManifest | null>(opts.value.manifest ?? null);
  const loading = ref(!opts.value.manifest);
  const error = ref<Error | null>(null);
  const isSubmitting = ref(false);
  const isComplete = ref(false);
  const successMessage = ref<string | null>(null);
  const snapshot = ref<Snapshot>({
    values: {},
    touched: {},
    fieldErrors: {},
    formErrors: [],
    pageErrors: [],
    currentPageIndex: 0,
    visibilityVersion: 0,
  });

  watch(
    () => opts.value.extensions,
    (extensions) => {
      extensionsRef.value = extensions ?? [];
    },
    { immediate: true },
  );

  function syncFromFormState() {
    const formState = formStateRef.value;
    if (!formState) {
      return;
    }

    visibilityVersionRef.value += 1;
    snapshot.value = snapshotFromState(formState, visibilityVersionRef.value);
  }

  function getClient(): FreeformClient {
    if (!clientRef.value) {
      clientRef.value = createFreeformClient({
        baseUrl: opts.value.baseUrl,
        clientVersion: opts.value.clientVersion ?? PACKAGE_VERSION,
        fetch: opts.value.fetch,
        credentials: opts.value.credentials,
      });
    }

    for (const extension of extensionsRef.value) {
      clientRef.value.extensions.register(extension);
    }

    return clientRef.value;
  }

  watch(
    () => opts.value.extensions,
    () => {
      const client = getClient();
      for (const extension of extensionsRef.value) {
        client.extensions.register(extension);
      }
    },
  );

  watch(manifest, (current) => {
    if (!current) {
      return;
    }
    void runExtensionSetups(extensionsRef.value, { manifest: current });
  });

  watch(
    () => [
      opts.value.handle,
      opts.value.profile,
      opts.value.properties,
      opts.value.manifest,
      opts.value.initialValues,
    ],
    () => {
      if (opts.value.manifest) {
        formStateRef.value = createFormState({
          manifest: opts.value.manifest,
          initialValues: opts.value.initialValues,
          draftToken: opts.value.draftToken,
          draftKey: opts.value.draftKey,
        });
        manifest.value = opts.value.manifest;
        syncFromFormState();
        loading.value = false;
        return;
      }

      if (!opts.value.handle && !opts.value.profile) {
        error.value = new Error(
          "Either handle, profile, or manifest is required.",
        );
        loading.value = false;
        return;
      }

      let cancelled = false;

      const load = async () => {
        loading.value = true;
        error.value = null;

        try {
          const loaded = await getClient().loadManifest({
            handle: opts.value.handle,
            profile: opts.value.profile,
            properties: opts.value.properties,
          });

          if (cancelled) {
            return;
          }

          formStateRef.value = createFormState({
            manifest: loaded,
            initialValues: opts.value.initialValues,
            draftToken: opts.value.draftToken,
            draftKey: opts.value.draftKey,
          });
          manifest.value = loaded;
          syncFromFormState();
          opts.value.onManifestLoaded?.(loaded);
        } catch (loadError) {
          if (!cancelled) {
            error.value =
              loadError instanceof Error
                ? loadError
                : new Error("Failed to load manifest.");
          }
        } finally {
          if (!cancelled) {
            loading.value = false;
          }
        }
      };

      void load();

      onScopeDispose(() => {
        cancelled = true;
      });
    },
    { immediate: true },
  );

  watch(
    () => [opts.value.draftToken, opts.value.draftKey],
    () => {
      const formState = formStateRef.value;
      if (!formState) {
        return;
      }

      if (opts.value.draftToken !== undefined) {
        formState.draftToken = opts.value.draftToken ?? null;
      }
      if (opts.value.draftKey !== undefined) {
        formState.draftKey = opts.value.draftKey ?? null;
      }
    },
  );

  function setValue(handle: string, value: FieldValue) {
    formStateRef.value?.setValue(handle, value);
    syncFromFormState();
  }

  function getValue(handle: string) {
    return formStateRef.value?.getValue(handle);
  }

  function isFieldVisible(handle: string) {
    return formStateRef.value?.isFieldVisible(handle) ?? false;
  }

  function isFieldEnabled(handle: string) {
    return formStateRef.value?.isFieldEnabled(handle) ?? true;
  }

  function getFieldProps(handle: string) {
    const formState = formStateRef.value;
    const field = manifest.value?.fields[handle];
    const value = formState?.getValue(handle);

    return {
      id: `freeform-${handle}`,
      name: handle,
      value: value ?? "",
      onChange: (event: Event) => {
        const target = event.target as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement;
        setValue(handle, target.value);
      },
      onBlur: () => {
        const current = formStateRef.value;
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
  }

  async function submit(intent: SubmitIntent = "submit") {
    const formState = formStateRef.value;
    const currentManifest = manifest.value;
    if (!formState || !currentManifest) {
      return undefined;
    }

    isSubmitting.value = true;

    try {
      const rawValues = formState.getValuesForSubmit();
      const { values, files } = prepareSubmitValues(
        rawValues,
        currentManifest.fields,
      );

      const submitContext = {
        ...formState.getSubmitContext(),
        sourceUrl:
          typeof window !== "undefined" ? window.location.href : undefined,
      };

      const securityMeta = buildSecurityMeta(currentManifest);
      const extensionMeta = await collectExtensionSubmitMeta(
        extensionsRef.value,
        {
          manifest: currentManifest,
          intent,
          values,
          meta: securityMeta,
          context: submitContext,
          baseUrl: opts.value.baseUrl,
        },
      );

      const result = await getClient().submit({
        manifest: currentManifest,
        request: {
          values,
          intent,
          context: submitContext,
          meta: {
            client: CLIENT_NAME,
            clientVersion: opts.value.clientVersion ?? PACKAGE_VERSION,
            ...extensionMeta,
          },
        },
        files: Object.keys(files).length > 0 ? files : undefined,
      });

      formState.applySubmitResponse(result);
      syncFromFormState();

      await runExtensionAfterSubmit(extensionsRef.value, {
        manifest: currentManifest,
        intent,
        response: result,
        baseUrl: opts.value.baseUrl,
      });

      if (result.complete) {
        isComplete.value = true;
        successMessage.value =
          result.message ??
          currentManifest.settings.successMessage ??
          "Thank you for your submission.";
      }

      if (result.success) {
        opts.value.onSuccess?.(result);
      } else {
        opts.value.onError?.(result);
      }

      return result;
    } catch (submitError) {
      if (
        submitError instanceof Error &&
        (submitError.name === "StripePaymentRedirectError" ||
          submitError.name === "MolliePaymentRedirectError")
      ) {
        return undefined;
      }

      const message =
        submitError instanceof Error
          ? submitError
          : new Error("Something went wrong while submitting the form.");
      if (formState) {
        formState.formErrors = [message.message];
        formState.fieldErrors = {};
        formState.pageErrors = [];
        syncFromFormState();
      }
      opts.value.onError?.({
        success: false,
        status: "error",
        complete: false,
        errors: { fields: {}, form: [message.message], page: [] },
      });
      return undefined;
    } finally {
      isSubmitting.value = false;
    }
  }

  const validate = () => submit("validate");
  const goNext = () => submit("next");
  const goBack = () => submit("back");
  const saveDraft = () => submit("saveDraft");

  watch(
    () => [manifest.value, opts.value.draftToken, opts.value.draftKey],
    () => {
      if (!manifest.value) {
        return;
      }

      const token = opts.value.draftToken;
      const key = opts.value.draftKey;
      if (!token || !key) {
        return;
      }

      const hydrateKey = `${token}:${key}`;
      if (draftHydrateKeyRef.value === hydrateKey) {
        return;
      }

      draftHydrateKeyRef.value = hydrateKey;
      void submit("validate");
    },
  );

  function reset() {
    if (!manifest.value) {
      return;
    }

    formStateRef.value = createFormState({
      manifest: manifest.value,
      initialValues: opts.value.initialValues,
      draftToken: opts.value.draftToken,
      draftKey: opts.value.draftKey,
    });
    isComplete.value = false;
    successMessage.value = null;
    syncFromFormState();
  }

  async function handleSubmit(event?: Event) {
    event?.preventDefault();

    const currentManifest = manifest.value;
    if (!currentManifest) {
      return;
    }

    const pages = currentManifest.layout.pages;
    const isLastPage =
      pages.length === 0 || snapshot.value.currentPageIndex >= pages.length - 1;

    if (currentManifest.settings.multiPage && !isLastPage) {
      await goNext();
      return;
    }

    await submit("submit");
  }

  function mountFieldExtension(handle: string, element: HTMLElement) {
    const currentManifest = manifest.value;
    if (!currentManifest) {
      return () => {};
    }

    extensionMountsRef.value.set(handle, element);
    const field = currentManifest.fields[handle];
    if (!field) {
      return () => {
        extensionMountsRef.value.delete(handle);
      };
    }

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    void (async () => {
      for (const extension of extensionsRef.value) {
        if (extension.supports && !extension.supports(field)) {
          continue;
        }
        if (!extension.mount) {
          continue;
        }

        const cleanup = await extension.mount({
          manifest: currentManifest,
          field,
          element,
          value: formStateRef.value?.getValue(handle),
          setValue: (value) => {
            formStateRef.value?.setValue(handle, value as FieldValue);
            syncFromFormState();
          },
          getValues: () =>
            (formStateRef.value?.getValuesForSubmit() ?? {}) as Record<
              string,
              unknown
            >,
          baseUrl: opts.value.baseUrl,
          requestSubmit: () => {
            void submit("submit");
          },
        });

        if (cancelled) {
          if (typeof cleanup === "function") {
            cleanup();
          }
          return;
        }

        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        }
      }
    })();

    return () => {
      cancelled = true;
      for (const cleanup of cleanups) {
        cleanup();
      }
      extensionMountsRef.value.delete(handle);
    };
  }

  function mountCaptcha(
    captcha: ManifestCaptchaSecurity,
    element: HTMLElement,
  ) {
    const currentManifest = manifest.value;
    if (!currentManifest) {
      return () => {};
    }

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    void (async () => {
      for (const extension of extensionsRef.value) {
        const cleanup = await extension.mountCaptcha?.({
          manifest: currentManifest,
          captcha,
          element,
        });
        if (cancelled) {
          if (typeof cleanup === "function") {
            cleanup();
          }
          return;
        }
        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        }
      }
    })();

    const dispose = () => {
      cancelled = true;
      for (const cleanup of cleanups) {
        cleanup();
      }
      captchaCleanupsRef.value.delete(captcha.name);
    };

    captchaCleanupsRef.value.set(captcha.name, dispose);
    return dispose;
  }

  const runtime = computed((): FreeformRuntime | null => {
    const currentManifest = manifest.value;
    if (!currentManifest) {
      return null;
    }

    return {
      manifest: currentManifest,
      values: snapshot.value.values,
      touched: snapshot.value.touched,
      fieldErrors: snapshot.value.fieldErrors,
      formErrors: snapshot.value.formErrors,
      pageErrors: snapshot.value.pageErrors,
      currentPageIndex: snapshot.value.currentPageIndex,
      isSubmitting: isSubmitting.value,
      isComplete: isComplete.value,
      successMessage: successMessage.value,
      setValue,
      getValue,
      isFieldVisible,
      isFieldEnabled,
      getFieldProps,
      submit,
      validate,
      goNext,
      goBack,
      saveDraft,
      reset,
      handleSubmit,
      mountFieldExtension,
      mountCaptcha,
    };
  });

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
    saveDraft,
    reset,
    handleSubmit,
    mountFieldExtension,
    mountCaptcha,
  };

  const result = reactive({} as UseFreeformResult);

  watchEffect(() => {
    const currentRuntime = runtime.value;

    if (!currentRuntime) {
      Object.assign(result, {
        loading: loading.value,
        error: error.value,
        manifest: null,
        theme: theme.value,
        renderers: renderers.value,
        allowRawHtml: allowRawHtml.value,
        ...emptyRuntime,
      });
      return;
    }

    Object.assign(result, {
      ...currentRuntime,
      loading: loading.value,
      error: error.value,
      manifest: manifest.value,
      theme: theme.value,
      renderers: renderers.value,
      allowRawHtml: allowRawHtml.value,
    });
  });

  return result;
}

void CORE_CLIENT_NAME;
