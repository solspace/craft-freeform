import React from 'react';
import checkbox_group from '@ff/builder/assets/icons/fieldtype-checkbox-group.svg';
import checkbox from '@ff/builder/assets/icons/fieldtype-checkbox.svg';
import confirmation from '@ff/builder/assets/icons/fieldtype-confirm.svg';
import cc_details from '@ff/builder/assets/icons/fieldtype-creditcard.svg';
import datetime from '@ff/builder/assets/icons/fieldtype-datetime.svg';
import dynamic_recipients from '@ff/builder/assets/icons/fieldtype-dynamic-recipients.svg';
import email from '@ff/builder/assets/icons/fieldtype-email.svg';
import file from '@ff/builder/assets/icons/fieldtype-file.svg';
import hidden from '@ff/builder/assets/icons/fieldtype-hidden.svg';
import invisible from '@ff/builder/assets/icons/fieldtype-hidden.svg';
import html from '@ff/builder/assets/icons/fieldtype-html.svg';
import mailing_list from '@ff/builder/assets/icons/fieldtype-mailing-list.svg';
import multiple_select from '@ff/builder/assets/icons/fieldtype-multiselect.svg';
import number from '@ff/builder/assets/icons/fieldtype-number.svg';
import opinion_scale from '@ff/builder/assets/icons/fieldtype-opinion-scale.svg';
import password from '@ff/builder/assets/icons/fieldtype-password.svg';
import phone from '@ff/builder/assets/icons/fieldtype-phone.svg';
import radio_group from '@ff/builder/assets/icons/fieldtype-radios.svg';
import rating from '@ff/builder/assets/icons/fieldtype-rating.svg';
import recaptcha from '@ff/builder/assets/icons/fieldtype-recaptcha.svg';
import regex from '@ff/builder/assets/icons/fieldtype-regex.svg';
import rich_text from '@ff/builder/assets/icons/fieldtype-richtext.svg';
import select from '@ff/builder/assets/icons/fieldtype-select.svg';
import signature from '@ff/builder/assets/icons/fieldtype-signature.svg';
import spam from '@ff/builder/assets/icons/fieldtype-spam.svg';
import submit from '@ff/builder/assets/icons/fieldtype-submit.svg';
import table from '@ff/builder/assets/icons/fieldtype-table.svg';
import text from '@ff/builder/assets/icons/fieldtype-text.svg';
import textarea from '@ff/builder/assets/icons/fieldtype-textarea.svg';
import website from '@ff/builder/assets/icons/fieldtype-website.svg';

const svgs = {
  text,
  textarea,
  hidden,
  file,
  email,
  checkbox,
  checkbox_group,
  confirmation,
  cc_details,
  datetime,
  dynamic_recipients,
  html,
  mailing_list,
  multiple_select,
  number,
  opinion_scale,
  password,
  phone,
  radio_group,
  rating,
  recaptcha,
  regex,
  rich_text,
  select,
  signature,
  spam,
  submit,
  website,
  invisible,
  table,
};

export const getIcon = (type) => {
  if (svgs[type]) {
    const ClassName = svgs[type];

    return <ClassName />;
  }

  return null;
};
