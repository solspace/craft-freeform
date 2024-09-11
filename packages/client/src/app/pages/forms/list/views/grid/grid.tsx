import React, { useEffect, useRef, useState } from 'react';
import config, { Edition } from '@config/freeform/freeform.config';
import { useFetchFormGroups } from '@ff-client/queries/form-groups';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import EditIcon from '@ff-icons/actions/edit.svg';
import axios from 'axios';
import Sortable from 'sortablejs';

import { useEditGroupModal } from '../../modals/hooks/use-edit-group-modal';
import { Notices } from '../../notices/notices';

import { Archived } from './archived/archived';
import { Card } from './card/card';
import { CardLoading } from './card/card.loading';
import { GridEmpty } from './grid.empty';
import {
  ArchivedAndGroupWrapper,
  Cards,
  CardWrapper,
  ContentContainer,
  GroupsButton,
  GroupTitle,
  GroupWrap,
  Wrapper,
} from './grid.styles';

export const FormGrid: React.FC = () => {
  const { data, isFetching } = useFetchFormGroups();
  const openEditGroupModal = useEditGroupModal();

  const isForms = data?.forms.length > 0;
  const isGroups = data?.formGroups?.groups.some(
    (group) => group.forms.length > 0
  );
  const isEmpty = !isFetching && !isForms && !isGroups;

  const isExpressEdition = config.editions.is(Edition.Express);
  const isProEdition = config.editions.isAtLeast(Edition.Pro);

  const gridRef = useRef<HTMLUListElement>(null);
  const sortableRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const onSortEnd = (): void => {
    const orderedFormIds = sortableRef.current.toArray();
    axios.post('/api/forms/sort', { orderedFormIds });

    setIsDragging(false);
  };

  useEffect(() => {
    document.title = translate('Forms');
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      sortableRef.current = new Sortable(gridRef.current, {
        animation: 150,
        onEnd: onSortEnd,
        handle: '.handle',
        onStart: () => {
          setIsDragging(true);
        },
      });
    }
  }, [data]);

  return (
    <ContentContainer>
      <div id="content" className="content-pane">
        <Notices />

        <Wrapper>
          {isEmpty && <GridEmpty />}
          {!isEmpty && (
            <CardWrapper>
              {isProEdition &&
                data?.formGroups &&
                data.formGroups.groups.map((group) =>
                  group.forms.length ? (
                    <GroupWrap key={group.uid}>
                      <GroupTitle>{group.label}</GroupTitle>
                      <Cards>
                        {group.forms.map((form) => (
                          <Card
                            isExpressEdition={isExpressEdition}
                            key={form.id}
                            form={form}
                          />
                        ))}
                      </Cards>
                    </GroupWrap>
                  ) : null
                )}
              {!isEmpty && isForms && (
                <GroupWrap>
                  {isGroups && <GroupTitle>Other</GroupTitle>}

                  <Cards
                    ref={gridRef}
                    className={classes(isDragging && 'dragging')}
                  >
                    {data?.forms &&
                      data.forms.map((form) => (
                        <Card
                          isDraggingInProgress={isDragging}
                          isExpressEdition={isExpressEdition}
                          key={form.id}
                          form={form}
                        />
                      ))}
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

          <ArchivedAndGroupWrapper>
            {!isExpressEdition && data?.archivedForms && (
              <Archived data={data.archivedForms} />
            )}

            {!isEmpty && isProEdition && (
              <GroupsButton
                className="edit-groups"
                onClick={openEditGroupModal}
              >
                <EditIcon />
                {translate('Form Groups')}
              </GroupsButton>
            )}
          </ArchivedAndGroupWrapper>
        </Wrapper>
      </div>
    </ContentContainer>
  );
};
