<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields;

use craft\helpers\Template;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Transformers\AttributesTransformer;
use Solspace\Freeform\Attributes\Property\Validators\HandleValidator;
use Solspace\Freeform\Attributes\Property\Validators\LengthValidator;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Fields\Validation\Constraints\ConstraintInterface;
use Solspace\Freeform\Fields\Validation\Validator;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Composer\Components\Attributes;
use Solspace\Freeform\Library\Composer\Components\Attributes\CustomFieldAttributes;
use Symfony\Component\PropertyAccess\Exception\NoSuchPropertyException;
use Twig\Markup;

abstract class AbstractField implements FieldInterface, \JsonSerializable
{
    #[Section('general', 'General', 0)]
    #[Property(
        instructions: 'Field label used to describe the field',
        order: 1,
        placeholder: 'My Field',
    )]
    protected string $label = '';

    #[Section('general')]
    #[Property(
        instructions: 'How you\'ll refer to this field in templates',
        order: 2,
        placeholder: 'myField',
    )]
    #[Middleware('handle')]
    #[Flag('code')]
    #[HandleValidator]
    #[LengthValidator(100)]
    protected string $handle = '';

    #[Section('general')]
    #[Property(
        type: 'textarea',
        instructions: 'Field specific user instructions',
        order: 3,
    )]
    protected string $instructions = '';

    #[Section('general')]
    #[Property('Require this field', order: 5)]
    protected bool $required = false;

    #[Section('attributes', 'Attributes', 999)]
    #[Property(
        type: Property::TYPE_ATTRIBUTES,
        instructions: 'Add attributes to your field elements.',
        value: AttributesTransformer::DEFAULT_VALUE,
        transformer: AttributesTransformer::class,
    )]
    protected FieldAttributesCollection $attributes;

    protected ?int $id = null;
    protected ?string $uid = null;
    protected string $hash = '';
    protected int $pageIndex = 0;
    protected array $errors = [];

    private Form $form;
    private mixed $defaultValue = null;

    final public function __construct(Form $form, array $properties = [])
    {
        $this->form = $form;
        $this->attributes = new FieldAttributesCollection();
        $this->updateProperties($properties);
    }

    public function __toString(): string
    {
        return $this->getValueAsString();
    }

    public function updateProperties(array $properties = []): void
    {
        $reflection = new \ReflectionClass(static::class);
        foreach ($reflection->getProperties() as $property) {
            try {
                $propertyName = $property->getName();

                if (!isset($properties[$propertyName])) {
                    continue;
                }

                $value = $properties[$propertyName];
                $this->{$propertyName} = $value;
            } catch (NoSuchPropertyException $e) {
                // Pass along
            }
        }
    }

    /**
     * Render the complete set of HTML for this field
     * That includes the Label, Input and Error messages.
     *
     * @param array $customAttributes
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
     * Render the Label HTML.
     *
     * @param array $customAttributes
     */
    final public function renderLabel(array $customAttributes = null): Markup
    {
        $this->setCustomAttributes($customAttributes);

        return $this->renderRaw($this->getLabelHtml());
    }

    public function renderInstructions(array $customAttributes = null): Markup
    {
        $this->setCustomAttributes($customAttributes);

        return $this->renderRaw($this->getInstructionsHtml());
    }

    /**
     * Render the Input HTML.
     *
     * @param array $customAttributes
     */
    final public function renderInput(array $customAttributes = null): Markup
    {
        $this->setCustomAttributes($customAttributes);

        return $this->renderRaw($this->getInputHtml());
    }

    /**
     * Outputs the HTML of errors.
     *
     * @param array $customAttributes
     */
    final public function renderErrors(array $customAttributes = null): Markup
    {
        $this->setCustomAttributes($customAttributes);

        return $this->renderRaw($this->getErrorHtml());
    }

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

        $data = json_encode($rule, \JSON_HEX_APOS);

        return $this->renderRaw(" data-ff-rule='{$data}'");
    }

    final public function canRender(): bool
    {
        return !$this instanceof NoRenderInterface;
    }

    final public function canStoreValues(): bool
    {
        return !$this instanceof NoStorageInterface;
    }

    public function isInputOnly(): bool
    {
        return $this instanceof InputOnlyInterface;
    }

    /**
     * Validates the Field value.
     */
    public function isValid(): bool
    {
        $this->addErrors($this->validate());

        return empty($this->errors);
    }

    /**
     * Returns an array of error messages.
     */
    public function getErrors(): array
    {
        return array_values($this->errors);
    }

    public function hasErrors(): bool
    {
        $errors = $this->getErrors();

        return !empty($errors);
    }

    /**
     * @return $this
     */
    public function addErrors(array $errors = null): self
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
     * @return $this
     */
    public function addError(string $error): self
    {
        $this->addErrors([$error]);

        return $this;
    }

    /**
     * Return the field TYPE.
     */
    abstract public function getType(): string;

    public function getHash(): string
    {
        return $this->hash;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUid(): ?string
    {
        return $this->uid;
    }

    public function getHandle(): ?string
    {
        return $this->handle;
    }

    public function getLabel(): string
    {
        return $this->translate($this->label);
    }

    public function getInstructions(): string
    {
        return $this->translate($this->instructions);
    }

    public function isRequired(): bool
    {
        return $this->required;
    }

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

    public function getAttributes(): FieldAttributesCollection
    {
        return $this->attributes;
    }

    public function getDefaultValue()
    {
        return $this->defaultValue;
    }

    public function getPageIndex(): int
    {
        return $this->pageIndex;
    }

    /**
     * Gets whatever value is set and returns its string representation.
     */
    public function getValueAsString(bool $optionsAsValues = true): string
    {
        $value = $this->getValue();

        if (!\is_string($value)) {
            if (\is_array($value)) {
                return StringHelper::implodeRecursively(', ', $value);
            }

            return (string) $value;
        }

        return $value;
    }

    /**
     * Either gets the ID attribute specified in custom attributes
     * or generates a new one: "form-input-{handle}".
     */
    public function getIdAttribute(): string
    {
        $attribute = sprintf('form-input-%s', $this->getHandle());

        if ($this->getCustomAttributes()->getId()) {
            $attribute = $this->getCustomAttributes()->getId();
        }

        return $this->getCustomAttributes()->getFieldIdPrefix().$attribute;
    }

    /**
     * An alias for ::setCustomAttributes().
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
     * @param string $name
     * @param string $value
     */
    public function addInputAttribute(string $name = null, string $value = null): self
    {
        $this->inputAttributes[sha1($name.$value)] = ['attribute' => $name, 'value' => $value];

        return $this;
    }

    /**
     * @param string $name
     * @param string $value
     */
    public function addLabelAttribute(string $name = null, string $value = null): self
    {
        $this->labelAttributes[] = ['attribute' => $name, 'value' => $value];

        return $this;
    }

    /**
     * @param string $name
     * @param string $value
     */
    public function addErrorAttribute(string $name = null, string $value = null): self
    {
        $this->errorAttributes[] = ['attribute' => $name, 'value' => $value];

        return $this;
    }

    /**
     * @param string $name
     * @param string $value
     */
    public function addInstructionAttribute(string $name = null, string $value = null): self
    {
        $this->instructionAttributes[] = ['attribute' => $name, 'value' => $value];

        return $this;
    }

    public function getInputAttributes(): array
    {
        return $this->inputAttributes ?? [];
    }

    final public function getInputAttributesString(): string
    {
        return $this->assembleAttributeString($this->inputAttributes ?? []);
    }

    public function getLabelAttributes(): array
    {
        return $this->labelAttributes ?? [];
    }

    final public function getLabelAttributesString(): string
    {
        return $this->assembleAttributeString($this->labelAttributes ?? []);
    }

    public function getErrorAttributes(): array
    {
        return $this->errorAttributes ?? [];
    }

    final public function getErrorAttributesString(): string
    {
        return $this->assembleAttributeString($this->errorAttributes ?? []);
    }

    public function getInstructionAttributes(): array
    {
        return $this->instructionAttributes ?? [];
    }

    final public function getInstructionAttributesString(): string
    {
        return $this->assembleAttributeString($this->instructionAttributes ?? []);
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'uid' => $this->uid,
            'typeClass' => static::class,
            'properties' => [],
        ];
    }

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
     * Assemble the Label HTML string.
     */
    protected function getLabelHtml(): string
    {
        $this->addLabelAttribute('class', $this->getCustomAttributes()->getLabelClass());

        $forAttribute = sprintf(' for="%s"', $this->getIdAttribute());

        $output = '<label'.$forAttribute.$this->getLabelAttributesString().'>';
        $output .= $this->getLabel();
        $output .= '</label>';
        $output .= \PHP_EOL;

        return $output;
    }

    /**
     * Assemble the Instructions HTML string.
     */
    protected function getInstructionsHtml(): string
    {
        if (!$this->getInstructions()) {
            return '';
        }

        $this->addInstructionAttribute('class', $this->getCustomAttributes()->getInstructionsClass());

        $output = '<div'.$this->getInstructionAttributesString().'>';
        $output .= $this->getInstructions();
        $output .= '</div>';
        $output .= \PHP_EOL;

        return $output;
    }

    /**
     * Assemble the Error HTML output string.
     */
    protected function getErrorHtml(): string
    {
        $errors = $this->getErrors();
        if (empty($errors)) {
            return '';
        }

        $this
            ->addErrorAttribute('class', 'errors')
            ->addErrorAttribute('class', $this->getCustomAttributes()->getErrorClass())
        ;

        $output = '<ul'.$this->getErrorAttributesString().'>';

        foreach ($errors as $error) {
            if (\is_array($error)) {
                $error = implode(', ', $error);
            }

            $output .= '<li>'.htmlentities($error).'</li>';
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
     * using htmlspecialchars() if $escapeValue is TRUE.
     *
     * @param mixed $value
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
     * Outputs ' $name' if $enabled is true.
     */
    protected function getParameterString(string $name, bool $enabled): string
    {
        return $enabled ? sprintf(' %s', $name) : '';
    }

    /**
     * Outputs ' $name="$value"' where the $value is a number.
     */
    protected function getNumericAttributeString(string $name, int $value = null): string
    {
        if (null !== $value && 0 !== $value) {
            return sprintf(' %s="%s"', $name, $value);
        }

        return '';
    }

    protected function getRequiredAttribute(): string
    {
        $attribute = '';

        if ($this->isRequired()) {
            $attribute = ' data-required';

            if ($this->getCustomAttributes()->getUseRequiredAttribute()) {
                $attribute = ' required';
            }
        }

        return $attribute;
    }

    /**
     * Assemble the Input HTML string.
     */
    abstract protected function getInputHtml(): string;

    /**
     * Output something before an input HTML is output.
     */
    protected function onBeforeInputHtml(): string
    {
        return '';
    }

    /**
     * Output something after an input HTML is output.
     */
    protected function onAfterInputHtml(): string
    {
        return '';
    }

    /**
     * Validate the field and add error messages if any.
     */
    protected function validate(): array
    {
        $form = $this->getForm();
        $form->getFieldHandler()->beforeValidate($this, $form);

        $errors = $this->getErrors();

        if ($this instanceof ObscureValueInterface) {
            $value = $this->getActualValue($this->getValue());
        } else {
            $value = $this->getValue();
        }

        if ($this->isRequired() && !$this->isHidden()) {
            if (\is_array($value)) {
                $value = array_filter($value);

                if (empty($value)) {
                    $errors[] = $this->translate('This field is required');
                }
            } elseif (null === $value || '' === trim($value)) {
                $errors[] = $this->translate('This field is required');
            }
        }

        if ('' !== $value && !$this->isHidden()) {
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

    protected function getForm(): Form
    {
        return $this->form;
    }

    /**
     * An alias method for translator.
     */
    protected function translate(string $string = null, array $variables = []): string
    {
        return null === $string ? '' : Freeform::t($string, $variables);
    }

    /**
     * @param string $output
     */
    protected function renderRaw($output): Markup
    {
        return Template::raw($output);
    }

    /**
     * Sets the custom field attributes.
     */
    protected function setCustomAttributes(array $attributes = null)
    {
        if (null !== $attributes) {
            $this->customAttributes->mergeAttributes($attributes);
        }
    }

    private function assembleAttributeString(array $attributes): string
    {
        return CustomFieldAttributes::extractAttributeString(
            $attributes,
            $this,
            [
                'form' => $this->getForm(),
                'field' => $this,
            ]
        );
    }
}
