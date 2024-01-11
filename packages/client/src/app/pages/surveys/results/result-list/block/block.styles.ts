import styled from 'styled-components';

import { SettingsButton } from './block.settings.styles';

export enum Icon {
  CheckboxGroup,
  RadioGroup,
  Select,
  MultiSelect,
  Text,
  Rating,
}

export const Wrapper = styled.li`
  display: grid;
  grid-template-columns: 42px auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    'bulletin label'
    'settings numbers';
  gap: 10px;

  &:not(:last-child) {
    margin-bottom: 42px;
  }
`;

type BulletinProps = {
  icon?: Icon;
};

export const Bulletin = styled.div<BulletinProps>`
  grid-area: bulletin;

  padding-top: 5px;

  background-color: #f3f7fd;
  border-radius: 4px;

  color: #df2733;
  text-align: center;
  font-size: 24px;
  font-weight: bold;

  &:hover {
    transition: background-color 0.2s ease-out;
    background-color: #e0e4e9;
  }

  span {
    white-space: nowrap;
  }

  svg {
    display: block;

    margin: 3px auto;

    width: 28px;
  }
`;

export const Label = styled.div`
  grid-area: label;
`;

export const Heading = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 24px;
  font-weight: bold;

  margin: 5px 0 8px;

  svg {
    width: 30px;
    height: 30px;
  }
`;

export const SubHeading = styled.div`
  position: relative;

  font-size: 12px;
  color: #ccc;
`;

export const Extras = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

export const Numbers = styled.div`
  grid-area: numbers;
`;

export const HiddenBlock = styled.li`
  position: relative;

  padding: 3px 0;
  margin-bottom: 42px;

  background: #f3f7fd;
  text-align: center;
  font-size: 12px;

  ${SettingsButton} {
    position: absolute;
    left: 0;
    top: 0;

    width: 40px;
  }
`;
