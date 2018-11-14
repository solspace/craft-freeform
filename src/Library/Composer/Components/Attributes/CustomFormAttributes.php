<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2018, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Attributes;

class CustomFormAttributes extends AbstractAttributes
{
    /** @var string */
    protected $returnUrl;

    /** @var string */
    protected $inputClass;

    /** @var string */
    protected $submitClass;

    /** @var string */
    protected $rowClass;

    /** @var string */
    protected $columnClass;

    /** @var string */
    protected $labelClass;

    /** @var string */
    protected $errorClass;

    /** @var array of strings */
    protected $class;

    /** @var string */
    protected $instructionsClass;

    /** @var bool */
    protected $instructionsBelowField;

    /** @var string */
    protected $id;

    /** @var string */
    protected $name;

    /** @var string */
    protected $method;

    /** @var string */
    protected $action;

    /** @var array */
    protected $overrideValues;

    /** @var bool */
    protected $useRequiredAttribute;

    /** @var array */
    protected $formAttributes;

    /** @var array */
    protected $inputAttributes;

    /** @var */
    protected $dynamicNotification;

    /** @var string */
    protected $fieldIdPrefix;

    /** @var string */
    protected $status;

    /** @var int */
    protected $statusId;

    /**
     * @return string|null
     */
    public function getReturnUrl()
    {
        return $this->returnUrl;
    }

    /**
     * @return string|null
     */
    public function getInputClass()
    {
        return $this->extractClassValue($this->inputClass);
    }

    /**
     * @return string|null
     */
    public function getSubmitClass()
    {
        return $this->extractClassValue($this->submitClass);
    }

    /**
     * @return string|null
     */
    public function getRowClass()
    {
        return $this->extractClassValue($this->rowClass);
    }

    /**
     * @return string|null
     */
    public function getColumnClass()
    {
        return $this->extractClassValue($this->columnClass);
    }

    /**
     * @return string|null
     */
    public function getLabelClass()
    {
        return $this->extractClassValue($this->labelClass);
    }

    /**
     * @return string|null
     */
    public function getErrorClass()
    {
        return $this->extractClassValue($this->errorClass);
    }

    /**
     * @return string|null
     */
    public function getClass()
    {
        return $this->extractClassValue($this->class);
    }

    /**
     * @return string|null
     */
    public function getInstructionsClass()
    {
        return $this->instructionsClass;
    }

    /**
     * @return boolean|null
     */
    public function isInstructionsBelowField()
    {
        return $this->instructionsBelowField;
    }

    /**
     * @return string|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string|null
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return string|null
     */
    public function getMethod()
    {
        return $this->method;
    }

    /**
     * @return string|null
     */
    public function getAction()
    {
        return $this->action;
    }

    /**
     * @return array|null
     */
    public function getOverrideValues()
    {
        return $this->overrideValues;
    }

    /**
     * @return boolean|null
     */
    public function getUseRequiredAttribute()
    {
        return $this->useRequiredAttribute;
    }

    /**
     * @return array|null
     */
    public function getFormAttributes()
    {
        if (null === $this->formAttributes) {
            return $this->formAttributes;
        }

        if (!\is_array($this->formAttributes)) {
            return [$this->formAttributes];
        }

        return $this->formAttributes;
    }

    /**
     * @return string
     */
    public function getFormAttributesAsString(): string
    {
        $formAttributes = $this->getFormAttributes() ?: [];

        return $this->getAttributeStringFromArray($formAttributes);
    }

    /**
     * @return array|null
     */
    public function getInputAttributes()
    {
        if (null === $this->inputAttributes) {
            return $this->inputAttributes;
        }

        if (!\is_array($this->inputAttributes)) {
            return [$this->inputAttributes];
        }

        return $this->inputAttributes;
    }

    /**
     * @return DynamicNotificationAttributes|null
     */
    public function getDynamicNotification()
    {
        if (null !== $this->dynamicNotification) {
            if (!$this->dynamicNotification instanceof DynamicNotificationAttributes) {
                $this->dynamicNotification = new DynamicNotificationAttributes($this->dynamicNotification);
            }
        }

        return $this->dynamicNotification;
    }

    /**
     * @return string|null
     */
    public function getFieldIdPrefix()
    {
        return $this->fieldIdPrefix;
    }

    /**
     * @return string|null
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @return int|null
     */
    public function getStatusId()
    {
        return $this->statusId;
    }
}
