import React from 'react';
import { Link } from 'react-router-dom';
import { useQueryForms } from '@ff-client/queries/forms';

import { useDeleteFormMutation } from './index.mutations';
import { Card, RemoveButton, Subtitle, Title, Wrapper } from './index.styles';

export const List: React.FC = () => {
  const { data, isFetching, isError, error } = useQueryForms();
  const mutation = useDeleteFormMutation();

  if (!data && isFetching) {
    return <div>fetching forms...</div>;
  }

  if (isError) {
    return <div>ERROR {error.message}</div>;
  }

  return (
    <div>
      <h1>
        Forms
        {isFetching && <span>is fetching</span>}
      </h1>
      <Wrapper>
        <Card>
          <Title>
            <Link to="new">Create new Form</Link>
          </Title>
          <Subtitle>click me</Subtitle>
        </Card>

        {data.map((form) => (
          <Card
            key={form.id}
            $disabled={mutation.isLoading && mutation.context === form.id}
          >
            <RemoveButton
              onClick={() => {
                if (confirm('Are you sure?')) {
                  mutation.mutate(form.id);
                }
              }}
            />
            <Title>
              <Link to={`${form.id}`}>{form.name}</Link>
            </Title>
            <Subtitle>{form.handle}</Subtitle>
          </Card>
        ))}
      </Wrapper>
    </div>
  );
};
