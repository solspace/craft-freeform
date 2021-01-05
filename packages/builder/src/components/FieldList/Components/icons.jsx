import React from 'react';
import checkbox_group from '../../../assets/icons/fieldtype-checkbox-group.svg';
import checkbox from '../../../assets/icons/fieldtype-checkbox.svg';
import confirmation from '../../../assets/icons/fieldtype-confirm.svg';
import cc_details from '../../../assets/icons/fieldtype-creditcard.svg';
import datetime from '../../../assets/icons/fieldtype-datetime.svg';
import dynamic_recipients from '../../../assets/icons/fieldtype-dynamic-recipients.svg';
import email from '../../../assets/icons/fieldtype-email.svg';
import file from '../../../assets/icons/fieldtype-file.svg';
import hidden from '../../../assets/icons/fieldtype-hidden.svg';
import invisible from '../../../assets/icons/fieldtype-hidden.svg';
import html from '../../../assets/icons/fieldtype-html.svg';
import mailing_list from '../../../assets/icons/fieldtype-mailing-list.svg';
import multiple_select from '../../../assets/icons/fieldtype-multiselect.svg';
import number from '../../../assets/icons/fieldtype-number.svg';
import opinion_scale from '../../../assets/icons/fieldtype-opinion-scale.svg';
import password from '../../../assets/icons/fieldtype-password.svg';
import phone from '../../../assets/icons/fieldtype-phone.svg';
import radio_group from '../../../assets/icons/fieldtype-radios.svg';
import rating from '../../../assets/icons/fieldtype-rating.svg';
import recaptcha from '../../../assets/icons/fieldtype-recaptcha.svg';
import regex from '../../../assets/icons/fieldtype-regex.svg';
import rich_text from '../../../assets/icons/fieldtype-richtext.svg';
import select from '../../../assets/icons/fieldtype-select.svg';
import signature from '../../../assets/icons/fieldtype-signature.svg';
import spam from '../../../assets/icons/fieldtype-spam.svg';
import submit from '../../../assets/icons/fieldtype-submit.svg';
import table from '../../../assets/icons/fieldtype-table.svg';
import text from '../../../assets/icons/fieldtype-text.svg';
import textarea from '../../../assets/icons/fieldtype-textarea.svg';
import website from '../../../assets/icons/fieldtype-website.svg';

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
