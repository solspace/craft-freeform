import { translate } from '@ff/builder/app';

const validProperties = [
  'hash',
  'id',
  'handle',
  'label',
  'required',
  'value',
  'checked',
  'placeholder',
  'instructions',
  'values',
  'options',
  'showAsRadio',
  'showAsCheckboxes',
  'notificationId',
  'assetSourceId',
  'integrationId',
  'resourceId',
  'emailFieldHash',
  'position',
  'labelNext',
  'labelPrev',
  'disablePrev',
  'mapping',
  'fileKinds',
  'maxFileSizeKB',
  'defaultUploadLocation',
  'fileCount',
  'rows',
  'showCustomValues',
  'source',
  'name',
  'type',
  'storeData',
  'dateTimeType',
  'generatePlaceholder',
  'dateOrder',
  'date4DigitYear',
  'dateLeadingZero',
  'dateSeparator',
  'clock24h',
  'clockSeparator',
  'clockAMPMSeparate',
  'useDatepicker',
  'minDate',
  'maxDate',
  'minLength',
  'maxLength',
  'minValue',
  'maxValue',
  'decimalCount',
  'decimalSeparator',
  'thousandsSeparator',
  'allowNegative',
  'pattern',
  'targetFieldHash',
  'color',
  'borderColor',
  'initialValue',
  'message',
  'colorIdle',
  'colorHover',
  'colorSelected',
  'source',
  'target',
  'configuration',
  'children',
  'layout',
  'paymentType',
  'currency',
  'paymentFieldMapping',
  'customerFieldMapping',
  'oneLine',
  'inputAttributes',
  'labelAttributes',
  'errorAttributes',
  'instructionAttributes',
  'tagAttributes',
  'width',
  'height',
  'showClearButton',
  'borderColor',
  'backgroundColor',
  'penColor',
  'penDotSize',
  'maxRows',
  'tableLayout',
  'useScript',
  'description',
  'step',
  'twig',
  'accent',
  'theme',
  'url',
  'isHCaptcha',
  'locale',
];

export default class PropertyHelper {
  static getProperties(hash, store) {
    const state = store.getState();
    const propertyList = state.composer.properties;

    if (propertyList[hash]) {
      return propertyList[hash];
    }

    return null;
  }

  static getCleanProperties(properties) {
    let cleanProps = {};
    for (let key in properties) {
      if (!properties.hasOwnProperty(key)) {
        continue;
      }
      if (validProperties.indexOf(key) === -1) {
        continue;
      }

      cleanProps[key] = properties[key];
    }

    return cleanProps;
  }

  /**
   * Parses notifications and generates an option list
   *
   * @param notifications
   * @returns {Array}
   */
  static getNotificationList(notifications) {
    const dbNotificationList = [];
    const templateNotificationList = [];
    const notificationList = [];

    notifications.forEach((notification) => {
      if (notification.id) {
        dbNotificationList.push({
          key: notification.id,
          value: notification.name,
        });
      } else if (notification.handle) {
        templateNotificationList.push({
          key: notification.handle,
          value: notification.name,
        });
      }
    });

    dbNotificationList.sort((a, b) => a.value.localeCompare(b.value));
    templateNotificationList.sort((a, b) => a.value.localeCompare(b.value));

    if (dbNotificationList.length) {
      notificationList.push({
        label: translate('Database Templates'),
        options: dbNotificationList,
      });
    }

    if (templateNotificationList.length) {
      notificationList.push({
        label: translate('File Templates'),
        options: templateNotificationList,
      });
    }

    return notificationList;
  }
}

export const pageIndex = (key) => parseInt(key.replace(/^page(\d+)$/, '$1'));
export const pageKey = (index) => `page${index}`;
