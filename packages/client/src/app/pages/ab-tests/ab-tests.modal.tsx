import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { Control } from "@components/form-controls/control";
import DatePickerControl from "@components/form-controls/control-types/date-picker/date-picker";
import StringInput from "@components/form-controls/control-types/string/string";
import Textarea from "@components/form-controls/control-types/textarea/textarea";
import { LoadingText } from "@components/loaders/loading-text/loading-text";
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from "@components/modals/modal.styles";
import type { ModalContainerProps } from "@components/modals/modal.types";
import { useQueryFormsWithStats } from "@ff-client/queries/forms";
import { PropertyType } from "@ff-client/types/properties";
import { notifications } from "@ff-client/utils/notifications";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useMemo, useState } from "react";
import { v4 } from "uuid";

import { generateABTestHandle } from "./ab-tests.operations";
import { useAbTestUpsertMutation } from "./ab-tests.queries";
import { DateRow, ModalBody } from "./ab-tests.styles";
import type { ABTestWithVariants } from "./ab-tests.types";

type ModalData = {
  test?: ABTestWithVariants;
};

const getInitialState = (test?: ABTestWithVariants): ABTestWithVariants => ({
  id: test?.id,
  name: test?.name || "",
  handle: test?.handle || "",
  description: test?.description || "",
  startDate: test?.startDate || null,
  endDate: test?.endDate || null,
  variants: test?.variants || [],
});

export const ABTestModal: React.FC<ModalContainerProps<ModalData>> = ({
  closeModal,
  data,
}) => {
  const initial = data?.test;
  const [state, setState] = useState<ABTestWithVariants>(
    getInitialState(initial),
  );
  const [handleManuallyEdited, setHandleManuallyEdited] = useState<boolean>(
    !!initial?.handle && initial.handle !== generateABTestHandle(initial.name),
  );
  const { data: forms } = useQueryFormsWithStats();
  const mutation = useAbTestUpsertMutation(initial?.id);

  const formOptions = useMemo(
    () => (forms || []).map((form) => ({ id: form.id, name: form.name })),
    [forms],
  );

  const canSave =
    state.name.trim().length > 0 &&
    state.handle?.trim().length > 0 &&
    state.variants.length > 0 &&
    state.variants.every((variant) => !!variant.formId);

  return (
    <ModalContainer style={{ maxWidth: "860px" }}>
      <ModalHeader>
        <h1>
          {initial?.id
            ? translate("Edit A/B Test")
            : translate("Create A/B Test")}
        </h1>
      </ModalHeader>

      <ModalBody>
        <StringInput
          value={state.name}
          updateValue={(value) => {
            setState((prev) => ({
              ...prev,
              name: value,
              handle: handleManuallyEdited
                ? prev.handle
                : generateABTestHandle(value),
            }));
          }}
          property={{
            type: PropertyType.String,
            handle: "name",
            label: translate("Name"),
          }}
        />

        <StringInput
          value={state.handle || ""}
          updateValue={(value) => {
            setHandleManuallyEdited(true);
            setState((prev) => ({
              ...prev,
              handle: generateABTestHandle(value),
            }));
          }}
          property={{
            type: PropertyType.String,
            handle: "handle",
            label: translate("Handle"),
          }}
        />

        <Textarea
          value={state.description || ""}
          updateValue={(value) =>
            setState((prev) => ({ ...prev, description: value }))
          }
          property={{
            type: PropertyType.Textarea,
            handle: "description",
            label: translate("Description"),
            rows: 3,
          }}
        />

        <DateRow>
          <DatePickerControl
            value={state.startDate || null}
            updateValue={(value) =>
              setState((prev) => ({
                ...prev,
                startDate: value as string | null,
              }))
            }
            property={{
              type: PropertyType.DateTime,
              handle: "startDate",
              label: translate("Start Date"),
              dateFormat: "yyyy-MM-dd",
            }}
          />
          <DatePickerControl
            value={state.endDate || null}
            updateValue={(value) =>
              setState((prev) => ({ ...prev, endDate: value as string | null }))
            }
            property={{
              type: PropertyType.DateTime,
              handle: "endDate",
              label: translate("End Date"),
              dateFormat: "yyyy-MM-dd",
            }}
          />
        </DateRow>

        <Control label="Variants">
          <div>
            <table className="table editable fullwidth">
              <thead>
                <tr>
                  <th>{translate("Form")}</th>
                  <th>{translate("Weight")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {state.variants.map((variant, index) => (
                  <tr key={variant.id || index}>
                    <td>
                      <Dropdown
                        emptyOption="Select form..."
                        value={variant.formId?.toString() || ""}
                        onChange={(value) => {
                          const formId = Number(value);
                          setState((prev) => ({
                            ...prev,
                            variants: prev.variants.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, formId } : item,
                            ),
                          }));
                        }}
                        options={formOptions.map((form) => ({
                          label: form.name,
                          value: form.id.toString(),
                        }))}
                      />
                    </td>
                    <td className="singleline-cell textual thin weight">
                      <input
                        className="text fullwidth"
                        type="number"
                        min={0}
                        value={variant.weight}
                        onChange={(event) => {
                          const weight = Number(event.target.value);
                          setState((prev) => ({
                            ...prev,
                            variants: prev.variants.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, weight } : item,
                            ),
                          }));
                        }}
                      />
                    </td>
                    <td className="thin action">
                      <button
                        type="button"
                        title={translate("Delete")}
                        className="delete icon"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            variants: prev.variants.filter(
                              (_, idx) => idx !== index,
                            ),
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              className="btn dashed add icon"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  variants: [
                    ...prev.variants,
                    { id: v4(), formId: undefined, weight: 50 },
                  ],
                }))
              }
            >
              {translate("Add Variant")}
            </button>
          </div>
        </Control>
      </ModalBody>

      <ModalFooter>
        <button type="button" className="btn cancel" onClick={closeModal}>
          {translate("Cancel")}
        </button>
        <button type="button" className="btn submit" disabled={!canSave}>
          <LoadingText
            loading={mutation.isPending}
            loadingText={translate("Saving...")}
            spinner
            onClick={() =>
              mutation.mutate(state, {
                onSuccess: () => {
                  notifications.success(
                    translate("A/B Test Group saved successfully."),
                  );
                  closeModal();
                },
              })
            }
          >
            {translate("Save")}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
