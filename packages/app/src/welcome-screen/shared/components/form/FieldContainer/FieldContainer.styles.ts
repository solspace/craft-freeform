import styled from 'styled-components';

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto 200px;
  grid-template-areas:
    'description input'
    'spacer spacer';

  column-gap: 40px;
  align-items: center;

  max-height: 82px;

  transition: all 300ms ease-out;

  &.animation {
    &-enter {
      overflow: hidden;
      max-height: 0px;

      &-active {
        max-height: 82px;
      }
    }

    &-exit {
      overflow: hidden;
      &-active {
        max-height: 0px;
      }
    }
  }

  &:not(:last-child):after {
    grid-area: spacer;
    content: '';
    display: block;
    margin: 10px -30px;

    height: 1px;
    overflow: hidden;
    font-size: 0px;
    line-height: 0px;

    background: rgba(51, 64, 77, 0.1);
  }
`;
