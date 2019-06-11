<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components;

use craft\helpers\Template;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Library\Composer\Components\Attributes\CustomFieldAttributes;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\StaticValueInterface;
use Solspace\Freeform\Library\Composer\Components\Properties\FieldProperties;
use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\ConstraintInterface;
use Solspace\Freeform\Library\Composer\Components\Validation\Validator;
use Solspace\Freeform\Library\Session\FormValueContext;
use Stringy\Stringy;
use Symfony\Component\PropertyAccess\Exception\NoSuchPropertyException;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Twig\Markup;

abstract class AbstractField implements FieldInterface, \JsonSerializable
{
    /** @var Form */
    private $form;

    /** @var string */
    protected $hash;

    /** @var int */
    protected $id;

    /** @var string */
    protected $handle;

    /** @var string */
    protected $label;

    /** @var string */
    protected $instructions;

    /** @var bool */
    protected $required = false;

    /** @var CustomFieldAttributes */
    protected $customAttributes;

    /** @var int */
    protected $pageIndex;

    /** @var array */
    protected $errors;

    /** @var array */
    protected $inputAttributes;

    /** @var array */
    protected $labelAttributes;

    /** @var array */
    protected $errorAttributes;

    /** @var array */
    protected $instructionAttributes;

    /** @var array */
    private $inputClasses;

    /**
     * @param Form             $form
     * @param FieldProperties  $properties
     * @param FormValueContext $formValueContext
     * @param int              $pageIndex
     *
     * @return AbstractField
     */
    final public static function createFromProperties(
        Form $form,
        FieldProperties $properties,
        FormValueContext $formValueContext,
        $pageIndex
    ): AbstractField {
        $calledClass = static::class;

        $objectProperties = get_class_vars($calledClass);
        $accessor         = PropertyAccess::createPropertyAccessor();

        $field            = new static($form);
        $field->pageIndex = $pageIndex;

        foreach ($objectProperties as $fieldName => $type) {
            if ($fieldName === 'errors') {
                continue;
            }
            try {
                $field->{$fieldName} = $accessor->getValue($properties, $fieldName);
            } catch (NoSuchPropertyException $e) {
                // Pass along
            }
        }

        if ($field instanceof StaticValueInterface) {
            $field->staticValue = $field->getValue();
        }

        $storedValue = $formValueContext->getStoredValue($field);
        $field->setValue($storedValue);

        if ($field instanceof CheckboxField && $formValueContext->hasFormBeenPosted()) {
            $storedValue = $formValueContext->getStoredValue($field);
            $field->setIsCheckedByPost((bool) $storedValue);
        }

        return $field;
    }

    /**
     * @return array
     */
    public static function getFieldTypes(): array
    {
        return [
            self::TYPE_TEXT               => 'Text',
            self::TYPE_TEXTAREA           => 'Textarea',
            self::TYPE_EMAIL              => 'Email',
            self::TYPE_HIDDEN             => 'Hidden',
            self::TYPE_SELECT             => 'Select',
            self::TYPE_MULTIPLE_SELECT    => 'Multi select',
            self::TYPE_CHECKBOX           => 'Checkbox',
            self::TYPE_CHECKBOX_GROUP     => 'Checkbox group',
            self::TYPE_RADIO_GROUP        => 'Radio group',
            self::TYPE_FILE               => 'File upload',
            self::TYPE_DYNAMIC_RECIPIENTS => 'Dynamic Recipients',
            self::TYPE_DATETIME           => 'Date & Time',
            self::TYPE_NUMBER             => 'Number',
            self::TYPE_PHONE              => 'Phone',
            self::TYPE_WEBSITE            => 'Website',
            self::TYPE_RATING             => 'Rating',
            self::TYPE_REGEX              => 'Regex',
            self::TYPE_CONFIRMATION       => 'Confirmation',
            self::TYPE_OPINION_SCALE      => 'Opinion Scale',
        ];
    }

    /**
     * @return string
     */
    public static function getFieldTypeName(): string
    {
        return (string) Stringy::create(static::getFieldType())->humanize();
    }

