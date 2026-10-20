import { ModalContainer } from "@components/modals/modal.styles";
import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ConfirmationContainer = styled(ModalContainer)`
  width: calc(100% - 48px);
  max-height: calc(100dvh - 48px);
  margin: auto;
  padding: 0;
  border: 0;
  color: ${colors.gray700};
  overflow: auto;
  &::backdrop { background: rgba(123, 135, 147, .35); }
  h2 { margin: 0; font-size: 18px; }
`;
export const Message = styled.div`
  padding: 24px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  white-space: pre-line;
`;
export const ConfirmButton = styled.button.attrs<{ $destructive: boolean }>({
  type: "button",
  className: "btn submit confirm",
})``;
