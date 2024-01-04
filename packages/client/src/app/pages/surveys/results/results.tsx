import React from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';

import { Chart } from './chart/chart';
import { ResultList } from './result-list/result-list';
import { ResultsWrapper } from './results.styles';

export const SurveyResults: React.FC = () => {
  return (
    <>
      <Breadcrumb label={translate('Surveys')} url={'/forms'} />
      <div id="content-container">
        <div id="content" className="content-pane" style={{ padding: 0 }}>
          <ResultsWrapper $highlightHighest={true}>
            <Chart />
            <ResultList />
          </ResultsWrapper>
        </div>
      </div>
    </>
  );
};