    /**
     * @return string
     */
    public static function getFieldType(): string
    {
        $name = (new \ReflectionClass(static::class))->getShortName();
        $name = str_replace('Field', '', $name);

        return (string) Stringy::create($name)->underscored();
    }

    /**
     * AbstractField constructor.
     *
     * @param Form $form
     */
    final public function __construct(Form $form)
    {
        $this->form             = $form;
        $this->customAttributes = new CustomFieldAttributes($this, [], $this->getForm()->getCustomAttributes());
        $this->inputClasses     = [];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->getValueAsString();
    }

    /**
     * Render the complete set of HTML for this field
     * That includes the Label, Input and Error messages
     *
     * @param array $customAttributes
     *
     * @return Markup
     */
    final public function render(array $customAttributes = null): Markup
    {
        $this->setCustomAttributes($customAttributes);

        $output = '';
        if (!$this instanceof InputOnlyInterface) {
            $output .= $this->getLabelHtml();
        }

        // Show instructions above by default
        if (!$this->getCustomAttributes()->isInstructionsBelowField()) {
            $output .= $this->getInstructionsHtml();
        }

        $output .= $this->onBeforeInputHtml();
        $output .= $this->getInputHtml();
        $output .= $this->onAfterInputHtml();

        // Show instructions below only if set by a property
        if ($this->getCustomAttributes()->isInstructionsBelowField()) {
            $output .= $this->getInstructionsHtml();
        }

        if ($this->getErrors()) {
            $output .= $this->renderErrors();
        }

        return $this->renderRaw($output);
    }

    /**
     * Render the Label HTML
     *
     * @param array $customAttributes
     *
     * @return Markup
     */
    final public function renderLabel(array $customAttributes = null): Markup
    {
        $this->setCustomAttributes($customAttributes);

        return $this->renderRaw($this->getLabelHtml());
    }

    /**
     * @param array|null $customAttributes
     *
     * @return Markup
     */
    public function renderInstructions(array $customAttributes = null): Markup
    {
        $this->setCustomAttributes($customAttributes);

        return $this->renderRaw($this->getInstructionsHtml());
    }

    /**
     * Render the Input HTML
     *
     * @param array $customAttributes
     *
     * @return Markup
     */
    final public function renderInput(array $customAttributes = null): Markup
    {
        $this->setCustomAttributes($customAttributes);

        return $this->renderRaw($this->getInputHtml());
    }

    /**
     * Outputs the HTML of errors
     *
     * @param array $customAttributes
     *
     * @return Markup
     */
    final public function renderErrors(array $customAttributes = null): Markup
    {
        $this->setCustomAttributes($customAttributes);

        return $this->renderRaw($this->getErrorHtml());
    }

    /**
     * @return Markup
     */
    final public function rulesHtmlData(): Markup
    {
        $ruleProperties = $this->getForm()->getRuleProperties();
        if (null === $ruleProperties) {
            return $this->renderRaw('');
        }

        $rule = $ruleProperties->getFieldRule($this->getPageIndex(), $this->getHash());
        if (null === $rule) {
            return $this->renderRaw('');
        }

        $data = \GuzzleHttp\json_encode($rule, JSON_HEX_APOS);

        return $this->renderRaw(" data-ff-rule='$data'");
    }

    /**
     * @return bool
     */
    final public function canRender(): bool
    {
        return (!$this instanceof NoRenderInterface);
    }

    /**
     * @return bool
     */
    final public function canStoreValues(): bool
    {
        return (!$this instanceof NoStorageInterface);
    }

    /**
     * @return bool
     */
    public function isInputOnly(): bool
    {
        return $this instanceof InputOnlyInterface;
    }

    /**
     * Validates the Field value
     *
     * @return bool
     */
    public function isValid(): bool
    {
        $this->addErrors($this->validate());

        return empty($this->errors);
    }

    /**
     * Returns an array of error messages
     *
     * @return array
     */
    public function getErrors(): array
    {
        if (null === $this->errors) {
            $this->errors = [];
        }

        return $this->errors;
    }

