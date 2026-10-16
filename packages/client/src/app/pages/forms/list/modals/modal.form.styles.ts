import { ModalContainer } from "@components/modals/modal.styles";
import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};

  padding: ${spacings.md} ${spacings.xl};
`;

export const AiFormContainer = styled(ModalContainer)`
  display: flex;
  flex-direction: column;
  width: calc(100% - 48px);
  min-width: 0;
  max-width: 640px;
  max-height: calc(100dvh - 48px);
  margin: 24px;
  > header, > footer { flex: none; }
`;

export const AiFormWrapper = styled(FormWrapper)`
  min-height: 0;
  overflow-y: auto;
`;

export const ReferenceUpload = styled.div<{ $dragging: boolean }>`
  border: 1px dashed ${({ $dragging }) => ($dragging ? "var(--link-color, #1f5fea)" : "#b8c5d2")};
  border-radius: 5px;
  padding: 16px;
  background: ${({ $dragging }) => ($dragging ? "#edf5ff" : "#f8fafc")};
  transition: background-color .15s ease, border-color .15s ease;
  label { display: block; margin-bottom: 8px; font-weight: 600; }
  input { max-width: 100%; font: inherit; }
  p { margin: 8px 0 0; color: #667582; font-size: 12px; line-height: 1.5; }
`;
export const ReferenceFiles = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  li { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .reference-name { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13px; }
  .reference-size { color: #667582; font-size: 12px; white-space: nowrap; }
  .btn { flex: none; padding: 5px 7px; min-height: 26px; }
`;
