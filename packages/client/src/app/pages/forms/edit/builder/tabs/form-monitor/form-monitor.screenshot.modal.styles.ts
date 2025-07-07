import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ScreenshotsContainer = styled.div`
  display: flex;
  gap: ${spacings.lg};
  margin-bottom: ${spacings.lg};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ScreenshotSection = styled.div`
  flex: 1;
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const ScreenshotTitle = styled.h3`
  margin: 0 0 ${spacings.md} 0;
  color: ${colors.gray700};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

export const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: ${colors.gray050};
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-grow: 1;
  min-height: 300px;
  max-height: 60vh;
  width: 100%;
  border: 1px solid ${colors.gray200};
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

export const ScreenshotImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
`;

export const ZoomControls = styled.div`
  position: absolute;
  top: ${spacings.sm};
  right: ${spacings.sm};
  display: flex;
  gap: ${spacings.xs};
  background: rgba(255, 255, 255, 0.95);
  padding: ${spacings.xs};
  border-radius: 6px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

export const ZoomButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${colors.gray300};
  background: ${colors.white};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.gray100};
    border-color: ${colors.gray400};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ZoomInfo = styled.div`
  position: absolute;
  bottom: ${spacings.sm};
  left: ${spacings.sm};
  background: rgba(0, 0, 0, 0.7);
  color: ${colors.white};
  padding: ${spacings.xs} ${spacings.sm};
  border-radius: 4px;
  font-size: 12px;
  backdrop-filter: blur(4px);
  z-index: 10;
`;

export const NoImageMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${colors.gray500};
  font-style: italic;
`;

export const SingleScreenshotContainer = styled.div`
  display: flex;
  gap: ${spacings.lg};
  margin-bottom: ${spacings.lg};
  width: 100%;
`;