    /**
     * @return bool
     */
    public function hasErrors(): bool
    {
        $errors = $this->getErrors();

        return !empty($errors);
    }

    /**
     * @param array|null $errors
     *
     * @return $this
     */
    public function addErrors(array $errors = null): AbstractField
    {
        if (empty($errors)) {
            return $this;
        }

        $existingErrors = $this->getErrors();
        $existingErrors = array_merge($existingErrors, $errors);

        $existingErrors = array_unique($existingErrors);

        $this->errors = $existingErrors;

        return $this;
    }

    /**
     * @param string $error
     *
     * @return $this
     */
    public function addError(string $error): AbstractField
    {
        $this->addErrors([$error]);

        return $this;
    }

    /**
     * Return the field TYPE
     *
     * @return string
     */
    abstract public function getType(): string;

    /**
     * @return string
     */
    public function getHash(): string
    {
        return $this->hash;
    }

    /**
     * @return int
     */
    public function getId(): int
    {
        return (int) $this->id;
    }

    /**
     * @return string|null
     */
    public function getHandle()
    {
        return $this->handle;
    }

    /**
     * @return string
     */
    public function getLabel(): string
    {
        return $this->translate($this->label);
    }

    /**
     * @return string
     */
    public function getInstructions(): string
    {
        return $this->translate($this->instructions);
    }

    /**
     * @return bool
     */
    public function isRequired(): bool
    {
        return (bool) $this->required;
    }

    /**
     * @return bool
     */
    public function isHidden(): bool
    {
        static $rules;

        if (null === $rules) {
            $rules = $this->getForm()->getRuleProperties();
            if (null === $rules) {
                $rules = false;
            }
        }

        if (false === $rules) {
            return false;
        }

        return $rules->isHidden($this, $this->getForm());
    }

    /**
     * @return int
     */
    public function getPageIndex(): int
    {
        return $this->pageIndex;
    }

    /**
     * Gets whatever value is set and returns its string representation
     *
     * @param bool $optionsAsValues
     *
     * @return string
     */
    public function getValueAsString(bool $optionsAsValues = true): string
    {
        $value = $this->getValue();

        if (!\is_string($value)) {
            if (\is_array($value)) {
                return implode(', ', $value);
            }

            return (string) $value;
        }

        return $value;
    }

    /**
     * Either gets the ID attribute specified in custom attributes
     * or generates a new one: "form-input-{handle}"
     *
     * @return string
     */
    public function getIdAttribute(): string
    {
        $attribute = sprintf('form-input-%s', $this->getHandle());

        if ($this->getCustomAttributes()->getId()) {
            $attribute = $this->getCustomAttributes()->getId();
        }

        $attribute = $this->getCustomAttributes()->getFieldIdPrefix() . $attribute;

        return $attribute;
    }

    /**
     * Gets the overridden value if any present
     *
     * @return mixed
     */
    public function getValueOverride()
    {
        return $this->getCustomAttributes()->getOverrideValue();
    }

    /**
     * An alias for ::setCustomAttributes()
     *
     * @param array|null $attributes
     */
    public function setAttributes(array $attributes = null)
    {
        $this->setCustomAttributes($attributes);
    }

    /**
     * @return ConstraintInterface[]
     */
    public function getConstraints(): array
    {
        return [];
    }

    /**
     * @return string
     */
    protected function getInputClassString(): string
    {
        return implode(' ', $this->inputClasses);
    }

    /**
     * @param string $class
     *
     * @return $this
     */
    protected function addInputClass($class)
    {
        $this->inputClasses[] = $class;

        return $this;
    }

    /**
     * Assemble the Label HTML string
     *
     * @return string
     */
    protected function getLabelHtml(): string
    {
        $this->addLabelAttribute('class', $this->getCustomAttributes()->getLabelClass());

        $forAttribute = sprintf(' for="%s"', $this->getIdAttribute());

        $output = '<label' . $forAttribute . $this->getLabelAttributesString() . '>';
        $output .= $this->getLabel();
        $output .= '</label>';
        $output .= PHP_EOL;

        return $output;
    }

