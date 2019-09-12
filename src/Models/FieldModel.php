<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Models;

use craft\base\Model;
use Solspace\Freeform\Fields\Pro\SignatureField;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExternalOptionsInterface;
use Solspace\Freeform\Library\Helpers\HashHelper;

class FieldModel extends Model implements \JsonSerializable
{
    const SMALL_DATA_STORAGE_LENGTH = 100;

    const PROPERTY_TYPE_BOOL = 'bool';
    const PROPERTY_TYPE_INT  = 'int';

    /** @var int */
    public $id;

    /** @var string */
    public $type;

    /** @var string */
    public $handle;

    /** @var string */
    public $label;

    /** @var bool */
    public $required;

    /** @var string */
    public $instructions;

    /** @var array */
    public $metaProperties;

    /**
     * @return FieldModel
     */
    public static function create(): FieldModel
    {
        $field           = new self();
        $field->type     = AbstractField::TYPE_TEXT;
        $field->required = false;

        return $field;
    }

    /**
     * @return string
     */
    public function getHash(): string
    {
        return HashHelper::hash($this->id);
    }

    /**
     * @param string $name
     * @param mixed  $defaultValue
     *
     * @return mixed|null
     */
    public function getMetaProperty($name, $defaultValue = null)
    {
        if (\is_array($this->metaProperties) && isset($this->metaProperties[$name])) {
            $value = $this->metaProperties[$name];

            if (null === $value) {
                return $defaultValue;
            }

            return $this->parseMetaProperty($name, $value);
        }

        return $defaultValue;
    }

    /**
     * @param string $name
     * @param mixed  $value
     *
     * @return $this
     */
    public function setMetaProperty($name, $value): FieldModel
    {
        $properties = $this->metaProperties ?? [];

        if (null === $value && isset($properties[$name])) {
            unset($properties[$name]);
        } else if (null !== $value) {
            $properties[$name] = $this->parseMetaProperty($name, $value);
        }

        $this->metaProperties = $properties;

        return $this;
    }

    /**
     * @param array $properties
     *
     * @return $this
     */
    public function addMetaProperties(array $properties): FieldModel
    {
        $metaProperties = $this->metaProperties ?? [];
        $metaProperties = array_merge($metaProperties, $properties);

        $this->metaProperties = $metaProperties;

        return $this;
    }

