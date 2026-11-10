import { FormComponent } from "@components/form-controls";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import {
  injectInto as handleMiddleware,
  handle as handleParser,
} from "@components/middleware/implementations";
import { ModalContainer, ModalFooter } from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import { ErrorBlock } from "@components/notification-blocks/error/error-block";
import config from "@config/freeform/freeform.config";
import { PortalProvider } from "@editor/builder/contexts/portal.context";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { useOnKeypress } from "@ff-client/hooks/use-on-keypress";
import type { Form } from "@ff-client/types/forms";
import type { GenericValue } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import axios from "axios";
import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FormModalLoading } from "./modal.form.loading";
import {
  useFetchFormModalType,
  useFormStartingPoints,
} from "./modal.form.queries";
import { StartingPointPicker } from "./modal.form.starting-point";
import { FormCreationHeader, FormWrapper } from "./modal.form.styles";
import { WizardIcon } from "./wizard/wizard.icon";
import type { WizardDraft } from "./wizard/wizard.types";

export const CreateFormModal: React.FC<ModalContainerProps> = ({
  closeModal,
}) => {
  const { current: currentSite } = useSiteContext();
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);
  const initialized = useRef(false);
  const customName = useRef(false);
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const request = useRef({ fingerprint: "", token: crypto.randomUUID() });
  const [startingPoint, setStartingPoint] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [state, setState] = useState<GenericValue>({
    sites: currentSite ? [currentSite.id] : null,
  });
  const [errors, setErrors] = useState<GenericValue>();

  const { data, isFetching } = useFetchFormModalType();
  const {
    data: startingPoints,
    isLoading: loadingStartingPoints,
    isError: startingPointsError,
    refetch: reloadStartingPoints,
  } = useFormStartingPoints();
  const selectedPreset = startingPoints?.presets.find(
    (preset) => preset.id === startingPoint,
  );

  useEffect(() => {
    if (data && !initialized.current) {
      initialized.current = true;
      const values: GenericValue = data?.reduce(
        (combined, current) => ({
          ...combined,
          [current.handle]: current.value,
        }),
        {},
      );

      if (currentSite) {
        values.sites = [currentSite.id];
      }

      setState(values);
    }
  }, [data, currentSite]);

  useEffect(() => {
    setState((prev: GenericValue) => ({
      ...prev,
      sites: currentSite ? [currentSite.id] : null,
    }));
  }, [currentSite]);

  const navigate = useNavigate();

  const chooseStartingPoint = (value: string) => {
    const preset = startingPoints?.presets.find(
      (preset) => preset.id === value,
    );
    setStartingPoint(value);
    setSubmitError("");
    setState((previous: GenericValue) => ({
      ...previous,
      name:
        !customName.current || !String(previous.name ?? "").trim()
          ? (preset?.label ?? "")
          : previous.name,
    }));
    setErrors(undefined);
  };

  useOnKeypress(
    {
      callback: (event: KeyboardEvent): void => {
        // Selecting a dropdown option with Enter must not also create the form.
        if (
          event.key === "Enter" &&
          !event.defaultPrevented &&
          event.target instanceof HTMLInputElement &&
          dialog.current?.contains(event.target) &&
          !dialog.current.querySelector(".open")
        )
          void handleSave();
      },
    },
    [state],
  );

  const handleSave = async (): Promise<void> => {
    if (saving.current || !data) return;
    setSubmitError("");
    if (!String(state.name ?? "").trim()) {
      setErrors({ name: [translate("Enter a name for your form.")] });
      return;
    }
    if (startingPoint && !selectedPreset) {
      setSubmitError(translate("Choose an available starting point."));
      return;
    }
    saving.current = true;
    setIsSaving(true);

    try {
      const input = { ...state };
      handleMiddleware(
        state.name,
        { camelize: true, transliterate: true, target: "" },
        undefined,
        (_, value) => {
          input.handle = value;
        },
      );
      input.handle = handleParser(input.handle);

      let form: Pick<Form, "id">;
      if (selectedPreset && startingPoints) {
        const draft: Omit<WizardDraft, "requestToken"> = {
          ...startingPoints.defaults,
          purpose: selectedPreset.id,
          name: String(state.name).trim(),
          type: typeof state.type === "string" ? state.type : undefined,
          siteIds:
            Array.isArray(state.sites) && state.sites.length
              ? state.sites.map(Number)
              : [currentSite?.id ?? config.sites.current],
          formattingTemplate:
            typeof state.formattingTemplate === "string"
              ? state.formattingTemplate
              : startingPoints.defaults.formattingTemplate,
          storeData:
            typeof state.storeData === "boolean"
              ? state.storeData
              : startingPoints.defaults.storeData,
          fields: selectedPreset.fields,
          adminEnabled: false,
          adminEmail: "",
          adminTemplate: "",
          adminNewTemplate: false,
          confirmationEnabled: false,
          confirmationField: "",
          confirmationTemplate: "",
          confirmationNewTemplate: false,
        };
        const fingerprint = JSON.stringify(draft);
        if (request.current.fingerprint !== fingerprint)
          request.current = { fingerprint, token: crypto.randomUUID() };
        ({ data: form } = await axios.post<Pick<Form, "id">>(
          "/api/forms/wizard/create",
          { ...draft, requestToken: request.current.token },
        ));
      } else {
        ({ data: form } = await axios.post<Form>("/api/forms/modal", input));
      }
      setErrors(undefined);

      navigate(`/forms/${form.id}`);

      closeModal();
    } catch (error) {
      setErrors(error.response?.data?.errors?.form ?? error.errors?.form);
      setSubmitError(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : translate("Could not create the form. Please try again."),
      );
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  return (
    <PortalProvider>
      <ModalContainer
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <FormCreationHeader>
          <span className="form-heading-icon" aria-hidden="true">
            <WizardIcon kind="blank" />
          </span>
          <h1 id={titleId}>{translate("Create a new Form")}</h1>
        </FormCreationHeader>

        <FormWrapper>
          {submitError && <ErrorBlock>{submitError}</ErrorBlock>}
          {!data && isFetching && <FormModalLoading />}
          {data && (
            <>
              <StartingPointPicker
                value={startingPoint}
                presets={startingPoints?.presets ?? []}
                loading={loadingStartingPoints}
                disabled={isSaving}
                onChange={chooseStartingPoint}
              />
              {startingPointsError && (
                <p role="status">
                  {translate(
                    "Starting points could not be loaded. You can still create a blank form.",
                  )}{" "}
                  <button
                    type="button"
                    className="btn"
                    onClick={() => void reloadStartingPoints()}
                  >
                    {translate("Try again")}
                  </button>
                </p>
              )}
            </>
          )}
          {data?.map((property, idx) => (
            <FormComponent
              key={property.handle}
              updateValue={(value) => {
                if (property.handle === "name")
                  customName.current = !!String(value ?? "").trim();
                setSubmitError("");
                setErrors((previous: GenericValue) => ({
                  ...previous,
                  [property.handle]: undefined,
                }));
                setState((previous: GenericValue) => ({
                  ...previous,
                  [property.handle]: value,
                }));
              }}
              autoFocus={idx === 0}
              value={state?.[property.handle]}
              property={property}
              errors={errors?.[property.handle] as unknown as string[]}
            />
          ))}
        </FormWrapper>

        <ModalFooter>
          <button type="button" className="btn cancel" onClick={closeModal}>
            {translate("Close")}
          </button>
          <button
            type="button"
            className="btn submit"
            disabled={isSaving || !data}
            onClick={handleSave}
          >
            <LoadingText
              loadingText={translate("Creating form…")}
              loading={isSaving}
              spinner
            >
              {translate("Create form")}
            </LoadingText>
          </button>
        </ModalFooter>
      </ModalContainer>
    </PortalProvider>
  );
};
