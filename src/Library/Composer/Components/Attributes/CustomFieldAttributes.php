<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Attributes;

use Solspace\Freeform\Library\Composer\Components\AbstractField;

class CustomFieldAttributes extends AbstractAttributes
{
    /** @var int */
    protected $id;

    /** @var string */
    protected $class;

    /** @var string */
    protected $labelClass;

    /** @var string */
    protected $errorClass;

    /** @var string */
    protected $instructionsClass;

    /** @var bool */
    protected $instructionsBelowField;

    /** @var string */
    protected $placeholder;

    /** @var mixed */
    protected $overrideValue;

    /** @var bool */
    protected $useRequiredAttribute;

    /** @var array */
    protected $inputAttributes;

    /** @var AbstractField */
    private $field;

    /** @var CustomFormAttributes */
    private $formAttributes;

    /**
     * CustomFieldAttributes constructor.
     *
     * @param AbstractField             $field
     * @param array|null                $attributes
     * @param CustomFormAttributes|null $formAttributes
     */
    public function __construct(
        AbstractField $field,
        array $attributes = null,
        CustomFormAttributes $formAttributes = null
    ) {
        parent::__construct($attributes);

        $this->field          = $field;
        $this->formAttributes = $formAttributes;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getClass()
    {
        $value = $this->class;
        if (null !== $this->formAttributes) {
            $value = $this->combineClassStrings($value, $this->formAttributes->getInputClass());
        }

        return $this->extractClassValue($value);
    }

    /**
     * @return string
     */
    public function getInputClassOnly()
    {
        return $this->extractClassValue($this->class);
    }

    /**
     * @return string
     */
    public function getLabelClass()
    {
        $value = $this->labelClass;
        if (null !== $this->formAttributes) {
            $value = $this->combineClassStrings($value, $this->formAttributes->getLabelClass());
        }

        return $this->extractClassValue($value);
    }

    /**
     * @return string
     */
    public function getErrorClass()
    {
        $value = $this->errorClass;
        if (null !== $this->formAttributes) {
            $value = $this->combineClassStrings($value, $this->formAttributes->getErrorClass());
        }

        return $this->extractClassValue($value);
    }

    /**
     * @return string
     */
    public function getInstructionsClass()
    {
        $value = $this->instructionsClass;
        if (null !== $this->formAttributes) {
            $value = $this->combineClassStrings($value, $this->formAttributes->getInstructionsClass());
        }

        return $this->extractClassValue($value);
    }

    /**
     * @return boolean
     */
    public function isInstructionsBelowField()
    {
        $value = $this->instructionsBelowField;
        if (!$value && null !== $this->formAttributes) {
            $value = $this->formAttributes->isInstructionsBelowField();
        }

        return $value;
    }

    /**
     * @return string
     */
    public function getPlaceholder()
    {
        return $this->placeholder;
    }

    /**
     * @return mixed
     */
    public function getOverrideValue()
    {
        $value = $this->overrideValue;

        if (null === $value && null !== $this->formAttributes) {
            $overrideValues = $this->formAttributes->getOverrideValues();

            if ($overrideValues && isset($overrideValues[$this->field->getHandle()])) {
                $value = $overrideValues[$this->field->getHandle()];
            }
        }

        return $value;
    }

    /**
     * @return array
     */
    public function getInputAttributes()
    {
        if (null === $this->inputAttributes) {
            return $this->inputAttributes;
        }

        if (!is_array($this->inputAttributes)) {
            return [$this->inputAttributes];
        }

        return $this->inputAttributes;
    }

    /**
     * @return string
     */
    public function getInputAttributesAsString()
    {
        $formInputAttributes = $this->formAttributes ? $this->formAttributes->getInputAttributes() : [];
        $inputAttributes = $this->getInputAttributes();

        if ($formInputAttributes) {
            if ($inputAttributes) {
                $inputAttributes = array_merge($formInputAttributes, $inputAttributes);
            } else {
                $inputAttributes = $formInputAttributes;
            }
        }

        if (!is_array($inputAttributes)) {
            $inputAttributes = [];
        }

        return $this->getAttributeStringFromArray($inputAttributes);
    }

    /**
     * @return boolean
     */
    public function getUseRequiredAttribute()
    {
        $value = $this->useRequiredAttribute;

        if (null === $value && null !== $this->formAttributes) {
            $value = $this->formAttributes->getUseRequiredAttribute();
        }

        return $value;
    }

    /**
     * Takes a two class strings, explodes them into arrays, merges, then returns a glued string
     *
     * @param string $classStringA
     * @param string $classStringB
     *
     * @return string
     */
    private function combineClassStrings($classStringA = null, $classStringB = null)
    {
        $classListA = explode(' ', $classStringA ?: '');
        $classListB = explode(' ', $classStringB ?: '');

        $combined = array_merge($classListA, $classListB);
        $combined = array_unique($combined);
        $combined = array_filter($combined);

        return implode(' ', $combined);
    }
}
