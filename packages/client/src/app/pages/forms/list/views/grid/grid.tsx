import config, { Edition } from "@config/freeform/freeform.config";
import { useFetchFormGroups } from "@ff-client/queries/form-groups";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";
import { useEffect } from "react";

import type { FormSearchProps } from "../../form-search";
import { createFormSearch } from "../../form-search.utils";
import { useFormLimitModal } from "../../modals/hooks/use-add-form-modal";
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

export const FormGrid: React.FC<FormSearchProps> = ({ search = "" }) => {
  const openFormLimit = useFormLimitModal();
  const { data, isFetching } = useFetchFormGroups();
  const isSearching = search.trim().length > 0;
  const sorting = useDashboardSorting(data, !isSearching);
  const matchesSearch = createFormSearch(search);
  const forms = data?.forms?.filter(matchesSearch);
  const groups = data?.formGroups?.groups.map((group) => ({
    ...group,
    forms: group.forms?.filter(matchesSearch),
  }));
  const archivedForms = data?.archivedForms?.filter(matchesSearch);

  const isForms = (forms?.length ?? 0) > 0;
  const isGroups = groups?.some((group) => (group?.forms?.length ?? 0) > 0);
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
          {isEmpty && !isSearching && <GridEmpty />}
          {isEmpty && isSearching && !archivedForms?.length && (
            <p role="status">{translate("No forms match your search.")}</p>
          )}
          {!isEmpty && (
            <CardWrapper
              ref={sorting.wrapperRef}
              $dragging={sorting.isDragging}
              aria-busy={sorting.isSaving}
            >
              {isProEdition &&
                groups?.map((group) =>
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
              {/* Keep the empty drop target mounted so Sortable can register it before dragging. */}
              {data && !isEmpty && (isForms || sorting.canMove) && (
                <GroupWrap hidden={!isForms && !sorting.isDragging}>
                  {data?.formGroups?.groups.length > 0 && (
                    <GroupTitle>{translate("Other")}</GroupTitle>
                  )}

                  <Cards
                    data-form-group=""
                    aria-label={translate("Other")}
                    $empty={translate("Drag forms here.")}
                  >
                    {forms?.map((form) => (
                      <Card
                        isDraggingInProgress={sorting.isDragging}
                        canMove={sorting.canMove}
                        onKeyboardMove={sorting.onKeyboardMove}
                        isExpressEdition={isExpressEdition}
                        key={form.id}
                        form={form}
                      />
                    ))}
                    {isExpressEdition && !isSearching && (
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
              onClick={(event) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest("a")
                ) {
                  event.preventDefault();
                  openFormLimit();
                }
              }}
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
            {!isExpressEdition && archivedForms && (
              <Archived data={archivedForms} />
            )}
          </ArchivedAndGroupWrapper>
        </Wrapper>
      </div>
    </ContentContainer>
  );
};
