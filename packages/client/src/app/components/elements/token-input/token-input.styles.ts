import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const TokenInputWrapper = styled.div`
  .tagify {
    --tag-bg: ${colors.gray100};
    --tag-pad: 4px 7px;

    width: 100%;
    min-height: 2.125rem;
    padding: 5px 5px;

    box-sizing: border-box;
    background-color: ${colors.white};

    border: 1px solid rgba(96, 125, 159, 0.25);
    border-radius: ${borderRadius.md};

    gap: 5px;

    &__tag {
      margin-inline: 0;
      margin-block: 0;
    }

    &__input {
      margin: 0;
      min-width: 1px !important;
    }
  }
`;
