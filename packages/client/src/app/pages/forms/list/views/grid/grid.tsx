import config, { Edition } from "@config/freeform/freeform.config";
import { useFetchFormGroups } from "@ff-client/queries/form-groups";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";
import { useEffect } from "react";

import { Notices } from "../../notices/notices";

import { Archived } from "./archived/archived";
import { Card } from "./card/card";
import { CardLoading } from "./card/card.loading";
import { CardPreview } from "./card/card.preview";
import { GridEmpty } from "./grid.empty";
import { useDashboardSorting } from "./grid.sortable";
import {
  ArchivedAndGroupWrapper,
  Cards,
  CardWrapper,
  ContentContainer,
  GroupTitle,
  GroupWrap,
  Wrapper,
} from "./grid.styles";

export const FormGrid: React.FC = () => {
  const { data, isFetching } = useFetchFormGroups();
  const sorting = useDashboardSorting(data);

  const isForms = (data?.forms?.length ?? 0) > 0;
  const isGroups = data?.formGroups?.groups.some(
    (group) => (group?.forms?.length ?? 0) > 0,
  );
  const isEmpty = !isFetching && !isForms && !isGroups;

  const isExpressEdition = config.editions.is(Edition.Express);
  const isProEdition = config.editions.isAtLeast(Edition.Pro);

  useEffect(() => {
    document.title = translate("Forms");
  }, []);

  return (
    <ContentContainer>
      <div id="content" className="content-pane">
        <Notices />

        <Wrapper>
          {isEmpty && <GridEmpty />}
          {!isEmpty && (
            <CardWrapper
              ref={sorting.wrapperRef}
              $dragging={sorting.isDragging}
              aria-busy={sorting.isSaving}
            >
              {isProEdition &&
                data?.formGroups?.groups.map((group) =>
                  (group?.forms?.length ?? 0) || sorting.canMove ? (
                    <GroupWrap key={group.uid}>
                      <GroupTitle>{group.label}</GroupTitle>
                      <Cards
                        data-form-group={group.uid}
                        aria-label={group.label}
                        $empty={translate("Drag forms here.")}
                      >
                        {group?.forms?.map((form) => (
                          <Card
                            isDraggingInProgress={sorting.isDragging}
                            canMove={sorting.canMove}
                            onKeyboardMove={sorting.onKeyboardMove}
                            isExpressEdition={isExpressEdition}
                            key={form.id}
                            form={form}
                          />
                        ))}
                      </Cards>
                    </GroupWrap>
                  ) : null,
                )}
              {data && !isEmpty && (isForms || sorting.canMove) && (
                <GroupWrap>
                  {data?.formGroups?.groups.length > 0 && (
                    <GroupTitle>{translate("Other")}</GroupTitle>
                  )}

                  <Cards
                    data-form-group=""
                    aria-label={translate("Other")}
                    $empty={translate("Drag forms here.")}
                  >
                    {data?.forms?.map((form) => (
                      <Card
                        isDraggingInProgress={sorting.isDragging}
                        canMove={sorting.canMove}
                        onKeyboardMove={sorting.onKeyboardMove}
                        isExpressEdition={isExpressEdition}
                        key={form.id}
                        form={form}
                      />
                    ))}
                    {isExpressEdition && (
                      <>
                        <CardPreview />
                        <CardPreview />
                      </>
                    )}
                  </Cards>
                </GroupWrap>
              )}
              {!data?.forms && isFetching && (
                <Cards>
                  <CardLoading />
                  <CardLoading />
                  <CardLoading />
                </Cards>
              )}
            </CardWrapper>
          )}

          {isExpressEdition && (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  translate(
                    'Need more forms? <a href="{link}" target="_blank">Upgrade to Lite or Pro</a>.',
                    { link: Craft.getCpUrl("plugin-store/freeform") },
                  ),
                ),
              }}
            />
          )}

          <ArchivedAndGroupWrapper>
            {!isExpressEdition && data?.archivedForms && (
              <Archived data={data.archivedForms} />
            )}
          </ArchivedAndGroupWrapper>
        </Wrapper>
      </div>
    </ContentContainer>
  );
};
