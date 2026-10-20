import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const CardBody = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${spacings.xl} ${spacings.xl} 0;
`;

export const FormBody = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${spacings.md};
  width: 100%;
`;

export const FormIdentity = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  gap: 12px;
`;

export const FormBodyContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FMContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 34%;
  min-width: 110px;
  overflow-wrap: anywhere;
  text-align: right;
  margin-top: 6px;
`;

export const Title = styled.h2`
  cursor: default;
  margin: 0 0 ${spacings.xs} 0;
  color: #3d464e;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: calc(100% - 1px);
  max-width: calc(100% - 1px);
  transition: all 0.2s ease-out;
`;

export const TitleLink = styled(Title)`
  cursor: pointer;
`;

export const Subtitle = styled.span`
  display: block;
  color: #868f96;
  font-size: 14px;
  line-height: 1.4;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: ${spacings.sm};
  cursor: default;

  &:hover {
    color: #6f7a82;
  }
`;

export const Controls = styled.div`
  position: absolute;
  right: ${spacings.sm};
  top: ${spacings.sm};
  z-index: 2;

  display: flex;
  justify-content: end;
  align-items: stretch;
  gap: ${spacings.sm};

  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s ease-out;
`;

export const ControlButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  font-size: 14px;
  color: #687684;
  background: #ffffffed;
  &:hover, &:focus-visible { color: var(--link-color); background: #e9f2fc; }
  &.handle { cursor: grab; }
  &.handle:active { cursor: grabbing; }

  > svg {
    fill: currentColor;
  }
`;

export const LinkList = styled.ul`
  margin: ${spacings.sm} 0 0;
  padding: 0;
`;

export const CardWrapper = styled.li`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  overflow: hidden;

  background-color: #fcfdff;
  border: 1px solid #dfe6ee;
  box-shadow: 0 1px 3px #1f344508;
  border-radius: var(--large-border-radius);

  opacity: 1;
  pointer-events: auto;

  transition:
    background-color 0.2s ease-out,
    border-color 0.2s ease-out,
    box-shadow 0.2s ease-out;

  &.blurred {
    filter: blur(3px);
    opacity: 0.35;
    pointer-events: none;
    user-select: none;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.archived {
    opacity: 0;
  }

  &:not(.dragging):hover, &:focus-within {
    background-color: #f3f7fd;
    border-color: #b4c5d8;
    box-shadow: 0 3px 12px #1f344510;

    ${TitleLink} {
      color: var(--link-color);
    }

    ${Controls} {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ChartWrapper = styled.div``;

export const PaddedChartFooter = styled.div<{ $color: string }>`
  margin-top: -3px;

  background-color: ${({ $color }) => $color};
  opacity: 0.3;

  height: 5px;

  font-size: 0px;
  line-height: 0px;

  overflow: hidden;
`;
