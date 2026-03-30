import config, { Edition } from "@config/freeform/freeform.config";
import { useAppDispatch } from "@editor/store";
import { pageActions } from "@editor/store/slices/layout/pages";
import { pageSelecors } from "@editor/store/slices/layout/pages/pages.selectors";
import type React from "react";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Sortable from "sortablejs";

import { PageTabsContainer, PageTabsWrapper } from "./page-tabs.styles";
import { NewTab } from "./tab/new-tab";
import { Tab } from "./tab/tab";

export const PageTabs: React.FC = () => {
  const dispatch = useAppDispatch();
  const pages = useSelector(pageSelecors.all);
  const containerRef = useRef<HTMLDivElement>(null);

  const canAddPages =
    config.editions.isAtLeast(Edition.Lite) &&
    config.limitations.can("layout.multiPageForms");

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const sortable = Sortable.create(containerRef.current, {
      animation: 150,
      ghostClass: "sortable-ghost",
      draggable: ".sortable-page-tab",
      onEnd: (event) => {
        if (
          event.oldDraggableIndex === undefined ||
          event.newDraggableIndex === undefined ||
          event.oldDraggableIndex === event.newDraggableIndex
        ) {
          return;
        }

        const page = pages[event.oldDraggableIndex];
        if (!page) {
          return;
        }

        dispatch(
          pageActions.moveTo({
            uid: page.uid,
            order: event.newDraggableIndex,
          }),
        );
      },
    });

    return () => {
      sortable.destroy();
    };
  }, [dispatch, pages]);

  return (
    <PageTabsWrapper>
      <PageTabsContainer ref={containerRef}>
        {pages.map((page, index) => (
          <Tab key={page.uid} index={index} page={page} />
        ))}

        {canAddPages && <NewTab />}
      </PageTabsContainer>
    </PageTabsWrapper>
  );
};
