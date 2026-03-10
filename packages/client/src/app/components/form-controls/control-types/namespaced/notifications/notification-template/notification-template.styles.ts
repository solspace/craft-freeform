import { spacings } from "@ff-client/styles/variables";
import { animated } from "react-spring";
import styled from "styled-components";

export const NotificationTemplateSelector = styled(animated.div)`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};

  padding: 0;
`;
