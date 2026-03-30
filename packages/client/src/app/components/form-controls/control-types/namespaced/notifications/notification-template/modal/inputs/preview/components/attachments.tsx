import { colors } from "@ff-client/styles/variables";
import type { FC } from "react";
import styled from "styled-components";

export type Attachment = {
  filename: string;
  mediaType: string;
  size: string;
};

type Props = {
  attachments: Attachment[];
};

export const Attachments: FC<Props> = ({ attachments }) => {
  return (
    <div>
      {attachments.map((attachment, index) => (
        <Item key={index}>
          <i
            className={`fa-regular fa-file-${getIconType(attachment.filename)}`}
          />
          <span>{attachment.filename}</span>
          <Size>{attachment.size}</Size>
        </Item>
      ))}
    </div>
  );
};

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Size = styled.span`
  font-weight: 700;
  font-size: 0.8em;
  color: ${colors.gray250};
`;

const getIconType = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase();
  let iconType: string;
  switch (extension) {
    case "pdf":
      iconType = "pdf";
      break;

    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      iconType = "image";
      break;

    case "xlsx":
      iconType = "spreadsheet";
      break;

    case "doc":
      iconType = "doc";
      break;

    case "ppt":
      iconType = "ppt";
      break;

    default:
      iconType = "file";
      break;
  }

  return iconType;
};
