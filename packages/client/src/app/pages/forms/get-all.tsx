import React from 'react';
import { Link } from 'react-router-dom';

import { useQueryForms } from '@ff-client/queries/forms';

import { Card, Subtitle, Title, Wrapper } from './get-all.styles';

export const GetAll: React.FC = () => {
  const { data, isFetching, isError, error } = useQueryForms();

  if (isFetching) {
    return <div>fetching forms...</div>;
  }

  if (isError) {
    return <div>ERROR {error.message}</div>;
  }

  return (
    <div>
      <h1>Forms</h1>
      <Wrapper>
        <Card>
          <Title>
            <Link to="new">Create new Form</Link>
          </Title>
          <Subtitle>click me</Subtitle>
        </Card>

        {data.map((form) => (
          <Card key={form.id}>
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
