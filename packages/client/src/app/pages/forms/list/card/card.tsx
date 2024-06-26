import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { TooltipProps } from 'react-tippy';
import { Tooltip } from 'react-tippy';
import { useDeleteFormModal } from '@ff-client/app/pages/forms/list/modal/use-delete-form-modal';
import { useCheckOverflow } from '@ff-client/hooks/use-check-overflow';
import { type FormWithStats, QKForms } from '@ff-client/queries/forms';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import ArchiveIcon from '@ff-icons/actions/archive.svg';
import CloneIcon from '@ff-icons/actions/clone.svg';
import CrossIcon from '@ff-icons/actions/delete.svg';
import MoveIcon from '@ff-icons/actions/move.svg';
import { useQueryClient } from '@tanstack/react-query';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import {
  useArchiveFormMutation,
  useCloneFormMutation,
} from '../list.mutations';

import {
  CardBody,
  CardWrapper,
  ControlButton,
  Controls,
  LinkList,
  PaddedChartFooter,
  Subtitle,
  Title,
  TitleLink,
} from './card.styles';

const randomSubmissions = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type Props = {
  form: FormWithStats;
  isDraggingInProgress?: boolean;
};

const tooltipProps: Omit<TooltipProps, 'children'> = {
  position: 'top',
  animation: 'fade',
  delay: [100, 0] as unknown as number,
};

export const Card: React.FC<Props> = ({ form, isDraggingInProgress }) => {
  const archiveMutation = useArchiveFormMutation();
  const cloneMutation = useCloneFormMutation();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [titleRef, isTitleOverflowing] = useCheckOverflow<HTMLHeadingElement>();
  const [descriptionRef, isDescriptionOverflowing] =
    useCheckOverflow<HTMLSpanElement>();

  const randomData = Array.from({ length: 31 }, () => ({
    uv: randomSubmissions(0, Math.random() > 0.9 ? 50 : 20), // 15% chance for peak day
  }));

  const { id, name, dateArchived, settings } = form;
  const { color, description } = settings.general;

  const isArchiving =
    archiveMutation.isLoading && archiveMutation.context === id;
  const isSuccess = archiveMutation.isSuccess && archiveMutation.context === id;
  const isCloning = cloneMutation.isLoading && cloneMutation.context === id;
  const isDisabled = isCloning || isArchiving;

  const openDeleteFormModal = useDeleteFormModal({ form });

  const onNavigate = (): void => {
    queryClient.invalidateQueries(QKForms.single(Number(id)));
    navigate(`${id}`);
  };

  const hasTitleLink = form.links.filter(({ type }) => type === 'title').length;
  const linkList = form.links.filter(({ type }) => type === 'linkList');

  return (
    <CardWrapper
      data-id={form.id}
      className={classes(
        isDisabled && 'disabled',
        isSuccess && 'archived',
        isDraggingInProgress && 'dragging'
      )}
    >
      <Controls>
        <Tooltip title={translate('Move')} {...tooltipProps}>
          <ControlButton className="handle">
            <MoveIcon />
          </ControlButton>
        </Tooltip>
        <Tooltip title={translate('Duplicate this Form')} {...tooltipProps}>
          <ControlButton
            onClick={() => {
              cloneMutation.mutate(id);
            }}
          >
            <CloneIcon />
          </ControlButton>
        </Tooltip>
        {!dateArchived && (
          <Tooltip title={translate('Archive this Form')} {...tooltipProps}>
            <ControlButton
              onClick={() => {
                archiveMutation.mutate(id);
              }}
            >
              <ArchiveIcon />
            </ControlButton>
          </Tooltip>
        )}
        <Tooltip title={translate('Delete this Form')} {...tooltipProps}>
          <ControlButton onClick={openDeleteFormModal}>
            <CrossIcon />
          </ControlButton>
        </Tooltip>
      </Controls>

      <CardBody>
        {isTitleOverflowing ? (
          <Tooltip title={name} {...tooltipProps}>
            {hasTitleLink ? (
              <TitleLink ref={titleRef} onClick={onNavigate}>
                {name}
              </TitleLink>
            ) : (
              <Title ref={titleRef}>{name}</Title>
            )}
          </Tooltip>
        ) : hasTitleLink ? (
          <TitleLink ref={titleRef} onClick={onNavigate}>
            {name}
          </TitleLink>
        ) : (
          <Title ref={titleRef}>{name}</Title>
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

        {linkList.length > 0 && (
          <LinkList>
            {linkList.map((link, idx) =>
              link.internal ? (
                <NavLink key={idx} to={link.url}>
                  {link.label}
                </NavLink>
              ) : (
                <li key={idx}>
                  <a href={link.url}>{link.label}</a>
                </li>
              )
            )}
          </LinkList>
        )}
      </CardBody>

      <ResponsiveContainer width="100%" height={40}>
        <AreaChart
          data={form.chartData || randomData}
          margin={{ top: 10, bottom: 3, left: 0, right: 0 }}
        >
          <defs>
            <linearGradient id={`color${form.id}`} x1={0} y1={0} x2={0} y2={1}>
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
            fillOpacity={1}
            fill={`url(#color${form.id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <PaddedChartFooter $color={color} />
    </CardWrapper>
  );
};
