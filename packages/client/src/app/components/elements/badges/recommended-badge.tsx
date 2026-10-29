import translate from "@ff-client/utils/translations";
import styled from "styled-components";

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: fit-content;
  padding: 0 5px;
  border: 1px solid #d6e0ea;
  border-radius: 3px;
  background: #eaf0f6;
  color: #4a657d;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
`;

export function RecommendedBadge() {
  return <Badge>{translate("Recommended")}</Badge>;
}
