import styled from 'styled-components';

export const List = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s);

  margin: 0;
  padding: 0;
`;

export const ListItem = styled.li`
  cursor: pointer;

  display: flex;
  gap: var(--s);
  align-items: center;

  height: 32px;

  padding: 5px;
  overflow: hidden;

  background: #fff;
  border: 1px solid #cbd5e0;

  font-size: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
`;

export const FieldName = styled.span`
  flex: 1;
  line-height: 12px;
`;

export const Icon = styled.div`
  display: block;
  flex-basis: 24px;
  height: 24px;

  color: #cbd5e0;
`;
