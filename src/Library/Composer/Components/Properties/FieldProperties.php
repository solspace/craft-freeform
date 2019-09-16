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

namespace Solspace\Freeform\Library\Composer\Components\Properties;

use Solspace\Freeform\Library\Composer\Components\Fields\DataContainers\Option;

class FieldProperties extends AbstractProperties
{
    /** @var string */
    protected $hash;

    /** @var int */
    protected $id;

    /** @var string */
    protected $handle;

    /** @var string */
    protected $label;

    /** @var boolean */
    protected $required;

    /** @var string */
    protected $placeholder;

    /** @var string */
    protected $instructions;

    /** @var string */
    protected $value;

    /** @var array */
    protected $values;

    /** @var array */
    protected $options;

    /** @var bool */
    protected $checked;

    /** @var bool */
    protected $showAsRadio;

    /** @var bool */
    protected $showAsCheckboxes;

    /** @var int */
    protected $notificationId;

    /** @var int */
    protected $assetSourceId;

    /** @var int */
    protected $integrationId;

    /** @var string */
    protected $resourceId;

    /** @var string */
    protected $emailFieldHash;

    /** @var string */
    protected $position;

    /** @var string */
    protected $labelNext;

    /** @var string */
    protected $labelPrev;

    /** @var bool */
    protected $disablePrev;

    /** @var array */
    protected $mapping;

    /** @var array */
    protected $fileKinds;

    /** @var int */
    protected $maxFileSizeKB;

    /** @var int */
    protected $fileCount;

    /** @var int */
    protected $rows;

    /** @var string */
    protected $dateTimeType;

    /** @var bool */
    protected $generatePlaceholder;

    /** @var string */
    protected $dateOrder;

    /** @var bool */
    protected $date4DigitYear;

    /** @var bool */
    protected $dateLeadingZero;

    /** @var string */
    protected $dateSeparator;

    /** @var bool */
    protected $clock24h;

    /** @var string */
    protected $clockSeparator;

    /** @var bool */
    protected $clockAMPMSeparate;

    /** @var bool */
    protected $useDatepicker;

    /** @var string */
    protected $minDate;

    /** @var string */
    protected $maxDate;

    /** @var string */
    protected $initialValue;

    /** @var int */
    protected $minValue;

    /** @var int */
    protected $maxValue;

    /** @var int */
    protected $minLength;

    /** @var int */
    protected $maxLength;

    /** @var int */
    protected $decimalCount;

    /** @var string */
    protected $decimalSeparator;

    /** @var string */
    protected $thousandsSeparator;

    /** @var bool */
    protected $allowNegative;

    /** @var string */
    protected $pattern;

    /** @var string */
    protected $targetFieldHash;

    /** @var string */
    protected $message;

    /** @var string */
    protected $colorIdle;

    /** @var string */
    protected $colorHover;

    /** @var string */
    protected $colorSelected;

    /** @var string */
    protected $source;

    /** @var string */
    protected $target;

    /** @var array */
    protected $configuration;

    /** @var string */
    protected $layout;

    /** @var string */
    protected $paymentType;

    /** @var float */
    protected $amount;

    /** @var string */
    protected $currency;

    /** @var string */
    protected $interval;

    /** @var string */
    protected $plan;

    /** @var array */
    protected $children;

    /** @var array */
    protected $paymentFieldMapping;

    /** @var array */
    protected $customerFieldMapping;

    /** @var bool */
    protected $useJsMask;

    /** @var bool */
    protected $hidden;

    /** @var bool */
    protected $oneLine;

    /** @var array */
    protected $inputAttributes;

    /** @var array */
    protected $labelAttributes;

    /** @var array */
    protected $errorAttributes;

    /** @var array */
    protected $instructionAttributes;

    /** @var int */
    protected $width;

    /** @var int */
    protected $height;

    /** @var bool */
    protected $showClearButton;

    /** @var string */
    protected $borderColor;

    /** @var string */
    protected $backgroundColor;

    /** @var string */
    protected $penColor;

    /** @var float */
    protected $penDotSize;

    /**
     * @return string|null
     */
    public function getHash()
    {
        return $this->hash;
    }

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string|null
     */
    public function getHandle()
    {
        return $this->handle;
    }

    /**
     * @return string|null
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @return boolean|null
     */
    public function isRequired()
    {
        return $this->required;
    }

    /**
     * @return string|null
     */
    public function getValue()
    {
        return $this->value !== null ? (string) $this->value : null;
    }

