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
use GraphQL\Type\Definition\Type;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\AttributesTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Parameters\Parameters;
use Solspace\Freeform\Fields\Validation\Constraints\ConstraintInterface;
use Solspace\Freeform\Fields\Validation\Validator;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Serialization\Normalizers\IdentificatorInterface;
use Symfony\Component\Serializer\Annotation\Ignore;
use Twig\Markup;
use yii\base\Event;

/**
 * @template T
 */
abstract class AbstractField implements FieldInterface, IdentificatorInterface
{
    #[Section('general')]
    #[Input\Text(
        instructions: "How you'll refer to this field in templates",
        order: 2,
        placeholder: 'myField',
    )]
    #[Middleware('handle')]
    #[Flag('code')]
    #[Validators\Required]
    #[Validators\Handle]
    #[Validators\Length(100)]
    public string $handle = '';
    #[Section(
        handle: 'general',
        label: 'General',
        icon: __DIR__.'/SectionIcons/bookmark.svg',
        order: 0,
    )]
    #[Input\Text(
        instructions: 'Field label used to describe the field',
        order: 1,
        placeholder: 'My Field',
    )]
    #[Validators\Required]
    protected string $label = '';

    #[Section('general')]
    #[Input\TextArea(
        instructions: 'Field specific user instructions',
        order: 3,
    )]
    protected string $instructions = '';

    #[Section('general')]
    #[Input\Boolean(
        label: 'Require this field',
        order: 5
    )]
    protected bool $required = false;

    #[Section(
        handle: 'attributes',
        label: 'Attributes',
        icon: __DIR__.'/SectionIcons/list.svg',
        order: 999,
    )]
    #[ValueTransformer(AttributesTransformer::class)]
    #[Input\Attributes(
        instructions: 'Add attributes to your field elements.',
    )]
    protected FieldAttributesCollection $attributes;

    protected Parameters $parameters;

    protected ?int $id = null;
    protected ?string $uid = null;
    protected int $pageIndex = 0;
    protected array $errors = [];

    /** @var T */
    protected mixed $value = null;

    /** @var T */
    private mixed $defaultValue = null;

    public function __construct(
        #[Ignore] private Form $form
    ) {
        $this->attributes = new FieldAttributesCollection();
        $this->parameters = new Parameters();
    }

    public function __toString(): string
    {
        return $this->getValueAsString();
    }

    /**
     * @return T
     */
    public function getValue(): mixed
    {
        return $this->value;
    }

    /**
     * @param T $value
     */
    public function setValue(mixed $value): FieldInterface
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Render the complete set of HTML for this field
     * That includes the Label, Input and Error messages.
     */
    final public function render(array $parameters = null): Markup
    {
        $this->setParameters($parameters);

        $output = '<div'.$this->attributes->getContainer().'>';

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

        $output .= '</div>';

        return $this->renderRaw($output);
    }

    /**
     * Render the Label HTML.
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
     */
    final public function renderInput(array $parameters = null): Markup
    {
        $this->setParameters($parameters);

        return $this->renderRaw($this->getInputHtml());
    }

    /**
     * Outputs the HTML of errors.
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

    public function getContentGqlDescription(): array
    {
        $description = [];
        $description[] = $this->getInstructions();

        if ($this->isRequired()) {
            $description[] = 'Value is required.';
        }

        return $description;
    }

    public function getContentGqlType(): Type|array
    {
        return Type::string();
    }

    public function getContentGqlMutationArgumentType(): Type|array
    {
        $description = $this->getContentGqlDescription();
        $description = implode("\n", $description);

        return [
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    public function includeInGqlSchema(): bool
    {
        return true;
    }

    public function setParameters(array $parameters = null): void
    {
        if (!\is_array($parameters)) {
            return;
        }

        foreach ($parameters as $key => $value) {
            try {
                $property = new \ReflectionProperty($this, $key);
                $type = $property->getType();
                if ($type) {
                    $instance = new \ReflectionClass($type->getName());
                    if (Attributes::class === $instance->getName() || $instance->isSubclassOf(Attributes::class)) {
                        $this->{$key}->merge($value);
                        unset($parameters[$key]);

                        continue;
                    }
                }
            } catch (\ReflectionException $e) {
                // do nothing
            }

            $this->parameters->add($key, $value);
        }
    }

    public function getForm(): Form
    {
        return $this->form;
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

        $output = '<label'.$attributes.'>';
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
        $event = new ValidateEvent($this);
        Event::trigger($this, self::EVENT_BEFORE_VALIDATE, $event);

        $errors = $this->getErrors();
        $value = $this->getValue();

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

        Event::trigger($this, self::EVENT_AFTER_VALIDATE, $event);

        return $errors;
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
}
