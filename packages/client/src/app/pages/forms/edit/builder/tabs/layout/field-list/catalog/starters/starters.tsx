import { useAppDispatch, useAppSelector } from "@editor/store";
import { addFormStarter } from "@editor/store/thunks/fields/starters";
import { WizardIcon } from "@ff-client/app/pages/forms/list/modals/wizard/wizard.icon";
import type { WizardOptions } from "@ff-client/app/pages/forms/list/modals/wizard/wizard.types";
import { useFetchFieldTypes } from "@ff-client/queries/field-types";
import { borderRadius, colors } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import styled from "styled-components";
import { CatalogPopover } from "../catalog-popover";

const startersIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2.5h8l3.5 3.5V17.5H4zM12 2.5V6h3.5M7 10h5M7 13h5"/><path d="M16.5 11v5m-2.5-2.5h5"/></svg>';

const StarterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const StarterButton = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 90px;
  width: 100%;
  padding: 12px;
  border: 1px solid ${colors.gray100};
  border-radius: ${borderRadius.md};
  background: ${colors.white};
  color: ${colors.gray700};
  text-align: left;
  cursor: pointer;
  &:hover { border-color: ${colors.gray400}; background: ${colors.gray050}; }
  &:focus-visible { outline: 2px solid ${colors.blue400}; outline-offset: 2px; }
  .starter-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    border-radius: ${borderRadius.sm};
    background: ${colors.gray050};
    color: ${colors.gray700};
  }
  .starter-icon svg { display: block; width: 20px; height: 20px; }
  .starter-copy { min-width: 0; }
  strong { display: block; font-size: 12px; line-height: 17px; }
  small { display: block; margin-top: 4px; color: ${colors.gray500}; font-size: 11px; line-height: 15px; }
`;

type Preset = WizardOptions["presets"][number];

const StarterContents = ({
  presets,
  close,
}: {
  presets: Preset[];
  close: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { data: types } = useFetchFieldTypes();
  const [message, setMessage] = useState("");
  return (
    <>
      <StarterGrid>
        {presets.map((preset) => (
          <StarterButton
            key={preset.id}
            type="button"
            onClick={() => {
              if (types && dispatch(addFormStarter(preset.fields, types))) {
                close();
              } else {
                setMessage(
                  translate(
                    "This starter could not be added. Check that the Form area and its field types are available.",
                  ),
                );
              }
            }}
          >
            <span className="starter-icon">
              <WizardIcon kind={preset.id} />
            </span>
            <span className="starter-copy">
              <strong>{preset.label}</strong>
              <small>{preset.description}</small>
            </span>
          </StarterButton>
        ))}
      </StarterGrid>
      {message && <p role="alert">{message}</p>}
      <p>{translate("Click a starter to add its fields to the Form area.")}</p>
    </>
  );
};

export const FormStarterCatalog = ({ query }: { query: string }) => {
  const formId = useAppSelector((state) => state.form.id);
  const { data } = useQuery({
    queryKey: ["form-starters", formId],
    queryFn: ({ signal }) =>
      axios
        .get<{ presets: Preset[] }>(`/api/forms/${formId}/starters`, { signal })
        .then((response) => response.data.presets),
    enabled: !!formId,
    staleTime: Infinity,
  });
  const presets = data?.filter((preset) =>
    `${preset.label} ${preset.description} form starters`
      .toLowerCase()
      .includes(query),
  );
  if (!presets?.length) return null;
  return (
    <CatalogPopover name="Form Starters" icon={startersIcon} wide>
      {(close) => <StarterContents presets={presets} close={close} />}
    </CatalogPopover>
  );
};
