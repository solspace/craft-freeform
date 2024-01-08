import React from 'react';
import classes from '@ff-client/utils/classes';

import SettingsIcon from '../../../assets/icons/settings.svg';
import { Chart } from '../../results.types';

import { useSettingsMutation } from './block.settings.queries';
import {
  DropdownItem,
  DropdownWrapper,
  SettingsButton,
} from './block.settings.styles';

const chartOptions = Object.keys(Chart);

type Props = {
  fieldId: number;
  selectedChartType: Chart;
  isShown: boolean;
  toggle: () => void;
  changeType: (type: Chart) => void;
};

export const SettingsBlock: React.FC<Props> = ({
  fieldId,
  selectedChartType,
  isShown,
  toggle,
  changeType,
}) => {
  const { mutate, isLoading } = useSettingsMutation();

  return (
    <SettingsButton
      className={classes(isLoading && 'loading', isShown && 'open')}
      onClick={toggle}
    >
      <SettingsIcon />
      {isShown && (
        <DropdownWrapper>
          {chartOptions.map((type) => (
            <DropdownItem
              key={type}
              className={selectedChartType === type && 'selected'}
              onClick={() => {
                changeType(type as Chart);
                mutate({ fieldId, chartType: type as Chart });
              }}
            >
              {type}
            </DropdownItem>
          ))}
        </DropdownWrapper>
      )}
    </SettingsButton>
  );
};
