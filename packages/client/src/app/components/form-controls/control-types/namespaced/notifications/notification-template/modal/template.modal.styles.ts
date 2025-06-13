import { ModalContainer } from '@components/modals/modal.styles';
import { scrollBar } from '@ff-client/styles/mixins';
import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Container = styled(ModalContainer)`
  display: grid;
  grid-template-rows: min-content min-content 70vh min-content;

  max-width: 70vw;
  min-width: 600px;
`;

export const ModalContent = styled.div`
  padding: 1rem 2rem;

  overflow-y: auto;
  ${scrollBar};
`;

export const TabList = styled.ul`
  display: flex;

  padding: 0 9px;

  border-bottom: 1px solid ${colors.hairline};
  box-shadow: 0 1px 5px #cdd8e440;

  list-style: none;
`;

export const TabListItem = styled.li`
  position: relative;
  cursor: pointer;

  display: inline-block;

  padding: 14px 15px 12px;

  color: #7e8fa0;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  text-decoration: none;

  outline: none;
  box-shadow: none;
  --focus-ring: inset 0 0 0 0px #fff, inset 0 0 0 2px #0d99f2;

  &.active {
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 15px;
      right: 0;

      width: calc(100% - 30px);
      height: 2px;

      background-color: #0d99f2;
    }
  }

  &.errors {
    color: ${colors.error};
  }
`;

export const TabContent = styled.div`
  display: none;

  &.active {
    display: block;
  }
`;

export const Row = styled.div`
  display: flex;
  gap: 1rem;

  > div {
    flex: 1 0;
    padding: 0.5rem 0;
  }
`;
