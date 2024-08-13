import React, { useEffect, useRef, useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import config, { Edition } from '@config/freeform/freeform.config';
import { useQueryFormsWithStats } from '@ff-client/queries/forms';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import axios from 'axios';
import Sortable from 'sortablejs';

import { Archived } from './archived/archived';
import { Card } from './card/card';
import { CardLoading } from './card/card.loading';
import { useCreateFormModal } from './modal/use-create-form-modal';
import { Notices } from './notices/notices';
import { EmptyList } from './list.empty';
import { ListSites } from './list.sites';
import {
  Button,
  Cards,
  ContentContainer,
  Header,
  Title,
  Wrapper,
} from './list.styles';

export const List: React.FC = () => {
  const { data, isFetching } = useQueryFormsWithStats();
  const openCreateFormModal = useCreateFormModal();

  const formLimit = config.limits.forms;
  const formCount = data?.length || 1;

  const forms = data?.filter(({ dateArchived }) => !dateArchived);
  const archivedForms = data?.filter(({ dateArchived }) => !!dateArchived);

  const isEmpty = !isFetching && forms && !forms.length;
  const isExpressEdition = config.editions.is(Edition.Express);

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
  });

  useEffect(() => {
    sortableRef.current = new Sortable(gridRef.current, {
      animation: 150,
      onEnd: onSortEnd,
      handle: '.handle',
      onStart: () => {
        setIsDragging(true);
      },
    });
  }, []);

  return (
    <>
      <Header>
        <Title>
          <LoadingText spinner loading={isFetching}>
            {translate('Forms')}
          </LoadingText>
        </Title>

        <ListSites />

        {(!formLimit || formCount < formLimit) && (
          <Button className="btn submit add icon" onClick={openCreateFormModal}>
            {translate('Add new Form')}
          </Button>
        )}
      </Header>
      <ContentContainer>
        <div id="content" className="content-pane">
          <Notices />

          <Wrapper>
            {isEmpty && <EmptyList />}
            {!isEmpty && (
              <Wrapper>
                <Cards
                  ref={gridRef}
                  className={classes(isDragging && 'dragging')}
                >
                  {forms &&
                    forms.map((form) => (
                      <Card
                        key={form.id}
                        form={form}
                        isDraggingInProgress={isDragging}
                        isExpressEdition={isExpressEdition}
                      />
                    ))}
                  {!forms && isFetching && (
                    <>
                      <CardLoading />
                      <CardLoading />
                      <CardLoading />
                    </>
                  )}
                </Cards>
              </Wrapper>
            )}
            {!isExpressEdition && archivedForms && (
              <Archived data={archivedForms} />
            )}
          </Wrapper>
        </div>
      </ContentContainer>
    </>
  );
};
