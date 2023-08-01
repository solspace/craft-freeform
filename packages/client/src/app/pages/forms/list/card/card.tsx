import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TooltipProps } from 'react-tippy';
import { Tooltip } from 'react-tippy';
import { useCheckOverflow } from '@ff-client/hooks/use-check-overflow';
import type { FormWithStats } from '@ff-client/queries/forms';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { useDeleteFormMutation } from '../list.mutations';

import CloneIcon from './icons/clone.svg';
import CrossIcon from './icons/cross.svg';
import MoveIcon from './icons/move.svg';
import {
  CardBody,
  CardWrapper,
  ControlButton,
  Controls,
  LinkList,
  PaddedChartFooter,
  Subtitle,
  Title,
} from './card.styles';

const randomSubmissions = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type Props = {
  form: FormWithStats;
};

const tooltipProps: Omit<TooltipProps, 'children'> = {
  position: 'top',
  animation: 'fade',
  delay: [1500, 0] as unknown as number,
};

export const Card: React.FC<Props> = ({ form }) => {
  const mutation = useDeleteFormMutation();
  const navigate = useNavigate();

  const [titleRef, isTitleOverflowing] = useCheckOverflow<HTMLHeadingElement>();
  const [descriptionRef, isDescriptionOverflowing] =
    useCheckOverflow<HTMLSpanElement>();

  const randomData = Array.from({ length: 31 }, () => ({
    uv: randomSubmissions(0, Math.random() > 0.9 ? 50 : 20), // 15% chance for peak day
  }));

  const { id, name, settings } = form;
  const { color, description } = settings.general;

  return (
    <CardWrapper $disabled={mutation.isLoading && mutation.context === id}>
      <Controls>
        <Tooltip title={translate('Move')} {...tooltipProps}>
          <ControlButton>
            <MoveIcon />
          </ControlButton>
        </Tooltip>
        <Tooltip title={translate('Duplicate this Form')} {...tooltipProps}>
          <ControlButton>
            <CloneIcon />
          </ControlButton>
        </Tooltip>
        <Tooltip title={translate('Delete this Form')} {...tooltipProps}>
          <ControlButton
            onClick={() => {
              if (
                confirm(translate('Are you sure you want to delete this form?'))
              ) {
                mutation.mutate(id);
              }
            }}
          >
            <CrossIcon />
          </ControlButton>
        </Tooltip>
      </Controls>

      <CardBody>
        {isTitleOverflowing ? (
          <Tooltip title={name} {...tooltipProps}>
            <Title ref={titleRef} onClick={() => navigate(`${id}`)}>
              {name}
            </Title>
          </Tooltip>
        ) : (
          <Title ref={titleRef} onClick={() => navigate(`${id}`)}>
            {name}
          </Title>
        )}
        {!!description &&
          (isDescriptionOverflowing ? (
            <Tooltip title={description} {...tooltipProps}>
              <Subtitle ref={descriptionRef}>{description}</Subtitle>
            </Tooltip>
          ) : (
            <Subtitle ref={descriptionRef} title={description}>
              {description}
            </Subtitle>
          ))}

        <LinkList>
          <li>
            <a href={generateUrl(`submissions/${form.handle}`, false)}>
              {form.counters.submissions} {translate('Submissions')}
            </a>
          </li>
          <li>
            <a href={generateUrl(`spam/${form.handle}`, false)}>
              {form.counters.spam} {translate('Spam')}
            </a>
          </li>
        </LinkList>
      </CardBody>

      <ResponsiveContainer width="100%" height={40}>
        <AreaChart
          data={form.chartData || randomData}
          margin={{ top: 10, bottom: 3, left: 0, right: 0 }}
        >
          <Area
            type="monotone"
            dataKey={'uv'}
            stroke={color}
            strokeWidth={2.3}
            fillOpacity={0.3}
            fill={color}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <PaddedChartFooter $color={color} />
    </CardWrapper>
  );
};
