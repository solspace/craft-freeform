import styled from 'styled-components';

export const Settings = styled.div`
  grid-area: settings;

  position: relative;
`;

export const SettingsButton = styled.button`
  display: block;

  width: 100%;
  padding: 5px 12px;

  border-radius: 4px;
  color: #ced6df;

  transition: all 0.2s ease-out;

  &:hover,
  &.open {
    background-color: #c8cfd5;
    color: #ffffff;
  }

  &.open {
    border-radius: 4px 4px 0 0;
  }

  @keyframes rotator {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  &.loading svg {
    animation-name: rotator;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
`;

export const DropdownWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 28px;
  z-index: 2;

  width: 150px;
  overflow: hidden;

  border-radius: 0 5px 5px 5px;
  border: 1px solid #e0e2e6;
  background: #ffffff;

  box-shadow: rgba(17, 17, 26, 0.1) 5px 5px 8px;
`;

export const DropdownItem = styled.a`
  display: block;
  padding: 3px 10px;

  background-color: #ffffff;
  color: #000000;
  font-size: 12px;

  transition: background-color 0.2s ease-out;

  &.selected {
    background-color: #f3f7fd;
  }

  &:hover {
    background-color: #d8dce1;
    text-decoration: none;
  }
`;
