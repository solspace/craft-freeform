import React from 'react';
import { TEXT } from '../../../constants/FieldTypes';
import Badge from './Components/Badge';
import Text from './Text';

export default class Hidden extends Text {
  getClassName() {
    return 'Hidden';
  }

  getType() {
    return TEXT;
  }
}
