import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { TooltipProps } from 'react-tippy';
import { Tooltip } from 'react-tippy';
import { FlexRow } from '@components/layout/blocks/flex';
import { Truncate } from '@components/layout/blocks/truncate';
import config, { Edition } from '@config/freeform/freeform.config';
import { useSiteContext } from '@ff-client/contexts/site/site.context';
import { QKGroups } from '@ff-client/queries/form-groups';
import { useFMFormStatsQuery } from '@ff-client/queries/form-monitor';
import { QKForms } from '@ff-client/queries/forms';
import type { TestStats } from '@ff-client/types/form-monitor';
import type { FormWithStats } from '@ff-client/types/forms';
import translate from '@ff-client/utils/translations';
import ArchiveIcon from '@ff-icons/actions/archive.svg';
import CloneIcon from '@ff-icons/actions/clone.svg';
import CrossIcon from '@ff-icons/actions/delete.svg';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { useDeleteFormModal } from '../../modals/hooks/use-delete-form-modal';
import {
  FormMonitorStats,
  getLastTestStatus,
} from '../grid/card/card.monitor.stats';
import { ErrorMessage } from '../grid/card/card.monitor.stats.styles';
import { ControlButton } from '../grid/card/card.styles';
import {
  useArchiveFormMutation,
  useCloneFormMutation,
} from '../grid/grid.mutations';

import { SampleSkeleton } from './list.table.row.loading';

const tooltipProps: Omit<TooltipProps, 'children'> = {
  position: 'top',
  animation: 'fade',
  delay: [100, 0] as unknown as number,
};

type Props = {
  form: FormWithStats;
  hasFormMonitor: boolean;
};

export const ListTableRow: React.FC<Props> = ({ form, hasFormMonitor }) => {
  const isLiteAndUp = config.editions.isAtLeast(Edition.Lite);
  const archiveMutation = useArchiveFormMutation();
  const cloneMutation = useCloneFormMutation();

  const queryClient = useQueryClient();
  const { getCurrentHandleWithFallback } = useSiteContext();
  const openDeleteFormModal = useDeleteFormModal({ form });

  const { canDelete } = config.metadata.freeform;

  const { id, name, handle, description, settings, dateArchived, formMonitor } =
    form;
  const color = settings.general.color;

  const hasTitleLink = form.links.some(({ type }) => type === 'title');
  const submissionLink = form.links.find(
    (link) => link.handle === 'submissions'
  );
  const spamLink = form.links.find((link) => link.handle === 'spam');
  const formMonitorLink = form.links.find(({ type }) => type === 'formMonitor');

  const { data: formMonitorStats, isLoading: isStatsLoading } =
    useFMFormStatsQuery(form.id, {
      enabled: formMonitor?.enabled === true,
    });

  return (
    <tr>
      <td>
        {hasTitleLink && (
          <Link to={`${id}`}>
            <Truncate size={250}>{name}</Truncate>
          </Link>
        )}
        {!hasTitleLink && <Truncate size={250}>{name}</Truncate>}
      </td>
      <td>
        <code>
          <Truncate size={150}>{handle}</Truncate>
        </code>
      </td>
      <td>
        <Truncate size={400}>{description}</Truncate>
      </td>
      <td>
        <ResponsiveContainer width={200} height={20}>
          <AreaChart
            data={form.chartData}
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          >
            <defs>
              <linearGradient
                id={`color${form.id}`}
                x1={0}
                y1={0}
                x2={0}
                y2={1}
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={'uv'}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={1}
              fillOpacity={0.7}
              fill={`url(#color${form.id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </td>
      {hasFormMonitor && (
        <>
          <td>
            {formMonitor?.enabled && formMonitorLink && (
              <NavLink to={formMonitorLink.url}>
                {isStatsLoading ? (
                  <SampleSkeleton />
                ) : formMonitorStats?.error ? (
                  <ErrorMessage>{formMonitorStats.error.message}</ErrorMessage>
                ) : formMonitorStats ? (
                  <FormMonitorStats
                    formMonitor={{
                      ...formMonitorStats,
                      enabled: formMonitor?.enabled,
                    }}
                    align="left"
                    width="100%"
                    size="sm"
                  />
                ) : null}
              </NavLink>
            )}
          </td>
          <td>
            {formMonitor?.enabled && formMonitorLink && (
              <NavLink to={formMonitorLink.url}>
                {isStatsLoading ? (
                  <SampleSkeleton />
                ) : formMonitorStats?.error ? (
                  <ErrorMessage>{formMonitorStats.error.message}</ErrorMessage>
                ) : formMonitorStats ? (
                  getLastTestStatus(
                    {
                      ...formMonitorStats,
                      enabled: formMonitor?.enabled,
                    } as TestStats & { enabled: boolean },
                    'lg'
                  )
                ) : null}
              </NavLink>
            )}
          </td>
        </>
      )}
      <td>
        {!!submissionLink && (
          <a href={submissionLink.url}>{submissionLink.count}</a>
        )}
      </td>
      <td>{!!spamLink && <a href={spamLink.url}>{spamLink.count}</a>}</td>
      <td>
        <FlexRow>
          {isLiteAndUp && (
            <Tooltip title={translate('Duplicate this Form')} {...tooltipProps}>
              <ControlButton onClick={() => cloneMutation.mutate(id)}>
                <CloneIcon />
              </ControlButton>
            </Tooltip>
          )}
          {isLiteAndUp && !dateArchived && (
            <Tooltip title={translate('Archive this Form')} {...tooltipProps}>
              <ControlButton onClick={() => archiveMutation.mutate(id)}>
                <ArchiveIcon />
              </ControlButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title={translate('Delete this Form')} {...tooltipProps}>
              <ControlButton
                onClick={async (event) => {
                  if (event.metaKey && event.shiftKey) {
                    await axios.post(`/api/forms/delete`, { id });
                    queryClient.invalidateQueries({
                      queryKey: QKGroups.all(getCurrentHandleWithFallback()),
                    });
                    queryClient.invalidateQueries({
                      queryKey: QKForms.all(getCurrentHandleWithFallback()),
                    });
                  } else {
                    openDeleteFormModal();
                  }
                }}
              >
                <CrossIcon />
              </ControlButton>
            </Tooltip>
          )}
        </FlexRow>
      </td>
    </tr>
  );
};
