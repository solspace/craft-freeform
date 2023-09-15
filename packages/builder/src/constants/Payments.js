import { translate } from '../app';
import * as FieldTypes from './FieldTypes';

export const PLAN_DISPLAY_INTERVAL_DAILY = 'daily';
export const PLAN_DISPLAY_INTERVAL_WEEKLY = 'weekly';
export const PLAN_DISPLAY_INTERVAL_BIWEEKLY = 'biweekly';
export const PLAN_DISPLAY_INTERVAL_MONTHLY = 'monthly';
export const PLAN_DISPLAY_INTERVAL_ANNUALLY = 'annually';

export const PAYMENT_TYPE_SINGLE = 'single';
export const PAYMENT_TYPE_PREDEFINED_SUBSCRIPTION = 'predefined_subscription';
export const PAYMENT_TYPE_DYNAMIC_SUBSCRIPTION = 'dynamic_subscription';

export const PAYMENT_FIELD_AMOUNT = 'amount';
export const PAYMENT_FIELD_CURRENCY = 'currency';
export const PAYMENT_FIELD_INTERVAL = 'interval';
export const PAYMENT_FIELD_DESCRIPTION = 'description';
export const PAYMENT_FIELD_PLAN = 'plan';

export const NOTIFICATION_TYPE_CHARGE_SUCCEEDED = 'charge_success';
export const NOTIFICATION_TYPE_CHARGE_FAILED = 'charge_failed';
export const NOTIFICATION_TYPE_SUBSCRIPTION_CREATED = 'subscription_created';
export const NOTIFICATION_TYPE_SUBSCRIPTION_ENDED = 'subscription_ended';
export const NOTIFICATION_TYPE_SUBSCRIPTION_PAYMENT_SUCCEEDED = 'subscription_payment_succeeded';
export const NOTIFICATION_TYPE_SUBSCRIPTION_PAYMENT_FAILED = 'subscription_payment_failed';

export const PLAN_INTERVAL_OPTIONS = [
  { key: PLAN_DISPLAY_INTERVAL_DAILY, value: translate('Daily') },
  { key: PLAN_DISPLAY_INTERVAL_WEEKLY, value: translate('Weekly') },
  { key: PLAN_DISPLAY_INTERVAL_BIWEEKLY, value: translate('Biweekly') },
  { key: PLAN_DISPLAY_INTERVAL_MONTHLY, value: translate('Monthly') },
  { key: PLAN_DISPLAY_INTERVAL_ANNUALLY, value: translate('Annually') },
];

//TODO: add ability to make payment optional
export const PAYMENT_TYPE_OPTIONS = [
  { key: PAYMENT_TYPE_SINGLE, value: translate('Single payment') },
  { key: PAYMENT_TYPE_PREDEFINED_SUBSCRIPTION, value: translate('Predefined subscription plan') },
  { key: PAYMENT_TYPE_DYNAMIC_SUBSCRIPTION, value: translate('Customer defined subscription plan') },
];

export const PAYMENT_MAPPING_TYPES = [FieldTypes.NUMBER, FieldTypes.HIDDEN, FieldTypes.SELECT, FieldTypes.RADIO_GROUP];

export const CUSTOMER_MAPPING_TYPES = [
  FieldTypes.HIDDEN,
  FieldTypes.TEXT,
  FieldTypes.TEXTAREA,
  FieldTypes.SELECT,
  FieldTypes.MULTIPLE_SELECT,
  FieldTypes.RADIO_GROUP,
  FieldTypes.CHECKBOX,
  FieldTypes.CHECKBOX_GROUP,
  FieldTypes.EMAIL,
  FieldTypes.NUMBER,
  FieldTypes.REGEX,
  FieldTypes.CONFIRMATION,
  FieldTypes.PHONE,
];

export const PAYMENT_FIELD_MAPPING_MAP = {
  [PAYMENT_FIELD_AMOUNT]: {
    handle: PAYMENT_FIELD_AMOUNT,
    label: translate('Amount'),
    required: false,
    placeholder: translate('Fixed (see below)'),
  },
  [PAYMENT_FIELD_CURRENCY]: {
    handle: PAYMENT_FIELD_CURRENCY,
    label: translate('Currency'),
    required: false,
    placeholder: translate('Fixed (see below)'),
  },
  [PAYMENT_FIELD_INTERVAL]: {
    handle: PAYMENT_FIELD_INTERVAL,
    label: translate('Interval'),
    required: false,
    placeholder: translate('Fixed (see below)'),
  },
  [PAYMENT_FIELD_PLAN]: {
    handle: PAYMENT_FIELD_PLAN,
    label: translate('Plan'),
    required: false,
    placeholder: translate('Fixed (see below)'),
  },
};

export const PAYMENT_NOTIFICATIONS = [
  { key: NOTIFICATION_TYPE_CHARGE_SUCCEEDED, value: translate('Payment Succeeded Email') },
  { key: NOTIFICATION_TYPE_CHARGE_FAILED, value: translate('Payment Failed Email') },
];

export const SUBSCRIPTION_NOTIFICATIONS = [
  { key: NOTIFICATION_TYPE_SUBSCRIPTION_CREATED, value: translate('Subscription Created Email') },
  { key: NOTIFICATION_TYPE_SUBSCRIPTION_ENDED, value: translate('Subscription Ended Email') },
  { key: NOTIFICATION_TYPE_SUBSCRIPTION_PAYMENT_SUCCEEDED, value: translate('Payment Succeeded Email') },
  { key: NOTIFICATION_TYPE_SUBSCRIPTION_PAYMENT_FAILED, value: translate('Payment Failed Email') },
];
