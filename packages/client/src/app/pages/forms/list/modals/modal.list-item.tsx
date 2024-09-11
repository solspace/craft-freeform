import React, { useRef } from 'react';
import { useHover } from '@ff-client/hooks/use-hover';
import type { FormWithStats } from '@ff-client/types/forms';
import CrossIcon from '@ff-icons/actions/delete.svg';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import {
  FormDetails,
  Name,
  PaddedChartFooter,
  Remove,
  Wrapper,
} from './modal.list-item.styles';

type Props = {
  form: FormWithStats;
};

const randomSubmissions = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const FormItem: React.FC<Props> = ({ form }) => {
  const formItemRef = useRef<HTMLDivElement>(null);
  const hovering = useHover(formItemRef);

  const { id, name, settings, links } = form;
  const { color } = settings.general;

  const randomData = Array.from({ length: 31 }, () => ({
    uv: randomSubmissions(0, Math.random() > 0.9 ? 50 : 20),
  }));

  return (
    <Wrapper data-id={id} ref={formItemRef}>
      <FormDetails>
        <Name>{name}</Name>
        {links
          .filter(({ type }) => type === 'linkList')
          .map((link, idx) => (
            <span key={idx}>{link.label}</span>
          ))}
      </FormDetails>
      {hovering && (
        <Remove className="remove form-item-remove">
          <CrossIcon />
        </Remove>
      )}
      <ResponsiveContainer width="100%" height={23}>
        <AreaChart
          data={form.chartData || randomData}
          margin={{ top: 10, bottom: 3, left: 0, right: 0 }}
        >
          <defs>
            <linearGradient id={`color${id}`} x1={0} y1={0} x2={0} y2={1}>
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
            fill={`url(#color${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <PaddedChartFooter $color={color} />
    </Wrapper>
  );
};
