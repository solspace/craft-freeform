import { scrollBar } from "@ff-client/styles/mixins";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

interface GroupItemWrapperProps {
  $empty: string;
  color?: string;
}

interface EmptyProps {
  $empty: string;
}

export const ManagerWrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  background: var(--gray-050, #f3f7fc);
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @container (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

export const GroupLayout = styled.div`
  position: relative;
  background-color: ${colors.white};
  padding: ${spacings.md};
  border-radius: ${borderRadius.md};
  border: 1px solid ${colors.hairline};
  gap: ${spacings.md};
`;

export const GroupColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
`;

export const GroupToolbar = styled.div`
  flex: 0 0 auto;
  padding: 25px ${spacings.lg} 0;
`;

export const GroupWrapper = styled.div<EmptyProps>`
  padding: ${spacings.md} ${spacings.lg} 25px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${spacings.md};
  overflow-x: hidden;
  overflow-y: auto;
  min-width: 0;
  min-height: 0;
  ${scrollBar};

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
  }
`;

GroupWrapper.defaultProps = {
  $empty: "Click 'Add Group' to begin.",
};

export const GroupHeader = styled.div`
  display: flex;
  padding-bottom: ${spacings.lg};
  gap: ${spacings.lg};
  padding-right: 24px;
  min-width: 0;
`;

export const GroupItemWrapper = styled.div<GroupItemWrapperProps>`
  display: grid;
  gap: 6px;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border-radius: ${borderRadius.md};

  @container (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
  }

  svg {
    fill: ${({ color }) => color || colors.black};
  }

  .remove {
    svg {
      fill: ${colors.black} !important;
    }
  }
`;

GroupItemWrapper.defaultProps = {
  $empty: "Drag forms here.",
  color: colors.black,
};

export const CloseAndMoveWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
  position: absolute;
  top: 10px;
  right: 10px;
`;

export const GroupListWrapper = styled.div`
  padding: 25px ${spacings.lg};

  overflow-x: hidden;
  overflow-y: auto;
  min-width: 0;
  min-height: 0;
  border-left: 1px solid ${colors.hairline};
  ${scrollBar};

  @container (max-width: 640px) {
    border-left: 0;
    border-top: 1px solid ${colors.hairline};
  }
`;

export const Groups = styled.div<EmptyProps>`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
  }
`;

Groups.defaultProps = {
  $empty: "Drag forms here.",
};

export const UnassignedGroupWrapper = styled.div`
  > .unassigned {
    .remove {
      display: none;
    }
  }
`;

export const UnassignedGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
  padding: ${spacings.xs} ${spacings.xs} ${spacings.xs} ${spacings.md};
`;

export const ErrorBlock = styled.div`
  color: ${colors.warning};
`;
