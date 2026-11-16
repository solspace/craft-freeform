import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from "@ff-client/styles/variables";
import { animated } from "@react-spring/web";
import styled from "styled-components";

import type { ABStatus } from "./ab-tests.types";

export const PageLayout = styled.div`
  min-width: 0;
  padding-block-start: var(--c-spacing-lg);
`;

export const PageWrapper = styled.div`
  margin-bottom: 0;
`;

export const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-block-end: var(--c-spacing-lg);
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.md};
`;

export const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
`;

export const Card = styled.section`
  container-type: inline-size;
  min-width: 0;
  background: light-dark(${colors.white}, ${colors.surface});
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.box};
`;

export const CardHeader = styled.header`
  display: flex;
  align-items: center;
  gap: ${spacings.md};
  padding: ${spacings.lg} ${spacings.xl};

  h2 {
    flex: 1;
    min-width: 0;
    margin: 0;
  }

  @container (max-width: 650px) {
    align-items: flex-start;
  }
`;

export const CardToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacings.xl};
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${colors.text};
  text-align: left;
  cursor: pointer;

  .test-info {
    flex: 1;
    min-width: 0;
  }

  .test-title {
    display: block;
    font-size: 18px;
    line-height: 1.4;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  &:hover .test-title {
    color: ${colors.link};
  }

  &:focus-visible {
    outline: 2px solid ${colors.link};
    outline-offset: 6px;
    border-radius: ${borderRadius.sm};
  }

  @container (max-width: 650px) {
    flex-wrap: wrap;
    gap: ${spacings.md};

    .test-info {
      flex-basis: calc(100% - 40px);
    }
  }
`;

export const CardChevron = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 24px;
  width: 24px;
  height: var(--ui-control-height);
  color: ${colors.muted};

  svg {
    display: block;
    width: 10px;
    height: 14px;
    transform: rotate(${({ $expanded }) => ($expanded ? "90deg" : "-90deg")});
    transition: transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1);

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  @container (max-width: 650px) {
    order: 1;
    align-self: flex-start;
  }
`;

export const CardPanel = styled(animated.div)`
  overflow: hidden;

  > div {
    display: flow-root;
  }
`;

export const PreviewStats = styled.span`
  display: grid;
  grid-template-columns: repeat(3, minmax(80px, 1fr));
  gap: ${spacings.xl};
  font-weight: 400;

  > span {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metric-label {
    color: ${colors.muted};
    font-size: 12px;
    line-height: 18px;
  }

  strong {
    font-size: 20px;
    line-height: 26px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  @container (max-width: 650px) {
    order: 2;
    width: 100%;
    gap: ${spacings.sm};
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const CardDescription = styled.p`
  margin: 0 ${spacings.xl} ${spacings.md};
  color: ${colors.muted};
`;

export const Meta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${spacings.sm};
  margin-top: 6px;
  color: ${colors.muted};
  font-size: 12px;
  font-weight: 400;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  > span + span::before {
    content: '·';
    margin-right: 2px;
    color: ${colors.muted};
  }
`;

export const Dot = styled.span<{ $status?: ABStatus }>`
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case "active":
        return colors.green600;
      case "scheduled":
        return colors.yellow500;
      default:
        return colors.gray400;
    }
  }};
`;

export const Summary = styled.dl`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin: 0 ${spacings.xl};
  padding: ${spacings.md} 0;
  border-top: 1px solid ${colors.hairline};
  border-bottom: 1px solid ${colors.hairline};
  gap: ${spacings.md};

  dt {
    color: ${colors.muted};
    font-size: 12px;
    margin-bottom: 4px;
  }

  dd {
    margin: 0;
    color: ${colors.text};
    font-size: 24px;
    line-height: 1.3;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const Results = styled.div`
  display: grid;
  gap: ${spacings.xl};
  padding: ${spacings.lg} ${spacings.xl};

  @container (min-width: 1150px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  }
`;

export const ChartArea = styled.div`
  min-width: 0;
  padding: ${spacings.lg} 0;
  border-top: 1px solid ${colors.hairline};

  @container (min-width: 1150px) {
    padding: 0 0 0 ${spacings.xl};
    border-top: 0;
    border-left: 1px solid ${colors.hairline};
  }
`;

export const ChartEmpty = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  gap: 6px;
  padding: ${spacings.md};
  text-align: center;
  color: ${colors.muted};
  font-size: 13px;

  strong {
    color: ${colors.text};
    font-weight: 600;
  }
`;

export const ChartToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${spacings.md};
  margin-bottom: ${spacings.md};

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
`;

export const ChartLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacings.md};
  margin: ${spacings.sm} 0 0;
  color: ${colors.muted};
  font-size: 12px;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  i {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
  }
`;

export const Tabs = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 3px;
  background: ${colors.mutedSurface};
  border-radius: ${borderRadius.md};
`;

export const Tab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 5px 12px;
  cursor: pointer;
  border: 0;
  border-radius: ${borderRadius.sm};
  background: ${({ $active }) => ($active ? colors.surface : "transparent")};
  box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgb(0 0 0 / 12%)" : "none")};
  color: ${({ $active }) => ($active ? colors.text : colors.muted)};
  font-size: 12px;
  line-height: 20px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};

  &:hover {
    color: ${colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${colors.link};
    outline-offset: 2px;
  }
`;

export const Variants = styled.div`
  display: grid;
  align-items: stretch;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: ${spacings.md};
`;

export const VariantCard = styled.article`
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
  row-gap: 0;
  min-width: 0;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  overflow: hidden;

  &.winner {
    border-color: ${colors.green600};
  }
`;

export const Winner = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: ${borderRadius.sm};
  background: light-dark(#eaf7ef, color-mix(in srgb, var(--green-400) 12%, transparent));
  color: light-dark(#18703c, var(--green-400));
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;

  svg {
    display: block;
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }
`;

export const VariantHeader = styled.header`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${spacings.sm};
  padding: ${spacings.md};
  background: ${colors.mutedSurface};

  h3 {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
`;

export const VariantLetter = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: ${colors.text};
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
`;

export const VariantStats = styled.dl`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 7px 12px;
  margin: 0;
  padding: ${spacings.md};
  color: ${colors.muted};
  font-size: 13px;

  dd {
    margin: 0;
    color: ${colors.text};
    text-align: right;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
`;

export const VariantFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.sm};
  margin-top: auto;
  padding: 10px ${spacings.md};
  border-top: 1px solid ${colors.hairline};
  background: ${colors.mutedSurface};
  font-size: 12px;
  font-weight: 600;

  .thick {
    font-size: 24px;
    line-height: 1.2;
    color: ${colors.text};
    font-variant-numeric: tabular-nums;
  }
`;

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};

  max-height: 70vh;
  min-height: 40vh;
  padding: ${spacings.lg} ${spacings.xl};

  overflow: auto;

  td.weight, td.action {
    vertical-align: middle;
  }
`;

export const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacings.md};

  .react-datepicker-wrapper {
    width: 100%;
  }
`;

export const VariantEditor = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px auto;
  align-items: center;
  gap: ${spacings.sm};

  padding: ${spacings.md};

  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};

  select,
  input {
    width: 100%;
  }
`;

export const VariantEditorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};
`;

export const VariantDeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--c-size-control-md, 32px);
  height: var(--c-size-control-md, 32px);
  padding: 0;
  border: 0;
  border-radius: var(--c-radius-md, 4px);
  background: transparent;
  color: var(--c-text-default);
  cursor: pointer;

  &:hover {
    background: var(--c-color-danger-fill-quiet);
    color: var(--c-color-danger-on-quiet);
  }

  &:focus-visible { outline: var(--focus-ring); }
  svg { display: block; width: 16px; height: 16px; }
`;
