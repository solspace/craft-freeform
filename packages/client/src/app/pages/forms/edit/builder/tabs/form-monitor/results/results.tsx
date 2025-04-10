import React, { useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import type { TooltipProps } from 'react-tippy';
import { Tooltip } from 'react-tippy';
import { RemoveButton } from '@components/elements/remove-button/remove';
import { useHover } from '@ff-client/hooks/use-hover';
import type {
  FormTest,
  FormTestsResponse,
  TestGroup,
} from '@ff-client/types/form-monitor';
import translate from '@ff-client/utils/translations';
import type { UseQueryResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { FormMonitorDetailsLoader } from '../form-monitor.loader';
import { ScreenshotModal } from '../form-monitor.screenshot.modal';
import { DeleteTestModal } from '../form-monitor.test.delete';
import { StatusDot, StatusIndicator } from '../monitor.styles';

import {
  ChartContainer,
  DailyTestsContainer,
  DayColumn,
  NoResults,
  NoTestsMessage,
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
  TestSegment,
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
  test: FormTest;
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
  const dateString = test.dateAttempted;

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

const DailyTestsChart: React.FC<{ groups: TestGroup[] }> = ({ groups }) => {
  // Take only the last 30 days
  const last30Days = groups.slice(0, 30);

  if (last30Days.length === 0) {
    return (
      <NoTestsMessage>
        {translate('No test results available for the last 30 days.')}
      </NoTestsMessage>
    );
  }

  // Find the maximum number of tests in any day
  const maxTestsPerDay = Math.max(
    ...last30Days.map((group) => group.tests.length),
    1
  );

  return (
    <DailyTestsContainer>
      {last30Days.map((group, index) => (
        <DailyTestColumn
          key={group.date}
          group={group}
          maxTests={maxTestsPerDay}
          isCurrentDay={index === 0}
        />
      ))}
    </DailyTestsContainer>
  );
};

const DailyTestColumn: React.FC<{
  group: TestGroup;
  maxTests: number;
  isCurrentDay: boolean;
}> = ({ group, maxTests, isCurrentDay }) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(columnRef);

  const renderTooltipContent = (test: FormTest): React.JSX.Element => (
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
        {test.response && <div className="test-response">{test.response}</div>}
      </TestTooltipContent>
    </TestTooltip>
  );

  const segmentHeight = 100 / maxTests;
  const activeTests = group.tests || [];
  const remainingSegments = isCurrentDay ? maxTests - activeTests.length : 0;

  if (group.isInactive) {
    return (
      <DayColumn ref={columnRef}>
        <Tooltip
          html={
            <TestTooltip>
              <TestTooltipContent>
                <div>{translate('No tests on this day')}</div>
                <div className="test-date">{group.date}</div>
              </TestTooltipContent>
            </TestTooltip>
          }
          position="top"
          theme="light"
          animation="fade"
          arrow
          duration={100}
          distance={10}
          size="small"
          hideOnClick={false}
          followCursor
        >
          <TestSegment
            $status="inactive"
            $height={100}
            $offset={0}
            $isLast={true}
            $isHovering={isHovering}
            $isPending={false}
          />
        </Tooltip>
      </DayColumn>
    );
  }

  // Reverse the tests array so the most recent tests appear at the top
  const testsToDisplay = [...activeTests].reverse();

  return (
    <DayColumn ref={columnRef}>
      {testsToDisplay.map((test, index) => (
        <Tooltip
          key={test.id}
          html={renderTooltipContent(test)}
          position="bottom"
          theme="light"
          animation="fade"
          duration={100}
          distance={-15}
          size="small"
          hideOnClick={false}
          followCursor
        >
          <TestSegment
            key={test.id}
            $status={test.status}
            $height={segmentHeight}
            $offset={index * segmentHeight}
            $isLast={
              index === testsToDisplay.length - 1 && remainingSegments === 0
            }
            $isHovering={isHovering}
            $isPending={false}
          />
        </Tooltip>
      ))}

      {remainingSegments > 0 &&
        Array.from({ length: remainingSegments }).map((_, index) => (
          <TestSegment
            key={`pending-${index}`}
            $status="inactive"
            $height={segmentHeight}
            $offset={(testsToDisplay.length + index) * segmentHeight}
            $isLast={index === remainingSegments - 1}
            $isHovering={isHovering}
            $isPending={true}
          />
        ))}
    </DayColumn>
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

  const ITEMS_PER_PAGE = 100;

  if (isLoading || isFetching) {
    return <FormMonitorDetailsLoader />;
  }

  if (!formTests || !formTests.tests) {
    return (
      <ResultsWrapper>
        <NoResults>
          <p>{translate('Form Monitor is not enabled for this form.')}</p>
        </NoResults>
      </ResultsWrapper>
    );
  }

  if (formTests?.stats?.total === 0 && formTests?.fmFormStats?.enabled) {
    return (
      <ResultsWrapper>
        <NoResults>
          <p>
            {translate(
              'This form is awaiting its first scan. This could take several hours.'
            )}
          </p>
        </NoResults>
      </ResultsWrapper>
    );
  }

  const handlePageChange = (page: number): void => {
    setSearchParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate total tests across all groups
  const allTests = formTests.tests.flatMap((group) => group.tests);
  const totalTests = allTests.length;
  const totalPages = Math.ceil(totalTests / ITEMS_PER_PAGE);

  // Get paginated tests
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTests = allTests.slice(startIndex, endIndex);

  return (
    <ResultsWrapper>
      <StatsContainer>
        <ChartContainer>
          <h3>{translate('Last 30 Days')}</h3>
          <TestDescription>
            {translate(
              `Of the ${formTests.stats?.total || 0} tests that have occurred in the last 30 days, ` +
                `${formTests.stats?.failed || 0} ${formTests.stats?.failed === 1 ? 'test has' : 'tests have'} failed for this form.`
            )}
          </TestDescription>
          <DailyTestsChart groups={formTests.tests} />
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
            {paginatedTests.map((test) => (
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

      {totalTests > ITEMS_PER_PAGE && (
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
              disabled={currentPage === totalPages}
              title={translate('Next Page')}
            />
          </PaginationNav>
          <PageInfo>
            {translate('Showing')} {startIndex + 1}-
            {Math.min(endIndex, totalTests)} {translate('of')} {totalTests}{' '}
            {translate('tests')}
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
