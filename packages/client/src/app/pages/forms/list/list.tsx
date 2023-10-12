import React, { useEffect, useRef, useState } from 'react';
import { useQueryFormsWithStats } from '@ff-client/queries/forms';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import axios from 'axios';
import Sortable from 'sortablejs';

import { Card } from './card/card';
import { CardLoading } from './card/card.loading';
import { useCreateFormModal } from './modal/use-create-form-modal';
import { Notices } from './notices/notices';
import { EmptyList } from './list.empty';
import { Header, Title, Wrapper } from './list.styles';

export const List: React.FC = () => {
  const { data, isFetching } = useQueryFormsWithStats();
  const openCreateFormModal = useCreateFormModal();

  const isEmpty = !isFetching && data && !data.length;

  const gridRef = useRef<HTMLUListElement>(null);
  const sortableRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const onSortEnd = (): void => {
    const orderedFormIds = sortableRef.current.toArray();
    axios.post('/api/forms/sort', { orderedFormIds });

    setIsDragging(false);
  };

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
        <Title>{translate('Forms')}</Title>
        <button className="btn submit add icon" onClick={openCreateFormModal}>
          {translate('Add new Form')}
        </button>
      </Header>
      <div id="content-container">
        <div id="content" className="content-pane">
          <Notices />

          {isEmpty && <EmptyList />}
          {!isEmpty && (
            <Wrapper
              ref={gridRef}
              className={classes(isDragging && 'dragging')}
            >
              {data &&
                data.map((form) => (
                  <Card
                    key={form.id}
                    form={form}
                    isDraggingInProgress={isDragging}
                  />
                ))}
              {!data && isFetching && (
                <>
                  <CardLoading />
                  <CardLoading />
                  <CardLoading />
                </>
              )}
            </Wrapper>
          )}
        </div>
      </div>
    </>
  );
};