    /**
     * @inheritdoc
     */
    public function jsonSerialize(): array
    {
        $returnArray = [
            'id'           => (int) $this->id,
            'hash'         => $this->getHash(),
            'type'         => $this->type,
            'handle'       => $this->handle,
            'label'        => $this->label,
            'required'     => (bool) $this->required,
            'instructions' => $this->instructions ?? '',
        ];

        if (\in_array(
            $this->type,
            [
                FieldInterface::TYPE_TEXT,
                FieldInterface::TYPE_TEXTAREA,
                FieldInterface::TYPE_HIDDEN,
            ],
            true
        )) {
            $returnArray['value']       = $this->getMetaProperty('value', '');
            $returnArray['placeholder'] = $this->getMetaProperty('placeholder', '');
        }

        if ($this->type === FieldInterface::TYPE_TEXTAREA) {
            $returnArray['rows'] = $this->getMetaProperty('rows', 2);
        }

        if ($this->type === FieldInterface::TYPE_CHECKBOX) {
            $returnArray['value']   = $this->getMetaProperty('value', 'Yes');
            $returnArray['checked'] = $this->getMetaProperty('checked', false);
        }

        if ($this->type === FieldInterface::TYPE_EMAIL) {
            $returnArray['notificationId'] = $this->getMetaProperty('notificationId', 0);
            $returnArray['values']         = $this->getMetaProperty('values', []);
            $returnArray['placeholder']    = $this->getMetaProperty('placeholder', '');
        }

        if ($this->type === FieldInterface::TYPE_DYNAMIC_RECIPIENTS) {
            $returnArray['notificationId']   = $this->getMetaProperty('notificationId', 0);
            $returnArray['value']            = $this->getMetaProperty('value', '');
            $returnArray['options']          = $this->getMetaProperty('options', []);
            $returnArray['showAsRadio']      = $this->getMetaProperty('showAsRadio', false);
            $returnArray['showAsCheckboxes'] = $this->getMetaProperty('showAsCheckboxes', false);
        }

        if ($this->type === FieldInterface::TYPE_CHECKBOX_GROUP) {
            $returnArray['showCustomValues'] = $this->hasCustomOptionValues();
            $returnArray['values']           = $this->getMetaProperty('values', []);
            $returnArray['options']          = $this->getMetaProperty('options', []);
            $returnArray['source']           = $this->getMetaProperty('source', ExternalOptionsInterface::SOURCE_CUSTOM);
            $returnArray['target']           = $this->getMetaProperty('target', null);
            $returnArray['configuration']    = $this->getMetaProperty('target', null);
        }

        if ($this->type === FieldInterface::TYPE_MULTIPLE_SELECT) {
            $returnArray['showCustomValues'] = $this->hasCustomOptionValues();
            $returnArray['values']           = $this->getMetaProperty('values', []);
            $returnArray['options']          = $this->getMetaProperty('options', []);
            $returnArray['source']           = $this->getMetaProperty('source', ExternalOptionsInterface::SOURCE_CUSTOM);
            $returnArray['target']           = $this->getMetaProperty('target', null);
            $returnArray['configuration']    = $this->getMetaProperty('target', null);
        }

        if ($this->type === FieldInterface::TYPE_FILE) {
            $returnArray['assetSourceId'] = (int) $this->getMetaProperty('assetSourceId', 0);
            $returnArray['maxFileSizeKB'] = (int) $this->getMetaProperty(
                'maxFileSizeKB',
                FileUploadField::DEFAULT_MAX_FILESIZE_KB
            );
            $returnArray['fileCount']     = (int) $this->getMetaProperty('fileCount', FileUploadField::DEFAULT_FILE_COUNT);
            $returnArray['fileKinds']     = $this->getMetaProperty('fileKinds', ['image', 'pdf']);
        }

        if (\in_array($this->type, [FieldInterface::TYPE_RADIO_GROUP, FieldInterface::TYPE_SELECT], true)) {
            $returnArray['showCustomValues'] = $this->hasCustomOptionValues();
            $returnArray['value']            = $this->getMetaProperty('value', '');
            $returnArray['options']          = $this->getMetaProperty('options', []);
            $returnArray['source']           = $this->getMetaProperty('source', ExternalOptionsInterface::SOURCE_CUSTOM);
            $returnArray['target']           = $this->getMetaProperty('target', null);
            $returnArray['configuration']    = $this->getMetaProperty('target', null);
        }

        if ($this->type === FieldInterface::TYPE_DATETIME) {
            $returnArray['value']               = $this->getMetaProperty('value', '');
            $returnArray['placeholder']         = $this->getMetaProperty('placeholder', '');
            $returnArray['initialValue']        = $this->getMetaProperty('initialValue');
            $returnArray['dateTimeType']        = $this->getMetaProperty('dateTimeType', 'both');
            $returnArray['generatePlaceholder'] = $this->getMetaProperty('generatePlaceholder', true);
            $returnArray['dateOrder']           = $this->getMetaProperty('dateOrder', 'ymd');
            $returnArray['date4DigitYear']      = $this->getMetaProperty('date4DigitYear', true);
            $returnArray['dateLeadingZero']     = $this->getMetaProperty('dateLeadingZero', true);
            $returnArray['dateSeparator']       = $this->getMetaProperty('dateSeparator', '/');
            $returnArray['clock24h']            = $this->getMetaProperty('clock24h', false);
            $returnArray['clockSeparator']      = $this->getMetaProperty('clockSeparator', ':');
            $returnArray['clockAMPMSeparate']   = $this->getMetaProperty('clockAMPMSeparate', true);
            $returnArray['useDatepicker']       = $this->getMetaProperty('useDatepicker', true);
            $returnArray['minDate']             = $this->getMetaProperty('minDate', '');
            $returnArray['maxDate']             = $this->getMetaProperty('maxDate', '');
        }

        if ($this->type === FieldInterface::TYPE_NUMBER) {
            $returnArray['value']              = $this->getMetaProperty('value', '');
            $returnArray['placeholder']        = $this->getMetaProperty('placeholder', '');
            $returnArray['minLength']          = $this->getMetaProperty('minLength');
            $returnArray['maxLength']          = $this->getMetaProperty('maxLength');
            $returnArray['minValue']           = $this->getMetaProperty('minValue');
            $returnArray['maxValue']           = $this->getMetaProperty('maxValue');
            $returnArray['decimalCount']       = $this->getMetaProperty('decimalCount');
            $returnArray['decimalSeparator']   = $this->getMetaProperty('decimalSeparator', '.');
            $returnArray['thousandsSeparator'] = $this->getMetaProperty('thousandsSeparator', ',');
            $returnArray['allowNegative']      = $this->getMetaProperty('allowNegative', false);
        }

        if ($this->type === FieldInterface::TYPE_RATING) {
            $returnArray['value']         = (int) $this->getMetaProperty('value', 0);
            $returnArray['maxValue']      = $this->getMetaProperty('maxValue', 5);
            $returnArray['colorIdle']     = $this->getMetaProperty('colorIdle', '#ddd');
            $returnArray['colorHover']    = $this->getMetaProperty('colorHover', 'gold');
            $returnArray['colorSelected'] = $this->getMetaProperty('colorSelected', '#f70');
        }

        if ($this->type === FieldInterface::TYPE_REGEX) {
            $returnArray['value']       = $this->getMetaProperty('value', '');
            $returnArray['placeholder'] = $this->getMetaProperty('placeholder', '');
            $returnArray['pattern']     = $this->getMetaProperty('pattern');
            $returnArray['message']     = $this->getMetaProperty('message');
        }

        if ($this->type === FieldInterface::TYPE_CONFIRMATION) {
            $returnArray['value']         = $this->getMetaProperty('value', '');
            $returnArray['placeholder']   = $this->getMetaProperty('placeholder', '');
            $returnArray['targetFieldId'] = $this->getMetaProperty('targetFieldId');
        }

        if ($this->type === FieldInterface::TYPE_PHONE) {
            $returnArray['value']       = $this->getMetaProperty('value', '');
            $returnArray['placeholder'] = $this->getMetaProperty('placeholder', '');
            $returnArray['pattern']     = $this->getMetaProperty('pattern', '');
            $returnArray['useJsMask']   = $this->getMetaProperty('useJsMask', false);
        }

        if ($this->type === FieldInterface::TYPE_WEBSITE) {
            $returnArray['value']       = $this->getMetaProperty('value', '');
            $returnArray['placeholder'] = $this->getMetaProperty('placeholder', '');
        }

        if ($this->type === FieldInterface::TYPE_OPINION_SCALE) {
            $returnArray['value']       = $this->getMetaProperty('value', '');
            $returnArray['scales'] = $this->getMetaProperty('scales', []);
            $returnArray['legends'] = $this->getMetaProperty('legends', []);
        }

        if ($this->type === FieldInterface::TYPE_SIGNATURE) {
            $returnArray['width'] = $this->getMetaProperty('width', SignatureField::DEFAULT_WIDTH);
            $returnArray['height'] = $this->getMetaProperty('height', SignatureField::DEFAULT_HEIGHT);
            $returnArray['showClearButton'] = $this->getMetaProperty('showClearButton', true);
        }

        if (\in_array(
            $this->type,
            [FieldInterface::TYPE_HIDDEN, FieldInterface::TYPE_HTML, FieldInterface::TYPE_SUBMIT],
            true
        )) {
            unset($returnArray['instructions']);
        }

        return $returnArray;
    }

