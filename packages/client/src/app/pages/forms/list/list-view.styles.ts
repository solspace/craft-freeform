import { Link } from "react-router-dom";
import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Header = styled.header`
  display: grid;
  grid-template-areas: 'title sites views button';
  grid-template-columns: min-content 1fr min-content auto;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.md};
`;

export const Title = styled.h1`
  grid-area: title;

  padding: ${spacings.sm} 0;
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`;

export const ButtonGroup = styled.div`
  grid-area: button;
  display: flex;
  align-items: center;
  gap: ${spacings.sm};
`;

export const Button = styled.button`
  flex-shrink: 0;
`;

export const AiButton = styled(Button)`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  color: #fff;
  border: none;

  &:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%);
    color: #fff;
  }
`;

export const EnableAiLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%);
    color: #fff;
  }
`;

export const ViewButtons = styled.section`
  grid-area: views;
`;
