import { scrollBar } from '@ff-client/styles/mixins';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

interface GroupItemWrapperProps {
  $empty: string;
  color?: string;
}

interface EmptyProps {
  $empty: string;
}

export const ManagerWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  background: var(--gray-050);
  height: 600px;
`;

export const GroupLayout = styled.div`
  position: relative;
  background-color: ${colors.white};
  padding: ${spacings.md};
  border-radius: ${borderRadius.md};
  border: 1px solid ${colors.hairline};
  gap: ${spacings.md};
`;

export const GroupWrapper = styled.div<EmptyProps>`
  padding: 25px ${spacings.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
  }
`;

GroupWrapper.defaultProps = {
  $empty: "Click the 'Add Group' button on the right to begin.",
};

export const GroupHeader = styled.div`
  display: flex;
  padding-bottom: ${spacings.lg};
  gap: ${spacings.lg};
`;

export const GroupItemWrapper = styled.div<GroupItemWrapperProps>`
  display: grid;
  gap: 6px;
  grid-template-columns: 1fr 1fr;
  border-radius: ${borderRadius.md};

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
  $empty: 'Drag and drop any field here',
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
  ${scrollBar};
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
  $empty: 'Drag and drop any field here',
};

export const UnassignedGroupWrapper = styled.div`
  padding-top: ${spacings.lg};

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
