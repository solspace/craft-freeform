import { DuplicateButtonWrapper } from "@components/elements/duplicate-button/duplicate.styles";
import { RemoveButtonWrapper } from "@components/elements/remove-button/remove.styles";
import { animated } from "@react-spring/web";
import styled from "styled-components";

export const FieldTools = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 120ms ease-out, visibility 120ms ease-out;

  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

export const FieldWrapper = styled(animated.div)`
  position: relative;

  &,
  * {
    cursor: pointer;
  }

  &:hover > ${FieldTools},
  &:focus-within > ${FieldTools},
  &:has(> .active) > ${FieldTools} {
    opacity: 1;
    visibility: visible;
  }

  &:focus-visible {
    outline: 2px solid #5782ef;
    outline-offset: -2px;
    border-radius: 5px;
  }

  ${RemoveButtonWrapper}, ${DuplicateButtonWrapper} {
    position: static;
  }
`;