    /**
     * @return array|null
     */
    public function getValues()
    {
        if (null === $this->values) {
            return null;
        }

        $values = $this->values;
        array_walk($values, function (&$value) {
            $value = (string) $value;
        });

        return $values;
    }

    /**
     * @return Option[]
     */
    public function getOptions(): array
    {
        $return = [];
        if (\is_array($this->options)) {
            foreach ($this->options as $option) {
                $isChecked = false;
                if (null !== $this->getValue()) {
                    $isChecked = (string) $option['value'] === (string) $this->getValue();
                } else if (null !== $this->getValues()) {
                    $isChecked = \in_array($option['value'], $this->getValues(), true);
                }

                $return[] = new Option((string) $option['label'], (string) $option['value'], $isChecked);
            }
        }

        return $return;
    }

    /**
     * @return boolean
     */
    public function isChecked(): bool
    {
        return (bool) $this->checked;
    }

    /**
     * @return boolean|null
     */
    public function isShowAsRadio()
    {
        return $this->showAsRadio;
    }

    /**
     * @return boolean|null
     */
    public function isShowAsCheckboxes()
    {
        return $this->showAsCheckboxes;
    }

    /**
     * @return string|null
     */
    public function getPlaceholder()
    {
        return $this->placeholder;
    }

    /**
     * @return string|null
     */
    public function getInstructions()
    {
        return $this->instructions;
    }

    /**
     * @return int|null
     */
    public function getNotificationId()
    {
        return $this->notificationId;
    }

    /**
     * @return int|null
     */
    public function getAssetSourceId()
    {
        return $this->assetSourceId;
    }

    /**
     * @return int|null
     */
    public function getIntegrationId()
    {
        return (int) $this->integrationId;
    }

    /**
     * @return string
     */
    public function getResourceId(): string
    {
        return (string) $this->resourceId;
    }

    /**
     * @return string
     */
    public function getEmailFieldHash(): string
    {
        return (string) $this->emailFieldHash;
    }

    /**
     * @return string|null
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @return string|null
     */
    public function getLabelNext()
    {
        return $this->labelNext;
    }

    /**
     * @return string|null
     */
    public function getLabelPrev()
    {
        return $this->labelPrev;
    }

    /**
     * @return boolean|null
     */
    public function isDisablePrev()
    {
        return $this->disablePrev;
    }

    /**
     * @return array|null
     */
    public function getMapping()
    {
        return $this->mapping;
    }

    /**
     * @return array|null
     */
    public function getFileKinds()
    {
        return $this->fileKinds;
    }

    /**
     * @return int|null
     */
    public function getMaxFileSizeKB()
    {
        return $this->maxFileSizeKB;
    }

    /**
     * @return int|null
     */
    public function getFileCount()
    {
        return $this->fileCount;
    }

    /**
     * @return int|null
     */
    public function getRows()
    {
        return $this->rows;
    }

    /**
     * @return string|null
     */
    public function getDateTimeType()
    {
        return $this->dateTimeType;
    }

    /**
     * @return bool|null
     */
    public function isGeneratePlaceholder()
    {
        return $this->generatePlaceholder;
    }

    /**
     * @return string|null
     */
    public function getDateOrder()
    {
        return $this->dateOrder;
    }

    /**
     * @return bool|null
     */
    public function isDate4DigitYear()
    {
        return $this->date4DigitYear;
    }

    /**
     * @return bool|null
     */
    public function isDateLeadingZero()
    {
        return $this->dateLeadingZero;
    }

    /**
     * @return string|null
     */
    public function getDateSeparator()
    {
        return $this->dateSeparator;
    }

    /**
     * @return bool|null
     */
    public function isClock24h()
    {
        return $this->clock24h;
    }

    /**
     * @return string|null
     */
    public function getClockSeparator()
    {
        return $this->clockSeparator;
    }

    /**
     * @return bool|null
     */
    public function isClockAMPMSeparate()
    {
        return $this->clockAMPMSeparate;
    }

    /**
     * @return bool|null
     */
    public function isUseDatepicker()
    {
        return $this->useDatepicker;
    }

    /**
     * @return string|null
     */
    public function getMinDate()
    {
        return $this->minDate;
    }

    /**
     * @return string|null
     */
    public function getMaxDate()
    {
        return $this->maxDate;
    }

    /**
     * @return string|null
     */
    public function getInitialValue()
    {
        return $this->initialValue;
    }

    /**
     * @return int|null
     */
    public function getMinValue()
    {
        return $this->minValue;
    }

