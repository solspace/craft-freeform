import React from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';

import { Chart } from './chart/chart';
import { ResultList } from './result-list/result-list';
import { ResultsLoadingSkeleton } from './results.loading';
import {
  useQuerySurveyChart,
  useQuerySurveyPreferences,
  useQuerySurveyResults,
} from './results.queries';
import { ResultsWrapper } from './results.styles';

export const SurveyResults: React.FC = () => {
  const { data: dataCharts, isFetching: isFetchingCharts } =
    useQuerySurveyChart();
  const { data: dataPrefs, isFetching: isFetchingPrefs } =
    useQuerySurveyPreferences();
  const { data: dataResults, isFetching: isFetchingResults } =
    useQuerySurveyResults();

  const isLoading =
    (isFetchingCharts || isFetchingPrefs || isFetchingResults) &&
    (!dataCharts || !dataPrefs || !dataResults);

  return (
    <>
      <Breadcrumb label={translate('Surveys')} url={'/forms'} />
      {isLoading && <ResultsLoadingSkeleton />}
      {!isLoading && (
        <div id="content-container">
          <div id="content" className="content-pane" style={{ padding: 0 }}>
            <ResultsWrapper $highlightHighest={true}>
              <Chart />
              <ResultList />
            </ResultsWrapper>
          </div>
        </div>
      )}
    </>
  );
};
