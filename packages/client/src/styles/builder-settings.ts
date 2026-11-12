import { DropdownWrapper } from "@components/elements/custom-dropdown/dropdown.styles";
import {
  ControlWrapper,
  FormField,
} from "@components/form-controls/control.styles";
import { DropdownContainer } from "@components/form-controls/control-types/dynamic-select/dynamic-select.styles";
import { css } from "styled-components";

export const builderSettingsDropdowns = css`
  container-type: inline-size;

  ${ControlWrapper} > ${FormField} > :is(${DropdownWrapper}, ${DropdownContainer}, .freeform-boolean-menu) {
    width: 50%;
    min-width: min(100%, 240px);
  }

  @container (max-width: 600px) {
    ${ControlWrapper} > ${FormField} > :is(${DropdownWrapper}, ${DropdownContainer}, .freeform-boolean-menu) {
      width: 100%;
    }
  }
`;
