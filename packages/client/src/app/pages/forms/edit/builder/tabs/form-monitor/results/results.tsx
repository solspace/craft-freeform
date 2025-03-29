import React, { useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import type { TooltipProps } from 'react-tippy';
import { Tooltip } from 'react-tippy';
import { RemoveButton } from '@components/elements/remove-button/remove';
import { useHover } from '@ff-client/hooks/use-hover';
import type { FormTestsResponse } from '@ff-client/types/form-monitor';
import translate from '@ff-client/utils/translations';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { FormMonitorDetailsLoader } from '../form-monitor.loader';
import { ScreenshotModal } from '../form-monitor.screenshot.modal';
import { DeleteTestModal } from '../form-monitor.test.delete';
import { StatusDot, StatusIndicator } from '../monitor.styles';

import {
  ChartContainer,
  DotsContainer,
  NoResults,
  PageButton,
  PageInfo,
  PaginationContainer,
  PaginationNav,
  ResponseBlock,
  ResultsWrapper,
  StatsContainer,
  TableHeader,
  TableTestList,
  TestDescription,
  TestDot,
  TestTableStyled,
  TestTooltip,
  TestTooltipContent,
  TestTooltipHeader,
} from './results.styles';

type FormMonitorContext = {
  formTestsQuery: UseQueryResult<FormTestsResponse, AxiosError>;
};

type ScreenshotModalState = {
  url: string;
  testId: number;
} | null;

type DeleteModalState = {
  formId: number;
  testId: number;
} | null;

type TestRowProps = {
  test: FormTestsResponse['tests'][0];
  formId: number;
  onDelete: (data: DeleteModalState) => void;
  onScreenshot: (data: ScreenshotModalState) => void;
};

const tooltipProps: Omit<TooltipProps, 'children'> = {
  position: 'top',
  animation: 'fade',
  delay: [100, 0] as unknown as number,
};

const TestRow: React.FC<TestRowProps> = ({
  test,
  formId,
  onDelete,
  onScreenshot,
}) => {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const isHovering = useHover(rowRef);
  const dateString = test.dateCompleted || test.dateAttempted;

  return (
    <tr ref={rowRef}>
      <td className="no-break">{test.id}</td>
      <td className="no-break" title={dateString}>
        {dateString}
      </td>
      <td className="no-break">
        <StatusIndicator $status={test.status} $size="sm">
          <StatusDot $size="lg" />
          {translate(test.status.toUpperCase())}
        </StatusIndicator>
      </td>
      <td className="code" title={test.response}>
        {!!test.response && <ResponseBlock>{test.response}</ResponseBlock>}
      </td>
      <td>
        {test.screenshot && test.status !== 'success' && (
          <button
            onClick={() =>
              onScreenshot({
                url: test.screenshot!,
                testId: test.id,
              })
            }
            className="view-screenshot-btn"
          >
            {translate('View Screenshot')}
          </button>
        )}
      </td>
      <td>
        <Tooltip title={translate('Delete Test')} {...tooltipProps}>
          <RemoveButton
            active={isHovering}
            onClick={() =>
              onDelete({
                formId,
                testId: test.id,
              })
            }
          />
        </Tooltip>
      </td>
    </tr>
  );
};

export const FMResults: React.FC = () => {
  const { formTestsQuery } = useOutletContext<FormMonitorContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const [selectedScreenshot, setSelectedScreenshot] =
    React.useState<ScreenshotModalState>(null);
  const [testToDelete, setTestToDelete] =
    React.useState<DeleteModalState>(null);

  const { data: formTests, isLoading, isFetching, refetch } = formTestsQuery;

  if (isLoading || isFetching) {
    return <FormMonitorDetailsLoader />;
  }

  if (!formTests || !formTests.tests) {
    return (
      <ResultsWrapper>
        <NoResults>
          <p>{translate('No test results available.')}</p>
        </NoResults>
      </ResultsWrapper>
    );
  }

  if (formTests.tests.length === 0) {
    return (
      <ResultsWrapper>
        <NoResults>
          <p>{translate('No test results have been recorded yet.')}</p>
        </NoResults>
      </ResultsWrapper>
    );
  }

  // Get the last 50 tests
  const last50Tests = formTests.tests.slice(0, 50);
  const failedTestsCount = last50Tests.filter(
    (test) => test.status === 'failed'
  ).length;

  const handlePageChange = (page: number): void => {
    setSearchParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pagination = formTests.pagination || {
    total: 0,
    limit: 100,
    offset: 0,
    totalPages: 1,
  };

  return (
    <ResultsWrapper>
      <StatsContainer>
        <ChartContainer>
          <h3>{translate('Last 50 Tests')}</h3>
          <TestDescription>
            {translate(`In the most recent 50 tests, a total of `)}
            <strong>{failedTestsCount}</strong>
            {translate(` tests have failed for this form.`)}
          </TestDescription>
          <DotsContainer>
            {last50Tests.map((test) => (
              <Tooltip
                key={test.id}
                html={
                  <TestTooltip>
                    <TestTooltipHeader>
                      <StatusIndicator $status={test.status} $size="sm">
                        <StatusDot $size="md" />
                        {translate(test.status.toUpperCase())}
                      </StatusIndicator>
                    </TestTooltipHeader>
                    <TestTooltipContent>
                      <div className="test-id">Test: {test.id}</div>
                      <div className="test-date">{test.dateAttempted}</div>
                      {test.response && (
                        <div className="test-response">{test.response}</div>
                      )}
                    </TestTooltipContent>
                  </TestTooltip>
                }
                theme="light"
                animation="fade"
                arrow={true}
                duration={200}
                size="small"
                interactive
                interactiveBorder={0}
              >
                <TestDot $status={test.status} />
              </Tooltip>
            ))}
          </DotsContainer>
        </ChartContainer>
      </StatsContainer>

      <TableTestList>
        <TableHeader>
          <h3>{translate('Detailed Results')}</h3>
          <TestDescription>
            {translate(
              `A total of ${formTests.stats?.total || 0} tests have been conducted for this form.`
            )}
          </TestDescription>
        </TableHeader>

        <TestTableStyled>
          <thead>
            <tr>
              <th>{translate('Test ID')}</th>
              <th>{translate('Date')}</th>
              <th>{translate('Status')}</th>
              <th>{translate('Response')}</th>
              <th>{translate('Screenshot')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {formTests.tests.map((test) => (
              <TestRow
                key={test.id}
                test={test}
                formId={formTests.formId}
                onDelete={setTestToDelete}
                onScreenshot={setSelectedScreenshot}
              />
            ))}
          </tbody>
        </TestTableStyled>
      </TableTestList>

      {pagination.total > 100 && (
        <PaginationContainer>
          <PaginationNav aria-label="test results pagination">
            <PageButton
              className="prev-page"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title={translate('Previous Page')}
            />
            <PageButton
              className="next-page"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              title={translate('Next Page')}
            />
          </PaginationNav>
          <PageInfo>
            {translate('Showing')} {pagination.offset + 1}-
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{' '}
            {translate('of')} {pagination.total} {translate('tests')}
          </PageInfo>
        </PaginationContainer>
      )}

      {selectedScreenshot && (
        <ScreenshotModal
          imageUrl={selectedScreenshot.url}
          testId={selectedScreenshot.testId}
          onClose={() => setSelectedScreenshot(null)}
        />
      )}

      {testToDelete && (
        <DeleteTestModal
          formId={testToDelete.formId}
          testId={testToDelete.testId}
          onClose={() => setTestToDelete(null)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </ResultsWrapper>
  );
};
