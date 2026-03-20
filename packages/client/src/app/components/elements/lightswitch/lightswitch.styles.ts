import { beziers, colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const LightSwitchHandle = styled.div`
  display: block;

  width: 18px;
  height: 18px;

  inset-inline-start: calc(50% - 9px);
  inset-block-start: 2px;

  border: 0 solid #e5e7eb;
  border-radius: 9px;

  background-color: ${colors.white};
  box-shadow: inset 0 0 0 1px var(--_lightswitch-border-color);

  transition: transform 0.2s ${beziers.bounce.easeOut};

  &:before {
    content: '';

    position: absolute;

    width: 10px;
    height: 12px;

    box-sizing: border-box;
    inset-block-start: 50%;
    inset-inline-start: 50%;

    transform: translateX(-50%) translateY(-50%);
  }
`;

export const LightSwitchWrapper = styled.div`
  position: relative;
  cursor: pointer;

  width: 34px;
  padding: 2px;

  border-radius: 11px;
  border: none;
  background-image: linear-gradient(to right, var(--gray-400), var(--gray-400));
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);

  transition: background-color 0.2s ${beziers.easeOut};

  &.craft-5_8 {
    --_lightswitch-border-color: var(
      --lightswitch-border-color,
      hsl(from var(--input-border-color) h s l/80%)
    );

    box-shadow: inset 0 0 0 1px var(--_lightswitch-border-color);
    background-image: linear-gradient(
      to right,
      var(--gray-200),
      var(--gray-200)
    );

    transition: background-image 0.1s linear;
  }

  &.on {
    background-image: linear-gradient(
      to right,
      var(--enabled-color),
      var(--enabled-color)
    );

    &.craft-5_8 {
      --_lightswitch-border-color: oklch(
        from var(--bg-enabled) calc(l - 0.1) c h
      );

      background-image: linear-gradient(
        to right,
        var(--bg-enabled),
        var(--bg-enabled)
      );
    }

    ${LightSwitchHandle} {
      transform: translateX(12px);
    }

    &.craft-5_8 {
      ${LightSwitchHandle} {
        &:before {
          background-color: var(--enabled-color);
          mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3C!--! Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2024 Fonticons, Inc.--%3E%3Cpath d='M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z'/%3E%3C/svg%3E");
          mask-repeat: none;
        }
      }
    }
  }

  &.error {
    background-image: linear-gradient(
      to right,
      var(--error-color),
      var(--error-color)
    );
  }
`;
