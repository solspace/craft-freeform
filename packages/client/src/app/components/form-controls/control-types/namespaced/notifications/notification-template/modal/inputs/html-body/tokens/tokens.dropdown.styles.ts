import { labelText, scrollBar } from '@ff-client/styles/mixins';
import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const TokenDropdownWrapper = styled.div`
  position: absolute;
  z-index: 1000;
  left: 200px;
  top: 200px;

  display: flex;
  flex-direction: column;
  gap: 0;

  width: 300px;
  max-height: 300px;
  overflow: hidden;

  background-color: ${colors.white};
  color: black;

  border: 1px solid ${colors.hairline};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export const Title = styled.h3`
  background: ${colors.gray100};

  padding: 8px 8px;
  margin: 0;

  ${labelText};
  color: ${colors.gray600};
  font-size: 11px;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};

  padding: ${spacings.xs} ${spacings.sm};

  overflow-y: auto;
  ${scrollBar};
`;
