import { colors } from "@ff-client/styles/variables";
import translate from "@ff-client/utils/translations";
import { type InputHTMLAttributes, useId } from "react";
import styled from "styled-components";

const MeasurementInput = styled.div<{ $unitSpace: number }>`
  position: relative;
  width: 100%;
  min-width: 0;

  input.text {
    width: 100%;
    box-sizing: border-box;
    padding-inline-end: ${({ $unitSpace }) => $unitSpace}px;
    appearance: textfield;
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button {
      appearance: none;
      margin: 0;
    }
  }

  > span {
    position: absolute;
    inset-inline-end: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.gray400};
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
  }
`;

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  unit?: string;
};

export const NumberInput = ({ unit, ...props }: Props) => {
  const unitId = useId();
  const text = unit ? translate(unit) : "";
  const input = (
    <input
      {...props}
      type="number"
      aria-describedby={
        [props["aria-describedby"], text ? unitId : undefined]
          .filter(Boolean)
          .join(" ") || undefined
      }
    />
  );

  return text ? (
    <MeasurementInput $unitSpace={Math.max(38, text.length * 7 + 24)}>
      {input}
      <span id={unitId}>{text}</span>
    </MeasurementInput>
  ) : (
    input
  );
};
