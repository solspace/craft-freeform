import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FormSettingsWrapper = styled.div`
  display: flex;
  height: 100%;
  background: ${colors.white};
`;

export const FormSettingsContainer = styled.div`
  width: calc(100% - 300px);

  padding: ${spacings.lg};
`;

export const GroupsCollection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};
`;
