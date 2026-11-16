import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const DatePickerWrapper = styled.div`
  position: relative;

  .react-datepicker__navigation {
    color: ${colors.muted};
    &:hover { color: ${colors.text}; }
  }
  .react-datepicker__navigation-icon {
    display: block;
    width: 8px;
    height: 8px;
    top: 0;
    left: 0;
    right: auto;
  }
  && .react-datepicker__navigation-icon::before {
    box-sizing: border-box;
    width: 8px;
    height: 8px;
    top: 0;
    left: 0;
    right: auto;
    border-width: 2px 2px 0 0;
    border-color: currentColor;
  }
  .react-datepicker__close-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    right: 6px;
    padding: 0;
    color: ${colors.text};
    &:focus-visible { box-shadow: var(--focus-ring); border-radius: 4px; }
  }
  .react-datepicker__close-icon::after {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    padding: 0;
    background: ${colors.gray300};
  }
  .react-datepicker__close-icon::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background:
      linear-gradient(45deg, transparent 42%, currentColor 42% 58%, transparent 58%),
      linear-gradient(-45deg, transparent 42%, currentColor 42% 58%, transparent 58%);
  }
  .react-datepicker__close-icon:hover::after { background: ${colors.gray200}; }
  .react-datepicker__day--today {
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px currentColor;
  }

  .react-datepicker-popper {
    z-index: 10;
  }

  .react-datepicker {
    font-family: inherit;
    background: ${colors.overlay};
    color: ${colors.text};
    border: 1px solid ${colors.gray200};
    border-radius: 5px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
  }

  .react-datepicker__day, .react-datepicker__day-name, .react-datepicker__current-month { color: ${colors.text}; }
  .react-datepicker__day--outside-month, .react-datepicker__day--disabled { color: ${colors.muted}; }
  .react-datepicker__day:hover { background: var(--bg-selection-light); }
  && .react-datepicker-popper .react-datepicker__triangle {
    fill: ${colors.gray050};
    stroke: ${colors.border};
    color: ${colors.gray050};
  }
  .react-datepicker__header {
    background: ${colors.gray050};
    border-bottom-color: ${colors.gray200};
  }

  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background: ${colors.blue500};
    color: white;
  }
`;

export const DateTimeRow = styled.div<{ $includeTime?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;

  ${({ $includeTime }) =>
    $includeTime &&
    `
    .date-input { width: 180px; max-width: 100%; }
    .react-datepicker-wrapper { width: 100%; }
    .react-datepicker__input-container input { padding-left: 32px; padding-right: 30px; min-height: 36px; }
    .react-datepicker__calendar-icon { padding: 10px 9px; fill: ${colors.gray400}; }
  `}
`;

export const TimeInput = styled.div`
  position: relative;
  width: 145px;
  max-width: 100%;

  && input[type='time'].text {
    width: 100%;
    min-height: 36px;
    padding: 7px 10px;
    box-sizing: border-box;
  }
`;

export const TimezoneNote = styled.div`
  margin-top: 6px;
  color: light-dark(${colors.gray400}, ${colors.muted});
  font-size: 12px;
`;

export const Icon = styled.div`
  position: absolute;
  left: 150px;
  top: 5px;

  z-index: 2;

  font-size: 16px;
  color: light-dark(${colors.gray400}, ${colors.muted});

  user-select: none;
  pointer-events: none;
`;