    /**
     * @param array $postValues
     * @param bool  $forceLabelToValue
     */
    public function setPostValues(array $postValues, $forceLabelToValue = false)
    {
        /**
         * @var array $labels
         * @var array $values
         * @var array $checkedByDefault
         */
        $labels           = $postValues['labels'];
        $values           = $postValues['values'];
        $checkedByDefault = $postValues['checked'];

        $savableValue   = null;
        $savableValues  = [];
        $savableOptions = [];
        foreach ($labels as $index => $label) {
            $value = $values[$index];

            if (empty($label) && empty($value)) {
                continue;
            }

            $fieldValue = $value;
            if (empty($label)) {
                $fieldLabel = $value;
            } else {
                $fieldValue = $value;
                $fieldLabel = $label;
            }

            if ($forceLabelToValue) {
                $fieldValue = $fieldLabel;
            }

            $isChecked = (bool) $checkedByDefault[$index];
            if ($isChecked) {
                switch ($this->type) {
                    case FieldInterface::TYPE_CHECKBOX_GROUP:
                    case FieldInterface::TYPE_MULTIPLE_SELECT:
                        $savableValues[] = $fieldValue;
                        break;

                    case FieldInterface::TYPE_RADIO_GROUP:
                    case FieldInterface::TYPE_SELECT:
                    case FieldInterface::TYPE_DYNAMIC_RECIPIENTS:
                        $savableValue = $fieldValue;
                        break;
                }
            }

            $item        = new \stdClass();
            $item->value = $fieldValue;
            $item->label = $fieldLabel;

            $savableOptions[] = $item;
        }

        $this->setMetaProperty('options', !empty($savableOptions) ? $savableOptions : null);
        $this->setMetaProperty('values', !empty($savableValues) ? $savableValues : null);
        $this->setMetaProperty('value', !empty($savableValue) ? $savableValue : null);
        $this->setMetaProperty('checked', null);
    }

