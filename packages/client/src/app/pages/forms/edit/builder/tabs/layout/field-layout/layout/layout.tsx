import type { Layout as LayoutType } from "@editor/builder/types/layout";
import { useAppSelector } from "@editor/store";
import { rowSelectors } from "@editor/store/slices/layout/rows/rows.selectors";
import translate from "@ff-client/utils/translations";
import type React from "react";

import { Row } from "../row/row";

import { useLayoutDrop } from "./layout.drop";
import { DropZone, EmptyLayout, PageFieldLayoutWrapper } from "./layout.styles";

type Props = {
  layout: LayoutType;
};

export const Layout: React.FC<Props> = ({ layout }) => {
  const rows = useAppSelector((state) =>
    rowSelectors.inLayout(state, layout?.uid),
  );

  const {
    dropRef,
    placeholderAnimation,
    sectionHeight,
    sectionLabel,
    sectionPreview,
  } = useLayoutDrop(layout);

  return (
    <PageFieldLayoutWrapper
      ref={(el) => {
        dropRef(el);
      }}
      className="field-layout"
    >
      {!rows.length && (
        <EmptyLayout>
          {translate("Drag or click fields to add them to the layout")}
        </EmptyLayout>
      )}
      {rows.map((row) => (
        <Row row={row} key={row.uid} />
      ))}
      <DropZone
        style={{
          ...placeholderAnimation,
          ...(sectionHeight ? { height: sectionHeight } : {}),
        }}
      >
        {sectionHeight && sectionPreview ? (
          <img
            src={sectionPreview}
            alt=""
            style={{
              width: 240,
              maxWidth: "85%",
              maxHeight: "85%",
              objectFit: "contain",
            }}
          />
        ) : sectionHeight ? (
          sectionLabel
        ) : (
          translate("+ insert row")
        )}
      </DropZone>
    </PageFieldLayoutWrapper>
  );
};
