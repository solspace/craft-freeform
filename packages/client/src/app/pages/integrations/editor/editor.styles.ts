import { scrollBar } from '@ff-client/styles/mixins';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: ${spacings.xl};

  height: 100%;
  overflow-y: auto;

  ${scrollBar};

  hr {
    margin: 0;
    margin-inline: calc(var(--xl) * -1);
  }
`;
