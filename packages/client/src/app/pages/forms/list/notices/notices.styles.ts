import { borderRadius, spacings } from '@ff-client/styles/variables';
import styled, { css } from 'styled-components';

export const NoticesList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-bottom: ${spacings.lg};
`;

export const Icon = styled.div`
  font-size: 22px;
`;

export const Message = styled.p`
  flex: 1;

  margin: 0;
  padding: 1px 0 0;
`;

export const CloseButton = styled.button`
  align-self: center;
`;

const map = [
  { type: 'new', accent: '#038052', bg: 'transparent' },
  { type: 'info', accent: '#007bff', bg: 'transparent' },
  { type: 'warning', accent: '#e87b00', bg: 'transparent' },
  { type: 'critical', accent: '#cf1324', bg: '#fbe4e4' },
  { type: 'error', accent: '#cf1324', bg: 'transparent' },
  { type: 'log-list', accent: '#cf1324', bg: 'transparent' },
];

let accentStyle = '';
map.forEach(({ type, accent, bg }) => {
  accentStyle += `
    &[data-type='${type}'] {
      fill: ${accent};
      color: ${accent};
      border-color: ${accent};
      background-color: ${bg};

      a {
        color: ${accent};
        text-decoration: underline;
        font-weight: bold;
      }
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
