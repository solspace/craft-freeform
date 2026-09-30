import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const EmbedContent = styled.div`
  max-width: 950px;
`;

export const EmbedSetting = styled.div`
  margin-bottom: ${spacings.lg};
`;

export const Description = styled.p`
  margin: 0 0 ${spacings.lg};
  color: ${colors.gray600};
`;

export const CodeLabel = styled.h2`
  margin: 0 0 ${spacings.sm};
  font-size: 1rem;
`;

export const CodeBlock = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: ${spacings.sm};
  padding: ${spacings.sm};
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};
  background: ${colors.gray050};

  code {
    min-width: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    user-select: text;
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: ${spacings.sm};
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const CopyFeedback = styled.div`
  min-height: ${spacings.lg};
  margin-top: ${spacings.xs};
  color: ${colors.gray600};
`;

export const HelpSection = styled.section`
  border-top: 1px solid ${colors.gray200};
  margin: ${spacings.lg} 0 0;
  padding-top: ${spacings.lg};

  h2 {
    margin: 0 0 ${spacings.md};
    font-size: 1.125rem;
  }

  dl {
    margin: 0;
  }
`;

export const HelpTopic = styled.div`
  margin-bottom: ${spacings.md};

  dt {
    font-weight: 600;
  }

  dd {
    margin: ${spacings.xs} 0 0;
    color: ${colors.gray600};
  }
`;

export const DocsLink = styled.a`
  display: block;
  border-top: 1px solid ${colors.gray200};
  padding-top: ${spacings.md};
`;
