import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { translate } from '../../../../app';
import { CheckboxListProperty, CheckboxProperty, SelectProperty } from '../../PropertyItems';
import ConnectionBase from './ConnectionBase';

@connect((state) => ({
  calendarList: state.sourceTargets.calendar,
}))
export default class CalendarEvents extends ConnectionBase {
  static propTypes = {
    ...ConnectionBase.propTypes,
    calendarList: PropTypes.array,
  };

  getResetWaterfall = () => ['calendar'];

  getSpecificCraftFields = () => {
    return [
      { handle: 'title', name: translate('Title', {}, 'app') },
      { handle: 'startDate', name: translate('Start Date', {}, 'app') },
      { handle: 'endDate', name: translate('End Date', {}, 'app') },
      { handle: 'allDay', name: translate('All Day', {}, 'app') },
    ];
  };

  getCraftFieldLayoutFieldIds = () => {
    const {
      connection: { calendar = null },
    } = this.props;

    const selectedCalendar = this.props.calendarList.find((item) => item.key == calendar);

    return selectedCalendar ? selectedCalendar.fieldLayoutFieldIds : [];
  };

  render() {
    const { calendarList, connection } = this.props;
    let { calendar, disabled, allDay } = connection;

    return (
      <div>
        <SelectProperty
          label="Calendar"
          name="calendar"
          value={calendar}
          emptyOption="Select a calendar"
          options={calendarList}
          onChangeHandler={this.updateSelection}
        />

        {!!calendar && (
          <CheckboxProperty
            label="Disable events?"
            instructions="The event will be set to disabled upon creation if this is checked. Will be set to enabled otherwise."
            name="disabled"
            checked={!!disabled}
            onChangeHandler={this.updateSelection}
          />
        )}
        {!!calendar && (
          <CheckboxProperty
            label="All day?"
            instructions="Specifies whether the events should be set to 'All Day' or not."
            name="allDay"
            checked={!!allDay}
            onChangeHandler={this.updateSelection}
          />
        )}

        {calendar && this.getFieldMapping()}
      </div>
    );
  }
}
