import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const DatePickerWrapper = styled.div`
  position: relative;

  .react-datepicker__navigation-icon {
    top: 4px;
  }

  .react-datepicker-popper {
    z-index: 10;
  }

  .react-datepicker {
    font-family: inherit;
    border: 1px solid ${colors.gray200};
    border-radius: 5px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
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
    .react-datepicker-wrapper { width: 180px; max-width: 100%; }
    .react-datepicker__input-container input { padding-left: 32px; min-height: 36px; }
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
  color: ${colors.gray400};
  font-size: 12px;
`;

export const Icon = styled.div`
  position: absolute;
  left: 150px;
  top: 5px;

  z-index: 2;

  font-size: 16px;
  color: ${colors.gray400};

  user-select: none;
  pointer-events: none;
`;