    /**
     * @return int|null
     */
    public function getMaxValue()
    {
        return $this->maxValue;
    }

    /**
     * @return int|null
     */
    public function getMinLength()
    {
        return $this->minLength;
    }

    /**
     * @return int|null
     */
    public function getMaxLength()
    {
        return $this->maxLength;
    }

    /**
     * @return int|null
     */
    public function getDecimalCount()
    {
        return $this->decimalCount;
    }

    /**
     * @return string|null
     */
    public function getDecimalSeparator()
    {
        return $this->decimalSeparator;
    }

    /**
     * @return string|null
     */
    public function getThousandsSeparator()
    {
        return $this->thousandsSeparator;
    }

    /**
     * @return bool|null
     */
    public function isAllowNegative()
    {
        return $this->allowNegative;
    }

    /**
     * @return string|null
     */
    public function getPattern()
    {
        return $this->pattern;
    }

    /**
     * @return int|null
     */
    public function getTargetFieldHash()
    {
        return $this->targetFieldHash;
    }

    /**
     * @return string|null
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * @return string|null
     */
    public function getColorIdle()
    {
        return $this->colorIdle;
    }

    /**
     * @return string|null
     */
    public function getColorHover()
    {
        return $this->colorHover;
    }

    /**
     * @return string|null
     */
    public function getColorSelected()
    {
        return $this->colorSelected;
    }

    /**
     * @return string|null
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * @return string|null
     */
    public function getTarget()
    {
        return $this->target;
    }

    /**
     * @return array
     */
    public function getConfiguration(): array
    {
        return $this->configuration ?? [];
    }

    /**
     * @return float|null
     */
    public function getAmount()
    {
        return $this->amount;
    }

    /**
     * @return string
     */
    public function getCurrency(): string
    {
        return $this->currency;
    }

    /**
     * @return string
     */
    public function getPlan()
    {
        return $this->plan;
    }

    /**
     * @return string
     */
    public function getLayout(): string
    {
        return $this->layout;
    }

    /**
     * @return string
     */
    public function getPaymentType(): string
    {
        return $this->paymentType;
    }

    /**
     * @return string
     */
    public function getInterval()
    {
        return $this->interval;
    }

    /**
     * @return array
     */
    public function getChildren()
    {
        return $this->children;
    }

    /**
     * @return array
     */
    public function getPaymentFieldMapping()
    {
        return $this->paymentFieldMapping;
    }

    /**
     * @return array
     */
    public function getCustomerFieldMapping()
    {
        return $this->customerFieldMapping;
    }

    /*
     * @return bool|null
     */
    public function isUseJsMask()
    {
        return $this->useJsMask;
    }

    /**
     * @return bool|null
     */
    public function isHidden()
    {
        return $this->hidden;
    }

    /**
     * @return bool|null
     */
    public function isOneLine()
    {
        return $this->oneLine;
    }

    /**
     * @return int|null
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * @return int|null
     */
    public function getHeight()
    {
        return $this->height;
    }

    /**
     * @return bool|null
     */
    public function isShowClearButton()
    {
        return $this->showClearButton;
    }

    /**
     * @return string|null
     */
    public function getBorderColor()
    {
        return $this->borderColor;
    }

    /**
     * @return string|null
     */
    public function getBackgroundColor()
    {
        return $this->backgroundColor;
    }

    /**
     * @return string|null
     */
    public function getPenColor()
    {
        return $this->penColor;
    }

    /**
     * @return float|null
     */
    public function getPenDotSize()
    {
        return $this->penDotSize;
    }

    /**
     * @return array
     */
    public function getInputAttributes(): array
    {
        return $this->inputAttributes ?? [];
    }

    /**
     * @return array
     */
    public function getLabelAttributes(): array
    {
        return $this->labelAttributes ?? [];
    }

    /**
     * @return array
     */
    public function getErrorAttributes(): array
    {
        return $this->errorAttributes ?? [];
    }

    /**
     * @return array
     */
    public function getInstructionAttributes(): array
    {
        return $this->instructionAttributes ?? [];
    }

