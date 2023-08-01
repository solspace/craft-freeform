import React from 'react';
import { useQueryForms } from '@ff-client/queries/forms';
import translate from '@ff-client/utils/translations';

import { Card } from './card/card';
import { CardLoading } from './card/card.loading';
import { EmptyList } from './list.empty';
import { Header, Title, Wrapper } from './list.styles';

export const List: React.FC = () => {
  const { data, isFetching } = useQueryForms();
  //const data: Form[] = [];
  //const isFetching = false;

  const isEmpty = !isFetching && data && !data.length;

  return (
    <>
      <Header>
        <Title>{translate('Forms')}</Title>
        <button className="btn submit add icon">
          {translate('Add new Form')}
        </button>
      </Header>
      <div id="content-container">
        <div id="content" className="content-pane" style={{ minHeight: 500 }}>
          {isEmpty && <EmptyList />}
          {!isEmpty && (
            <Wrapper>
              {isFetching && (
                <>
                  <CardLoading />
                  <CardLoading />
                  <CardLoading />
                </>
              )}
              {!isFetching &&
                data &&
                data.map((form) => (
                  <Card
                    key={form.id}
                    form={form}
                    counters={{
                      submissions: 14,
                      spam: 5,
                    }}
                  />
                ))}
            </Wrapper>
          )}
        </div>
      </div>
    </>
  );
};
