<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\gql\types\Number as NumberType;
use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Interfaces\MinLengthInterface;
use Solspace\Freeform\Fields\Interfaces\NumericInterface;
use Solspace\Freeform\Fields\Traits\MinLengthTrait;
use Solspace\Freeform\Freeform;

#[Type(
    name: 'Number',
    typeShorthand: 'number',
    iconPath: __DIR__.'/Icons/number.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/text.ejs',
)]
class NumberField extends TextField implements NumericInterface, MinLengthInterface
{
    use MinLengthTrait;
    // Character counts are only configurable on Text and Textarea fields.
    protected bool $showCharacterCount = false;

    #[Input\Boolean('Allow negative numbers')]
    protected bool $allowNegative = false;

    #[Input\MinMax(
        label: 'Min/Max Values',
        instructions: 'The minimum and/or maximum numeric value this field is allowed to have (optional).',
    )]
    protected ?array $minMaxValues = [null, null];

    #[Input\Integer(
        placeholder: 'Leave blank for no decimals',
        min: 0,
        unit: 'places',
    )]
    protected ?int $decimalCount = 0;

    #[Input\Integer(
        instructions: 'The step',
        min: 0,
    )]
    protected ?float $step = 1;

    public function getValue(): mixed
    {
        $value = $this->getRawValue();
        if ($this->hasErrors() || (!\is_string($value) && !\is_int($value) && !\is_float($value))) {
            return $value;
        }
        $value = str_replace(',', '.', $value);
        if (is_numeric($value)) {
            $value += 0;
        }

        return $value;
    }

    public function getRawValue(): mixed
    {
        return parent::getValue();
    }

    public function getMinMaxValues(): array
    {
        if (!\is_array($this->minMaxValues)) {
            return [null, null];
        }

        return $this->minMaxValues;
    }

    public function getType(): string
    {
        return self::TYPE_NUMBER;
    }

    public function getMinValue(): ?float
    {
        [$min] = $this->getMinMaxValues();

        return $min;
    }

    public function getMaxValue(): ?float
    {
        [, $max] = $this->getMinMaxValues();

        return $max;
    }

    public function getDecimalCount(): int
    {
        return $this->decimalCount ?? 0;
    }

    public function isAllowNegative(): bool
    {
        return $this->allowNegative;
    }

    public function getStep(): float
    {
        $step = $this->step ?? 1;
        // The standard increment follows decimal precision; custom increments remain authoritative.
        if ($step <= 0 || (1.0 === (float) $step && $this->getDecimalCount() > 0)) {
            return 10 ** -min(15, max(0, $this->getDecimalCount()));
        }

        return $step;
    }

    public function getInputMode(): string
    {
        // Some mobile numeric keyboards omit the minus sign.
        return $this->isAllowNegative() ? 'text' : ($this->getDecimalCount() > 0 ? 'decimal' : 'numeric');
    }

    public function getNumberConfig(): array
    {
        return [
            'min' => $this->getMinValue(),
            'max' => $this->getMaxValue(),
            'decimalCount' => max(0, $this->getDecimalCount()),
            'allowNegative' => $this->isAllowNegative(),
            'step' => $this->getStep(),
            'messages' => [
                'numeric' => Freeform::t('Enter a number.'),
                'whole' => Freeform::t('Enter a whole number.'),
                'decimals' => Freeform::t('Use no more than {limit} decimal places.'),
                'negative' => Freeform::t('Enter zero or a positive number.'),
                'min' => Freeform::t('Enter a number greater than or equal to {min}.'),
                'max' => Freeform::t('Enter a number less than or equal to {max}.'),
                'range' => Freeform::t('Enter a number between {min} and {max}.'),
                'step' => Freeform::t('Enter a number in increments of {step}.'),
            ],
        ];
    }

    public function getContentGqlType(): array|GQLType
    {
        return NumberType::getType();
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();

        if ($this->isAllowNegative()) {
            $description[] = 'Negative numbers are allowed.';
        } else {
            $description[] = 'Only positive numbers are allowed.';
        }

        if (!empty($this->getMinValue())) {
            $description[] = 'Min value: '.$this->getMinValue().'.';
        }

        if (!empty($this->getMaxValue())) {
            $description[] = 'Max value: '.$this->getMaxValue().'.';
        }

        if (!empty($this->getMinLength())) {
            $description[] = 'Min length: '.$this->getMinLength().'.';
        }

        if (!empty($this->getMaxLength())) {
            $description[] = 'Max length: '.$this->getMaxLength().'.';
        }

        if (!empty($this->getStep())) {
            $description[] = 'Step value: '.$this->getStep().'.';
        }

        if (!empty($this->getDecimalCount())) {
            $description[] = $this->getDecimalCount().' decimal places are allowed.';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    /**
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        // Use the same compiled error attributes as renderErrors(), including template overrides.
        $errorField = clone $this;
        $errorField->addError('number');
        $errorAttributes = $errorField->getAttributes()->getError()->clone()->setIfEmpty('class', 'errors');
        $config = $this->getNumberConfig();
        $config['error'] = [
            'tag' => $errorAttributes->getTag('ul'),
            'itemTag' => $errorAttributes->getTag('li'),
            'attributes' => $errorAttributes->toHtmlTagArray(['field' => $errorField]),
        ];

        $attributes = $this->getAttributes()->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', 'number')
            ->setIfEmpty('inputmode', $this->getInputMode())
            ->replace('data-freeform-number', json_encode($config, \JSON_THROW_ON_ERROR))
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('min', $this->isAllowNegative() ? $this->getMinValue() : max(0, $this->getMinValue() ?? 0))
            ->setIfEmpty('max', $this->getMaxValue())
            ->setIfEmpty('step', $this->getStep())
            ->setIfEmpty('placeholder', $this->translate('placeholder', $this->getPlaceholder()))
            ->setIfEmpty('value', \is_scalar($this->getRawValue()) ? $this->getRawValue() : '')
            ->set($this->getRequiredAttribute())
        ;

        return Html::tag(
            $attributes->getTag('input'),
            '',
            $attributes->toHtmlTagArray(['field' => $this])
        );
    }
}
