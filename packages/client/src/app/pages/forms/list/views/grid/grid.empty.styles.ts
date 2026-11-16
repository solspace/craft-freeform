import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

import { CardWrapper, LinkList, Subtitle, Title } from "./card/card.styles";
import { Cards } from "./grid.styles";

export const ActionsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const MutedWrapper = styled(Cards)`
  --empty-form-accent: light-dark(#e0e0e0, color-mix(in srgb, ${colors.muted} 60%, ${colors.surface}));
  position: relative;
  margin-top: ${spacings.xl};

  // One overlay fades the entire illustration into the surrounding pane.
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    background: linear-gradient(
      to right,
      transparent 15%,
      color-mix(in srgb, ${colors.surface} 80%, transparent) 50%,
      ${colors.surface} 80%
    );
  }

  &,
  * {
    pointer-events: none;
    user-select: none;
  }

  ${CardWrapper} {
    border-color: light-dark(#fbfcfd, ${colors.border});
    background: light-dark(#fefeff, ${colors.mutedSurface});

  }

  ${Title}, ${LinkList}, ${LinkList} a {
    color: light-dark(#cfd1d2, ${colors.muted});
  }

  ${Subtitle} {
    color: light-dark(#e2e4e5, color-mix(in srgb, ${colors.muted} 75%, ${colors.surface}));
  }
`;
