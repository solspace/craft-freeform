import { easings } from '@ff-app/welcome-screen/shared/styles/animations';
import styled from 'styled-components';

export const Wrapper = styled.div``;

export const ProgressItem = styled.div`
  display: flex;
  justify-content: center;

  margin: 0 0 20px;
`;

interface TickInterface {
  ticked?: boolean;
}
export const Tick = styled.div<TickInterface>`
  padding: 5px;
  margin-bottom: 0 !important;

  line-height: 10px;
  border-radius: 20px;

  background-color: ${({ ticked }: TickInterface): string => (ticked ? '#58a785' : '#CCC')};
  transition: background-color 1s ${easings.out.default};

  &:before {
    display: block;
    content: 'check';
    color: #ffffff;

    opacity: 1;
    text-align: center;
    user-select: none;

    font-family: 'Craft';
    font-feature-settings: 'liga', 'dlig';
    line-height: 1;
  }
`;

export const Label = styled.div`
  width: 320px;
  padding-left: 20px;
  text-align: left;
`;

export const Finished = styled.div`
  margin: 70px 0 0;

  font-size: 20px;
  font-weight: bold;

  transition: opacity 2s ${easings.out.default};

  &.enter {
    opacity: 0;

    &-active,
    &-done {
      opacity: 1;
    }
  }
`;