    /**
     * Assemble the Instructions HTML string
     *
     * @return string
     */
    protected function getInstructionsHtml(): string
    {
        if (!$this->getInstructions()) {
            return '';
        }

        $this->addInstructionAttribute('class', $this->getCustomAttributes()->getInstructionsClass());

        $output = '<div' . $this->getInstructionAttributesString() . '>';
        $output .= $this->getInstructions();
        $output .= '</div>';
        $output .= PHP_EOL;

        return $output;
    }

    /**
     * Assemble the Error HTML output string
     *
     * @return string
     */
    protected function getErrorHtml(): string
    {
        $errors = $this->getErrors();
        if (empty($errors)) {
            return '';
        }

        $this
            ->addErrorAttribute('class', 'errors')
            ->addErrorAttribute('class', $this->getCustomAttributes()->getErrorClass());

        $output = '<ul' . $this->getErrorAttributesString() . '>';

        foreach ($errors as $error) {
            $output .= '<li>' . htmlentities($error) . '</li>';
        }

        $output .= '</ul>';

        return $output;
    }

    /**
     * @return CustomFieldAttributes
     */
    protected function getCustomAttributes(): Attributes\CustomFieldAttributes
    {
        return $this->customAttributes;
    }

    /**
     * Outputs ' $name="$value"' where the $value is escaped
     * using htmlspecialchars() if $escapeValue is TRUE
     *
     * @param string $name
     * @param mixed  $value
     * @param bool   $escapeValue
     *
     * @param bool   $insertEmpty
     *
     * @return string
     */
    protected function getAttributeString(string $name, $value, bool $escapeValue = true, bool $insertEmpty = false): string
    {
        if ('' !== $value || $insertEmpty) {
            return sprintf(
                ' %s="%s"',
                $name,
                $escapeValue ? htmlentities($value) : $value
            );
        }

        return '';
    }

    /**
     * Outputs ' $name' if $enabled is true
     *
     * @param string $name
     * @param bool   $enabled
     *
     * @return string
     */
    protected function getParameterString(string $name, bool $enabled): string
    {
        return $enabled ? sprintf(' %s', $name) : '';
    }

    /**
     * Outputs ' $name="$value"' where the $value is a number
     *
     * @param string   $name
     * @param int|null $value
     *
     * @return string
     */
    protected function getNumericAttributeString(string $name, int $value = null): string
    {
        if (null !== $value && 0 !== $value) {
            return sprintf(' %s="%s"', $name, $value);
        }

        return '';
    }

    /**
     * @return string
     */
    protected function getRequiredAttribute(): string
    {
        $attribute = '';

        if ($this->isRequired() && $this->getCustomAttributes()->getUseRequiredAttribute()) {
            $attribute = ' required';
        }

        return $attribute;
    }

    /**
     * @param string $name
     * @param string $value
     *
     * @return AbstractField
     */
    public function addInputAttribute(string $name = null, string $value = null): AbstractField
    {
        $this->inputAttributes[sha1($name . $value)] = ['attribute' => $name, 'value' => $value];

        return $this;
    }

    /**
     * @param string $name
     * @param string $value
     *
     * @return AbstractField
     */
    public function addLabelAttribute(string $name = null, string $value = null): AbstractField
    {
        $this->labelAttributes[] = ['attribute' => $name, 'value' => $value];

        return $this;
    }

    /**
     * @param string $name
     * @param string $value
     *
     * @return AbstractField
     */
    public function addErrorAttribute(string $name = null, string $value = null): AbstractField
    {
        $this->errorAttributes[] = ['attribute' => $name, 'value' => $value];

        return $this;
    }

    /**
     * @param string $name
     * @param string $value
     *
     * @return AbstractField
     */
    public function addInstructionAttribute(string $name = null, string $value = null): AbstractField
    {
        $this->instructionAttributes[] = ['attribute' => $name, 'value' => $value];

        return $this;
    }

