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
use PhpParser\Node\Param;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Attributes\AttributesTransformer;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Fields\Parameters\Parameters;
use Solspace\Freeform\Fields\Validation\Constraints\ConstraintInterface;
use Solspace\Freeform\Fields\Validation\Validator;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificatorInterface;
use Twig\Markup;

abstract class AbstractField implements FieldInterface, IdentificatorInterface
{
    #[Section(
        handle: 'general',
        label: 'General',
        icon: __DIR__.'/SectionIcons/bookmark.svg',
        order: 0,
    )]
    #[Property(
        instructions: 'Field label used to describe the field',
        order: 1,
        required: true,
        placeholder: 'My Field',
    )]
    protected string $label = '';

    #[Section('general')]
    #[Property(
        instructions: "How you'll refer to this field in templates",
        order: 2,
        required: true,
        placeholder: 'myField',
    )]
    #[Middleware('handle')]
    #[Flag('code')]
    #[Validators\Handle]
    #[Validators\Length(100)]
    protected string $handle = '';

    #[Section('general')]
    #[Property(
        instructions: 'Field specific user instructions',
        type: Property::TYPE_TEXTAREA,
        order: 3,
    )]
    protected string $instructions = '';

    #[Section('general')]
    #[Property('Require this field', order: 5)]
    protected bool $required = false;

    #[Section(
        handle: 'attributes',
        label: 'Attributes',
        icon: __DIR__.'/SectionIcons/list.svg',
        order: 999,
    )]
    #[Property(
        instructions: 'Add attributes to your field elements.',
        type: Property::TYPE_ATTRIBUTES,
        value: AttributesTransformer::DEFAULT_VALUE,
        transformer: AttributesTransformer::class,
    )]
    protected FieldAttributesCollection $attributes;

    protected Parameters $parameters;

    protected ?int $id = null;
    protected ?string $uid = null;
    protected string $hash = '';
    protected int $pageIndex = 0;
    protected array $errors = [];

    private mixed $defaultValue = null;

    public function __construct(private Form $form)
    {
        $this->attributes = new FieldAttributesCollection();
        $this->parameters = new Parameters();
    }

    public function __toString(): string
    {
        return $this->getValueAsString();
    }

    /**
     * Render the complete set of HTML for this field
     * That includes the Label, Input and Error messages.
     *
     * @param array $parameters
     */
    final public function render(array $parameters = null): Markup
    {
        $this->setParameters($parameters);

        $output = '';
        if (!$this instanceof InputOnlyInterface) {
            $output .= $this->getLabelHtml();
        }

        $instructionsBelow = 'below' === strtolower($this->parameters->instructions);

        // Show instructions above by default
        if (!$instructionsBelow) {
            $output .= $this->getInstructionsHtml();
        }

        $output .= $this->onBeforeInputHtml();
        $output .= $this->getInputHtml();
        $output .= $this->onAfterInputHtml();

        // Show instructions below only if set by a property
        if ($instructionsBelow) {
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
    final public function renderLabel(array $parameters = null): Markup
    {
        $this->setParameters($parameters);

        return $this->renderRaw($this->getLabelHtml());
    }

    public function renderInstructions(array $parameters = null): Markup
    {
        $this->setParameters($parameters);

        return $this->renderRaw($this->getInstructionsHtml());
    }

    /**
     * Render the Input HTML.
     *
     * @param array $parameters
     */
    final public function renderInput(array $parameters = null): Markup
    {
        $this->setParameters($parameters);

        return $this->renderRaw($this->getInputHtml());
    }

    /**
     * Outputs the HTML of errors.
     *
     * @param array $parameters
     */
    final public function renderErrors(array $parameters = null): Markup
    {
        $this->setParameters($parameters);

        return $this->renderRaw($this->getErrorHtml());
    }

    // TODO: refactor
    final public function rulesHtmlData(): Markup
    {
        /*
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
        */

        return $this->renderRaw('');
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

    public function getNormalizeIdentificator(): int|string|null
    {
        return $this->getUid();
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

    // TODO: reimplement this
    public function isHidden(): bool
    {
        return false;
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

    public function getParameters(): Parameters
    {
        return $this->parameters;
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

        if ($this->parameters->id) {
            $attribute = $this->parameters->id;
        }

        return $this->parameters->fieldIdPrefix.$attribute;
    }

    /**
     * @return ConstraintInterface[]
     */
    public function getConstraints(): array
    {
        return [];
    }

    /**
     * Assemble the Label HTML string.
     */
    protected function getLabelHtml(): string
    {
        $attributes = $this->attributes->getLabel()
            ->clone()
            ->replace('for', $this->getIdAttribute())
        ;

        $output = '<label '.$attributes.'>';
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

        $output = '<div'.$this->attributes->getInstructions().'>';
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

        $attributes = clone $this->attributes->getError()
            ->clone()
            ->append('class', 'errors')
        ;

        $output = '<ul'.$attributes.'>';

        foreach ($errors as $error) {
            if (\is_array($error)) {
                $error = implode(', ', $error);
            }

            $output .= '<li>'.htmlentities($error).'</li>';
        }

        $output .= '</ul>';

        return $output;
    }

    protected function getRequiredAttribute(): string
    {
        $attribute = '';

        if ($this->isRequired()) {
            $attribute = ' data-required';

            if ($this->parameters->useRequiredAttribute) {
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

    protected function renderRaw(string $output): Markup
    {
        return Template::raw($output);
    }

    protected function setParameters(array $parameters = null): void
    {
        if (null !== $parameters && \array_key_exists('attributes', $parameters)) {
            $attributes = $parameters['attributes'] ?? [];
            unset($parameters['attributes']);

            $this->attributes->merge($attributes);
        }

        foreach ($parameters as $key => $value) {
            $this->parameters->add($key, $value);
        }
    }
}
