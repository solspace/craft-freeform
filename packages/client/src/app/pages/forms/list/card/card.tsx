import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { TooltipProps } from 'react-tippy';
import { Tooltip } from 'react-tippy';
import { useCheckOverflow } from '@ff-client/hooks/use-check-overflow';
import type { Form } from '@ff-client/types/forms';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import { addDays, format } from 'date-fns';
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

type ChartDataItem = { value: number };

type Props = {
  form: Form;
  chartDataset?: ChartDataItem[];
  counters: {
    submissions: number;
    spam: number;
  };
};

const tooltipProps: Omit<TooltipProps, 'children'> = {
  position: 'top',
  animation: 'fade',
  delay: [1500, 0] as unknown as number,
};

export const Card: React.FC<Props> = ({ form, chartDataset, counters }) => {
  const mutation = useDeleteFormMutation();
  const navigate = useNavigate();

  const [titleRef, isTitleOverflowing] = useCheckOverflow<HTMLHeadingElement>();
  const [descriptionRef, isDescriptionOverflowing] =
    useCheckOverflow<HTMLSpanElement>();

  const testData = Array.from({ length: 31 }, (_, index) => {
    const date = addDays(new Date(2023, 6, 1), index); // 6 for July (0-indexed)

    return {
      name: format(date, 'yyyy-MM-dd'),
      value: randomSubmissions(0, Math.random() > 0.9 ? 50 : 20), // 15% chance for peak day
    };
  });

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
          <ControlButton>
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
            <NavLink to={generateUrl(`freeform/submissions/${form.handle}`)}>
              {counters.submissions} {translate('Submissions')}
            </NavLink>
          </li>
          <li>
            <NavLink to={generateUrl(`freeform/spam/${form.handle}`)}>
              {counters.spam} {translate('Spam')}
            </NavLink>
          </li>
        </LinkList>
      </CardBody>

      <ResponsiveContainer width="100%" height={40}>
        <AreaChart
          data={chartDataset || testData}
          margin={{ top: 2, bottom: 3, left: 0, right: 0 }}
        >
          <Area
            type="monotone"
            dataKey={'value'}
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
