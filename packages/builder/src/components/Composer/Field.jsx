import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translate } from '../../app';
import Checkbox from './FieldTypes/CheckboxField';
import CheckboxGroup from './FieldTypes/CheckboxGroup';
import Confirmation from './FieldTypes/Confirmation';
import Datetime from './FieldTypes/Datetime';
import DynamicRecipients from './FieldTypes/DynamicRecipients';
import Email from './FieldTypes/Email';
import File from './FieldTypes/File';
import Hidden from './FieldTypes/Hidden';
import Html from './FieldTypes/Html';
import Invisible from './FieldTypes/Invisible';
import OpinionScale from './FieldTypes/OpinionScale';
import RichText from './FieldTypes/RichText';
import MailingList from './FieldTypes/MailingList';
import MultipleSelect from './FieldTypes/MultipleSelect';
import Number from './FieldTypes/Number';
import Password from './FieldTypes/Password';
import Phone from './FieldTypes/Phone';
import RadioGroup from './FieldTypes/RadioGroup';
import Rating from './FieldTypes/Rating';
import Recaptcha from './FieldTypes/Recaptcha';
import Regex from './FieldTypes/Regex';
import Select from './FieldTypes/Select';
import Signature from './FieldTypes/Signature';
import Submit from './FieldTypes/Submit';
import Text from './FieldTypes/Text';
import Textarea from './FieldTypes/Textarea';
import Table from './FieldTypes/Table';
import Website from './FieldTypes/Website';
import CreditCardDetails from './FieldTypes/CreditCardDetails';
import CreditCardNumber from './FieldTypes/CreditCardNumber';
import CreditCardCvc from './FieldTypes/CreditCardCvc';
import CreditCardExpDate from './FieldTypes/CreditCardExpDate';

const fieldTypes = {
  checkbox: Checkbox,
  checkbox_group: CheckboxGroup,
  text: Text,
  textarea: Textarea,
  email: Email,
  hidden: Hidden,
  html: Html,
  rich_text: RichText,
  submit: Submit,
  radio_group: RadioGroup,
  select: Select,
  multiple_select: MultipleSelect,
  dynamic_recipients: DynamicRecipients,
  mailing_list: MailingList,
  file: File,
  datetime: Datetime,
  number: Number,
  phone: Phone,
  rating: Rating,
  website: Website,
  regex: Regex,
  confirmation: Confirmation,
  recaptcha: Recaptcha,
  password: Password,
  opinion_scale: OpinionScale,
  signature: Signature,
  table: Table,
  invisible: Invisible,
  cc_details: CreditCardDetails,
  cc_number: CreditCardNumber,
  cc_cvc: CreditCardCvc,
  cc_exp_date: CreditCardExpDate,
};

export default class Field extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      id: PropTypes.number,
      placeholder: PropTypes.string,
    }).isRequired,
    hash: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    rowIndex: PropTypes.number.isRequired,
    duplicateHandles: PropTypes.array.isRequired,
  };

  static childContextTypes = {
    hash: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    rowIndex: PropTypes.number.isRequired,
  };

  getChildContext = () => ({
    hash: this.props.hash,
    index: this.props.index,
    rowIndex: this.props.rowIndex,
  });

  render() {
    const { hash, type, properties, duplicateHandles } = this.props;

    if (fieldTypes[type]) {
      const DynamicClassName = fieldTypes[type];

      return <DynamicClassName hash={hash} properties={properties} duplicateHandles={duplicateHandles} />;
    }

    return <div>{translate(`Field type "${type}" not found`)}</div>;
  }
}
