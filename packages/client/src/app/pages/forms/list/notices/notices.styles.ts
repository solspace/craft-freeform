import { borderRadius, spacings } from '@ff-client/styles/variables';
import styled, { css } from 'styled-components';

export const NoticesList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-bottom: ${spacings.lg};
`;

export const Icon = styled.div`
  font-size: 26px;
`;

export const Message = styled.p`
  flex: 1;

  margin: 0;
  padding: 3px 0 0;
`;

export const CloseButton = styled.button`
  align-self: center;
`;

const map = [
  { type: 'new', accent: '#038052' },
  { type: 'info', accent: '#007bff' },
  { type: 'warning', accent: '#e87b00' },
  { type: 'error', accent: '#cf1324' },
];

let accentStyle = '';
map.forEach(({ type, accent }) => {
  accentStyle += `
    &[data-type='${type}'] {
      fill: ${accent};
      color: ${accent};
      border-color: ${accent};
    }
  `;
});

const accentCss = css`
  ${accentStyle}
`;

export const NoticeItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;

  padding: ${spacings.sm} ${spacings.md};

  border: 1px solid #ccc;
  border-radius: ${borderRadius.lg};

  ${accentCss};

  &[data-type='error'] {
    background-color: #ffe3e4;
  }
`;
