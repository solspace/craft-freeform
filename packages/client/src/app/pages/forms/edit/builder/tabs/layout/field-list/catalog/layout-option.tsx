import { useAppDispatch } from "@editor/store";
import { fieldThunks } from "@editor/store/thunks/fields";
import { colors } from "@ff-client/styles/variables";
import type { FieldType } from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useCallback } from "react";
import styled from "styled-components";
import { useBaseFieldDrag } from "../implementations/base-fields/field-item.drag";

const Card = styled.button`
  display: flex; flex-direction: column; align-items: stretch; gap: 7px;
  width: 100%; height: 100%; padding: 12px; border: 1px solid ${colors.gray100}; border-radius: 4px;
  background: ${colors.white}; color: ${colors.gray700}; text-align: left; cursor: pointer;
  strong { font-size: 12px; line-height: 18px; }
  small { color: ${colors.gray500}; font-size: 11px; line-height: 16px; }
  &:hover { background: ${colors.gray050}; border-color: ${colors.gray300}; }
  &:focus-visible { outline: none; box-shadow: var(--focus-ring); }
`;
const Diagram = styled.div<{ $widths: string }>`
  display: grid; grid-template-columns: ${({ $widths }) => $widths}; gap: 5px;
  height: 48px; margin-bottom: 2px;
  > span { min-width: 0; border: 1px solid #8aa2b8; border-radius: 3px; background: #e8eff6; }
  &[data-group='true'] > span { border-style: dashed; background: transparent; }
`;

export const LayoutOption: React.FC<{
  fieldType: FieldType;
  description: string;
  widths?: string;
  count?: number;
  close: () => void;
}> = ({ fieldType, description, widths = "1fr", count = 1, close }) => {
  const dispatch = useAppDispatch();
  const { ref } = useBaseFieldDrag(fieldType);
  const connect = useCallback(
    (element: HTMLButtonElement | null) => {
      ref(element);
    },
    [ref],
  );
  return (
    <Card
      type="button"
      ref={connect}
      onClick={() => {
        dispatch(fieldThunks.move.newField.newRow({ fieldType }));
        close();
      }}
    >
      <Diagram
        $widths={widths}
        data-group={fieldType.type === "group"}
        aria-hidden="true"
      >
        {Array.from({ length: count }, (_, index) => (
          <span key={index} />
        ))}
      </Diagram>
      <strong>{translate(fieldType.name)}</strong>
      <small>{translate(description)}</small>
    </Card>
  );
};
