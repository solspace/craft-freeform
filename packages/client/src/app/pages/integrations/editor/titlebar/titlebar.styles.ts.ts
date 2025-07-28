import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  > span {
    font-size: 20px;
    font-weight: bold;
    color: #414141;
  }
`;

export const VersionString = styled.small`
  margin-top: 6px;

  font-size: 12px;
  font-weight: normal;
  font-family: monospace;
  color: ${colors.gray300};
`;

export const Icon = styled.div`
  svg {
    width: 30px;
    height: 30px;
  }

  &.spinning {
    animation: spin 2s linear infinite;
    fill: ${colors.gray300};
  }
`;

export const AuthChecker = styled.div`
  display: grid;
  grid-template-columns: min-content auto;
  grid-template-rows: auto;

  align-items: center;
  gap: 10px;
`;

export const Dot = styled.div`
  flex: 0 0 10px;

  display: block;
  width: 10px;
  height: 10px;

  border-radius: 10px;
`;

export const MessageBox = styled.div`
  flex: 1;
  white-space: nowrap;
`;

export const Indicator = styled.div`
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 5px;

  width: fit-content;
  padding: 3px 8px;

  border-radius: 100px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;

  &.authorized {
    background-color: rgba(34, 197, 94, 0.2);

    ${Dot} {
      background: #27ae60;
      border: 1px solid #27ae60;
    }
  }

  &.unauthorized {
    background-color: rgba(51, 197, 255, 0.2);

    ${Dot} {
      background: rgba(51, 197, 255, 1);
      border: 1px solid rgba(51, 197, 255, 1);
    }
  }

  &.pending {
    background-color: rgba(55, 65, 81, 0.05);

    ${Dot} {
      background: #ccd1d6;
      border: 1px solid #ccd1d6;
    }
  }

  &.error {
    background-color: rgba(239, 68, 68, 0.2);

    ${Dot} {
      background: #d0021b;
      border: 1px solid #d0021b;
    }
  }
`;

export const RemoveButtonWrapper = styled.div`
  margin-left: auto;

  > button,
  svg {
    width: 30px;
    height: 30px;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 5px;
`;

export const Action = styled.a`
  align-items: center;
  gap: 5px;

  font-size: 12px;

  i,
  svg {
    font-size: 14px;
    width: 16px;
    height: 16px;
  }
`;

export const ErrorList = styled.ul`
  padding: 10px;

  border: 1px solid ${colors.red200};
  border-radius: 5px;

  background-color: ${colors.red100};

  color: ${colors.red600};
  font-size: 14px;
`;