    /**
     * @return array
     */
    public function getInputAttributes(): array
    {
        return $this->inputAttributes ?? [];
    }

    /**
     * @return string
     */
    final public function getInputAttributesString(): string
    {
        return $this->assembleAttributeString($this->inputAttributes ?? []);
    }

    /**
     * @return array
     */
    public function getLabelAttributes(): array
    {
        return $this->labelAttributes ?? [];
    }

    /**
     * @return string
     */
    final public function getLabelAttributesString(): string
    {
        return $this->assembleAttributeString($this->labelAttributes ?? []);
    }

    /**
     * @return array
     */
    public function getErrorAttributes(): array
    {
        return $this->errorAttributes ?? [];
    }

    /**
     * @return string
     */
    final public function getErrorAttributesString(): string
    {
        return $this->assembleAttributeString($this->errorAttributes ?? []);
    }

    /**
     * @return array
     */
    public function getInstructionAttributes(): array
    {
        return $this->instructionAttributes ?? [];
    }

    /**
     * @return string
     */
    final public function getInstructionAttributesString(): string
    {
        return $this->assembleAttributeString($this->instructionAttributes ?? []);
    }

    /**
     * Assemble the Input HTML string
     *
     * @return string
     */
    abstract protected function getInputHtml(): string;

    /**
     * Output something before an input HTML is output
     *
     * @return string
     */
    protected function onBeforeInputHtml(): string
    {
        return '';
    }

    /**
     * Output something after an input HTML is output
     *
     * @return string
     */
    protected function onAfterInputHtml(): string
    {
        return '';
    }

    /**
     * Validate the field and add error messages if any
     *
     * @return array
     */
    protected function validate(): array
    {
        $form  = $this->getForm();
        $rules = $form->getRuleProperties();

        $form->getFieldHandler()->beforeValidate($this, $form);

        $errors = $this->getErrors();

        if ($this instanceof ObscureValueInterface) {
            $value = $this->getActualValue($this->getValue());
        } else {
            $value = $this->getValue();
        }

        if ($this->isRequired()) {
            if (!$rules || !$rules->isHidden($this, $form)) {
                if (\is_array($value)) {
                    $value = array_filter($value);

                    if (empty($value)) {
                        $errors[] = $this->translate('This field is required');
                    }
                } else if (null === $value || '' === \trim($value)) {
                    $errors[] = $this->translate('This field is required');
                }
            }
        }

        if (!empty($value)) {
            static $validator;

            if (null === $validator) {
                $validator = new Validator();
            }

            $violationList = $validator->validate($this, $value);

            $errors = array_merge($errors, $violationList->getErrors());
        }

        $form->getFieldHandler()->afterValidate($this, $form);

        return $errors;
    }

    /**
     * @return Form
     */
    protected function getForm(): Form
    {
        return $this->form;
    }

    /**
     * An alias method for translator
     *
     * @param string $string
     * @param array  $variables
     *
     * @return string
     */
    protected function translate(string $string = null, array $variables = []): string
    {
        return null === $string ? '' : $this->getForm()->getTranslator()->translate($string, $variables);
    }

    /**
     * @param string $output
     *
     * @return Markup
     */
    protected function renderRaw($output): Markup
    {
        return Template::raw($output);
    }

    /**
     * Sets the custom field attributes
     *
     * @param array|null $attributes
     */
    protected function setCustomAttributes(array $attributes = null)
    {
        if (null !== $attributes) {
            $this->customAttributes->mergeAttributes($attributes);
        }
    }

    /**
     * @param array $attributes
     *
     * @return string
     */
    private function assembleAttributeString(array $attributes): string
    {
        return CustomFieldAttributes::extractAttributeString(
            $attributes,
            $this,
            [
                'form'  => $this->getForm(),
                'field' => $this,
            ]
        );
    }

    /**
     * Specify data which should be serialized to JSON
     *
     * @link  http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     *        which is a value of any type other than a resource.
     * @since 5.4.0
     */
    public function jsonSerialize()
    {
        return $this->hash;
    }
}
