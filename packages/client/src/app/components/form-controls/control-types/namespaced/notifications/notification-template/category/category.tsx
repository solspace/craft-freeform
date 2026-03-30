import type { NotificationTemplate } from "@ff-client/types/notifications";
import classes from "@ff-client/utils/classes";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import type { NotificationSelectHandler } from "../notification-template";
import {
  TemplateCategoryWrapper,
  TemplateList,
  Title,
} from "./category.styles";
import { CreateButton } from "./item/CreateButton";
import { Item } from "./item/Item";

type Props = {
  value: number | string;
  title: string;
  templates: NotificationTemplate[];
  canCreate?: boolean;
  openEditOnClick?: boolean;
  onClick: NotificationSelectHandler;
  onCreate?: () => void;
};

export const Category: React.FC<Props> = ({
  value,
  title,
  templates,
  canCreate,
  openEditOnClick,
  onClick,
  onCreate,
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const element = listRef.current;
    if (element) {
      setHasScroll(element.scrollHeight > element.clientHeight);
    }
  }, []);

  if (templates === undefined) {
    return null;
  }

  if (!templates?.length && !canCreate) {
    return null;
  }

  return (
    <TemplateCategoryWrapper>
      <Title>
        <span>{title}</span>
      </Title>

      <TemplateList
        ref={listRef}
        className={classes(hasScroll && "has-scroll")}
      >
        {templates.map((template) => (
          <Item
            key={template.id}
            openEditOnClick={openEditOnClick}
            active={value === template.id}
            template={template}
            onClick={onClick}
          />
        ))}

        {canCreate && <CreateButton onCreate={onCreate} />}
      </TemplateList>
    </TemplateCategoryWrapper>
  );
};
