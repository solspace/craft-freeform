import { ModalContainer, ModalHeader } from "@components/modals/modal.styles";
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

export const AiFormHeader = styled(ModalHeader)`
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(120deg, #e4edf6, #edf3fa);
  h1 { margin: 0; }
  p { margin: 5px 0 0; color: #617488; font-size: 12px; line-height: 1.5; }
  .ai-intro-icon { display: grid; place-items: center; flex: none; width: 42px; height: 42px; border: 1px solid #c5d8ed; border-radius: 12px; background: #f6faff; color: #386fa8; box-shadow: 0 2px 5px #376fa80b; }
  svg { width: 26px; height: 26px; }
`;

export const AiFormWrapper = styled(FormWrapper)`
  min-height: 0;
  overflow-y: auto;
  .ai-configured-model { margin: 7px 0 0; color: #667582; font-size: 11px; }
`;

export const PromptExamples = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  > span { margin-right: 3px; color: #667582; font-size: 11px; }
  .btn { min-height: 0; padding: 4px 9px; border: 1px solid #d4dfeb; border-radius: 20px; background: #f4f7fb; color: #476582; font-size: 11px; line-height: 1.5; box-shadow: none; }
  .btn:hover { border-color: #a3c4e7; background: #eaf3fd; color: #1f5f9e; }
  .btn:focus-visible { outline: 2px solid #5b94d6; outline-offset: 2px; }
`;

export const ReferenceUpload = styled.div<{ $dragging: boolean }>`
  position: relative;
  border: 1px dashed ${({ $dragging }) => ($dragging ? "var(--link-color, #1f5fea)" : "#b8cce1")};
  border-radius: 8px;
  padding: 18px;
  background: ${({ $dragging }) => ($dragging ? "#eaf3ff" : "linear-gradient(135deg, #f7faff, #f3f7fc)")};
  transition: background-color .15s ease, border-color .15s ease;
  .reference-picker { display: flex; align-items: center; gap: 12px; }
  .reference-symbol { display: grid; place-items: center; flex: none; width: 38px; height: 44px; border: 1px solid #d2e0ef; border-radius: 7px; color: #648db7; background: #fff; }
  .reference-symbol svg { width: 24px; height: 28px; }
  .reference-copy { flex: 1; min-width: 0; }
  label { display: block; margin: 0; font-weight: 600; }
  .reference-browse { flex: none; padding: 7px 11px; font-size: 12px; }
  .reference-input { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  p { margin: 8px 0 0; color: #667582; font-size: 11px; line-height: 1.5; }
  .reference-copy p { margin: 3px 0 0; font-size: 12px; }
  .reference-note { padding-top: 10px; border-top: 1px solid #dce6f0; }
  @media (max-width: 480px) {
    .reference-picker { flex-wrap: wrap; }
    .reference-browse { width: 100%; }
  }
`;
export const ReferenceFiles = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  li { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 7px 8px; border: 1px solid #dce6f0; border-radius: 5px; background: #fff; }
  .reference-file-type { flex: none; padding: 4px; border-radius: 4px; color: #57799c; background: #edf3fa; font-size: 9px; font-weight: 600; }
  .reference-name { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13px; }
  .reference-size { color: #667582; font-size: 12px; white-space: nowrap; }
  .btn { flex: none; padding: 5px 7px; min-height: 26px; }
`;

export const AiFormFields = styled.div<{ $collapsed: boolean }>`
  display: grid;
  grid-template-rows: ${({ $collapsed }) => ($collapsed ? "0fr" : "1fr")};
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  filter: ${({ $collapsed }) => ($collapsed ? "grayscale(1)" : "none")};
  transform: ${({ $collapsed }) => ($collapsed ? "scale(.98)" : "scale(1)")};
  transform-origin: top center;
  transition: grid-template-rows .35s ease, opacity .2s ease, transform .35s ease;
  pointer-events: ${({ $collapsed }) => ($collapsed ? "none" : "auto")};

  > div { min-height: 0; overflow: hidden; }
  fieldset {
    display: flex;
    flex-direction: column;
    gap: ${spacings.lg};
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

export const GenerationSummary = styled.div`
  padding: 24px;
  border: 1px solid #d7e2ed;
  border-radius: 8px;
  background: #f8fafc;
  animation: generation-reveal .3s ease both;

  .generation-heading { display: flex; align-items: flex-start; gap: 16px; }
  h2 { margin: 0 0 8px; font-size: 18px; line-height: 1.4; }
  p { margin: 0; color: #596b7c; font-size: 13px; line-height: 1.6; }
  .generation-duration-hint { margin-bottom: 8px; color: #3f4d5a; font-weight: 500; }
  dl { display: grid; gap: 12px; margin: 20px 0 0; padding: 16px 0 0; border-top: 1px solid #dfe7ef; }
  dl > div { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 12px; }
  dt { color: #667582; font-size: 12px; }
  dd { margin: 0; overflow-wrap: anywhere; font-size: 13px; font-weight: 500; }
  .generation-model { display: block; margin-top: 3px; font-size: 12px; font-weight: 400; color: #667582; }
  .generation-file { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .generation-activity { height: 3px; margin-top: 24px; overflow: hidden; border-radius: 3px; background: #dce9f7; }
  .generation-activity span { display: block; width: 35%; height: 100%; border-radius: inherit; background: #5b94d6; animation: generation-activity 2s ease-in-out infinite; }

  @keyframes generation-reveal { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes generation-activity { from { transform: translateX(-110%); } to { transform: translateX(390%); } }

  @media (max-width: 480px) { padding: 16px; dl > div { grid-template-columns: 1fr; gap: 4px; } }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    .generation-activity span { animation: none; width: 100%; opacity: .55; }
  }
`;

export const GenerationMark = styled.div<{
  $complete: boolean;
  $active: boolean;
}>`
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ $complete }) => ($complete ? "#e8f5ed" : "#eaf2fc")};
  color: ${({ $complete }) => ($complete ? "#25854a" : "#326fad")};
  svg { width: 24px; height: 24px; }
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border: 2px solid ${({ $complete }) => ($complete ? "#b5ddc4" : "#c9ddf4")};
    border-top-color: ${({ $complete }) => ($complete ? "#b5ddc4" : "#5b94d6")};
    border-radius: 50%;
    animation: ${({ $active }) => ($active ? "generation-turn 1.4s linear infinite" : "none")};
  }
  @keyframes generation-turn { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { &::before { animation: none; } }
`;
