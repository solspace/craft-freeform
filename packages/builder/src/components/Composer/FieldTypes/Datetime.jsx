import PropTypes from 'prop-types';
import React from 'react';
import * as FieldTypes from '../../../constants/FieldTypes';
import Text from './Text';

export default class Datetime extends Text {
  static propTypes = {
    ...Text.propTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      value: PropTypes.string,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      dateTimeType: PropTypes.string.isRequired,
      generatePlaceholder: PropTypes.bool.isRequired,
      dateOrder: PropTypes.string.isRequired,
      date4DigitYear: PropTypes.bool.isRequired,
      dateLeadingZero: PropTypes.bool.isRequired,
      dateSeparator: PropTypes.string.isRequired,
      clock24h: PropTypes.bool.isRequired,
      clockSeparator: PropTypes.string.isRequired,
      clockAMPMSeparate: PropTypes.bool,
    }).isRequired,
  };

  getClassName() {
    return 'Datetime';
  }

  constructor(props, context) {
    super(props, context);

    this.getFormat = this.getFormat.bind(this);
    this.getHumanReadableFormat = this.getHumanReadableFormat.bind(this);
  }

  getType() {
    return FieldTypes.TEXT;
  }

  renderInput() {
    const {
      properties: { generatePlaceholder },
    } = this.props;

    let cleanProps = this.getCleanProperties();

    if (generatePlaceholder) {
      cleanProps.placeholder = this.getHumanReadableFormat();
    }

    return <input readOnly={true} className={this.prepareInputClass()} type={this.getType()} {...cleanProps} />;
  }

  /**
   * Converts Y/m/d to YYYY/MM/DD, etc
   *
   * @returns {string}
   */
  getHumanReadableFormat() {
    const format = this.getFormat();

    return format
      .replace('Y', 'YYYY')
      .replace('y', 'YY')
      .replace('n', 'M')
      .replace('m', 'MM')
      .replace('j', 'D')
      .replace('d', 'DD')
      .replace('H', 'HH')
      .replace('h', 'H')
      .replace('G', 'HH')
      .replace('g', 'H')
      .replace('i', 'MM')
      .replace('A', 'TT')
      .replace('a', 'TT');
  }

  /**
   * Construct and return the date format based on chosen settings
   *
   * @returns {string}
   */
  getFormat() {
    const {
      properties: { dateTimeType },
    } = this.props;
    const {
      properties: { dateOrder, date4DigitYear, dateLeadingZero, dateSeparator },
    } = this.props;
    const {
      properties: { clock24h, clockSeparator, clockAMPMSeparate },
    } = this.props;

    let formatParts = [];

    const showDate = dateTimeType === FieldTypes.DATE_TIME_TYPE_BOTH || dateTimeType === FieldTypes.DATE_TIME_TYPE_DATE;
    const showTime = dateTimeType === FieldTypes.DATE_TIME_TYPE_BOTH || dateTimeType === FieldTypes.DATE_TIME_TYPE_TIME;

    if (showDate) {
      let month = dateLeadingZero ? 'm' : 'n',
        day = dateLeadingZero ? 'd' : 'j',
        year = date4DigitYear ? 'Y' : 'y';

      let first, second, third;

      switch (dateOrder) {
        case 'mdy':
          first = month;
          second = day;
          third = year;

          break;

        case 'dmy':
          first = day;
          second = month;
          third = year;

          break;

        case 'ymd':
          first = year;
          second = month;
          third = day;

          break;
      }

      formatParts.push(first + dateSeparator + second + dateSeparator + third);
    }

    if (showTime) {
      let hours,
        minutes = 'i',
        ampm;

      if (clock24h) {
        hours = 'H';
        ampm = '';
      } else {
        hours = 'g';
        ampm = (clockAMPMSeparate ? ' ' : '') + 'A';
      }

      formatParts.push(hours + clockSeparator + minutes + ampm);
    }

    return formatParts.join(' ');
  }
}
