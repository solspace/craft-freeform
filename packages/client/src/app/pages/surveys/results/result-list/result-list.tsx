import React from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';

import { useQuerySurveyResults } from '../results.queries';

import { Block } from './block/block';
import { Heading, Wrapper } from './result-list.styles';

export const ResultList: React.FC = () => {
  const { data, isFetching } = useQuerySurveyResults();

  if (isFetching) {
    return 'Loading...';
  }

  return (
    <>
      <Breadcrumb label={data.form.name} url={`/surveys/${data.form.handle}`} />
      <Wrapper>
        <Heading>
          {translate('{count} Responses', { count: data.form.submissions })}
          <small>
            ({translate('{count} questions', { count: data.results.length })})
          </small>
        </Heading>

        {data.results.map((fieldResults, index) => (
          <Block
            key={fieldResults.field.id}
            {...fieldResults}
            responses={data.form.submissions}
            bulletin={index + 1}
          />
        ))}
      </Wrapper>
    </>
  );
};
