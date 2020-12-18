import React from 'react';
import { TEXT } from '../../../constants/FieldTypes';
import Badge from './Components/Badge';
import Text from './Text';

export default class Invisible extends Text {
  getClassName() {
    return 'Invisible';
  }

  getType() {
    return TEXT;
  }
}
