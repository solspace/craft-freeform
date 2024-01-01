import { SketchPicker } from 'react-color';
import { scrollBar } from '@ff-client/styles/mixins';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

interface GroupItemWrapperProps {
  $empty: string;
  color?: string;
}

interface FieldTypesProps {
  $empty: string;
}

export const ManagerWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--gray-050);
  height: 600px;
`;

export const GroupWrapper = styled.div`
  padding: 25px ${spacings.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};
`;

export const GroupLayout = styled.div`
  position: relative;
  background-color: ${colors.white};
  padding: ${spacings.md};
  border-radius: ${borderRadius.md};
  border: 1px solid ${colors.hairline};

  display: flex;
  gap: ${spacings.md};
`;

export const GroupType = styled.div`
  flex: 1;
`;

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

export const GroupField = styled.div``;

export const CloseAndMoveWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
`;

export const FieldListWrapper = styled.div`
  padding: 25px ${spacings.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${scrollBar};
`;

export const FieldTypes = styled.div<FieldTypesProps>`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};

  &:empty::before {
    content: ${({ $empty }) => `"${$empty}"`};
    display: block;
  }
`;

FieldTypes.defaultProps = {
  $empty: 'Drag and drop any field here',
};

export const UHFieldWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacings.xl};

  padding-top: ${spacings.lg};

  > .unassigned {
    .remove {
      display: none;
    }
  }
`;

export const UHField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
  padding: ${spacings.xs} ${spacings.xs} ${spacings.xs} ${spacings.md};
`;

export const Icon = styled.div`
  font-size: 10px;

  &,
  svg {
    height: 20px;
    width: 20px;
  }
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
`;

export const ColorCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  background-color: ${({ color }) => color || colors.black};
`;

export const ColorPickerContainer = styled.div`
  position: fixed;
`;

export const ColorPicker = styled(SketchPicker)`
  position: absolute;
  left: -240px;
  top: -25px;

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 0 8px 12px;
    border-color: transparent transparent transparent white;
    right: -10px;
    top: 35px;
    transform: translateY(-50%);
  }
`;