    /**
     * Return a list of all property fields and their type
     *
     * [propertyKey => propertyType, ..]
     * E.g. ["name" => "string", ..]
     *
     * @return array
     */
    protected function getPropertyManifest(): array
    {
        return [
            'hash'                  => self::TYPE_STRING,
            'id'                    => self::TYPE_INTEGER,
            'handle'                => self::TYPE_STRING,
            'label'                 => self::TYPE_STRING,
            'required'              => self::TYPE_BOOLEAN,
            'placeholder'           => self::TYPE_STRING,
            'instructions'          => self::TYPE_STRING,
            'value'                 => self::TYPE_STRING,
            'values'                => self::TYPE_ARRAY,
            'options'               => self::TYPE_ARRAY,
            'checked'               => self::TYPE_BOOLEAN,
            'showAsRadio'           => self::TYPE_BOOLEAN,
            'showAsCheckboxes'      => self::TYPE_BOOLEAN,
            'notificationId'        => self::TYPE_STRING,
            'assetSourceId'         => self::TYPE_INTEGER,
            'integrationId'         => self::TYPE_INTEGER,
            'resourceId'            => self::TYPE_STRING,
            'emailFieldHash'        => self::TYPE_STRING,
            'position'              => self::TYPE_STRING,
            'labelNext'             => self::TYPE_STRING,
            'labelPrev'             => self::TYPE_STRING,
            'disablePrev'           => self::TYPE_BOOLEAN,
            'mapping'               => self::TYPE_ARRAY,
            'fileKinds'             => self::TYPE_ARRAY,
            'maxFileSizeKB'         => self::TYPE_INTEGER,
            'fileCount'             => self::TYPE_INTEGER,
            'rows'                  => self::TYPE_INTEGER,
            'dateTimeType'          => self::TYPE_STRING,
            'generatePlaceholder'   => self::TYPE_BOOLEAN,
            'dateOrder'             => self::TYPE_STRING,
            'date4DigitYear'        => self::TYPE_BOOLEAN,
            'dateLeadingZero'       => self::TYPE_BOOLEAN,
            'dateSeparator'         => self::TYPE_STRING,
            'clock24h'              => self::TYPE_BOOLEAN,
            'clockSeparator'        => self::TYPE_STRING,
            'clockAMPMSeparate'     => self::TYPE_BOOLEAN,
            'useDatepicker'         => self::TYPE_BOOLEAN,
            'minDate'               => self::TYPE_STRING,
            'maxDate'               => self::TYPE_STRING,
            'initialValue'          => self::TYPE_STRING,
            'minValue'              => self::TYPE_INTEGER,
            'maxValue'              => self::TYPE_INTEGER,
            'minLength'             => self::TYPE_INTEGER,
            'maxLength'             => self::TYPE_INTEGER,
            'decimalCount'          => self::TYPE_INTEGER,
            'decimalSeparator'      => self::TYPE_STRING,
            'thousandsSeparator'    => self::TYPE_STRING,
            'allowNegative'         => self::TYPE_BOOLEAN,
            'pattern'               => self::TYPE_STRING,
            'targetFieldHash'       => self::TYPE_STRING,
            'message'               => self::TYPE_STRING,
            'colorIdle'             => self::TYPE_STRING,
            'colorHover'            => self::TYPE_STRING,
            'colorSelected'         => self::TYPE_STRING,
            'source'                => self::TYPE_STRING,
            'target'                => self::TYPE_STRING,
            'configuration'         => self::TYPE_ARRAY,
            'layout'                => self::TYPE_STRING,
            'paymentType'           => self::TYPE_STRING,
            'amount'                => self::TYPE_DOUBLE,
            'currency'              => self::TYPE_STRING,
            'interval'              => self::TYPE_STRING,
            'plan'                  => self::TYPE_STRING,
            'children'              => self::TYPE_ARRAY,
            'paymentFieldMapping'   => self::TYPE_ARRAY,
            'customerFieldMapping'  => self::TYPE_ARRAY,
            'useJsMask'             => self::TYPE_BOOLEAN,
            'hidden'                => self::TYPE_BOOLEAN,
            'oneLine'               => self::TYPE_BOOLEAN,
            'inputAttributes'       => self::TYPE_ARRAY,
            'labelAttributes'       => self::TYPE_ARRAY,
            'errorAttributes'       => self::TYPE_ARRAY,
            'instructionAttributes' => self::TYPE_ARRAY,
            'tagAttributes'         => self::TYPE_ARRAY,
            'scales'                => self::TYPE_ARRAY,
            'legends'               => self::TYPE_ARRAY,
            'width'                 => self::TYPE_INTEGER,
            'height'                => self::TYPE_INTEGER,
            'showClearButton'       => self::TYPE_BOOLEAN,
            'borderColor'           => self::TYPE_STRING,
            'backgroundColor'       => self::TYPE_STRING,
            'penColor'              => self::TYPE_STRING,
            'penDotSize'            => self::TYPE_DOUBLE,
        ];
    }
}