    /**
     * @return bool
     */
    public function hasCustomOptionValues(): bool
    {
        /** @var array $options */
        $options = $this->getMetaProperty('options');
        if (empty($options)) {
            return false;
        }

        foreach ($options as $valueData) {
            if (\is_object($valueData)) {
                $valueData = (array) $valueData;
            }

            if ($valueData['value'] !== $valueData['label']) {
                return true;
            }
        }

        return false;
    }

    /**
     * @inheritDoc
     */
    public function safeAttributes()
    {
        return [
            'id',
            'type',
            'label',
            'handle',
            'required',
            'instructions',
            'metaProperties',
        ];
    }

    /**
     * @param string $name
     * @param mixed  $value
     *
     * @return mixed
     */
    private function parseMetaProperty($name, $value)
    {
        static $customTypes = [
            'useDatepicker'       => self::PROPERTY_TYPE_BOOL,
            'checked'             => self::PROPERTY_TYPE_BOOL,
            'showAsRadio'         => self::PROPERTY_TYPE_BOOL,
            'showAsCheckboxes'    => self::PROPERTY_TYPE_BOOL,
            'generatePlaceholder' => self::PROPERTY_TYPE_BOOL,
            'date4DigitYear'      => self::PROPERTY_TYPE_BOOL,
            'dateLeadingZero'     => self::PROPERTY_TYPE_BOOL,
            'clock24h'            => self::PROPERTY_TYPE_BOOL,
            'clockLeadingZero'    => self::PROPERTY_TYPE_BOOL,
            'clockAMPMSeparate'   => self::PROPERTY_TYPE_BOOL,
            'allowNegative'       => self::PROPERTY_TYPE_BOOL,
            'notificationId'      => self::PROPERTY_TYPE_INT,
            'assetSourceId'       => self::PROPERTY_TYPE_INT,
            'rows'                => self::PROPERTY_TYPE_INT,
            'maxFileSizeKB'       => self::PROPERTY_TYPE_INT,
            'fileCount'           => self::PROPERTY_TYPE_INT,
            'minLength'           => self::PROPERTY_TYPE_INT,
            'maxLength'           => self::PROPERTY_TYPE_INT,
            'minValue'            => self::PROPERTY_TYPE_INT,
            'maxValue'            => self::PROPERTY_TYPE_INT,
        ];

        if (isset($customTypes[$name])) {
            switch ($customTypes[$name]) {
                case self::PROPERTY_TYPE_BOOL:
                    return (bool) $value;

                case self::PROPERTY_TYPE_INT:
                    return $value !== null ? (int) $value : null;
            }
        }

        return $value;
    }
}
