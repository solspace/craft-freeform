<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\gql\types\Number as NumberType;
use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NumericInterface;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;

#[Type(
    name: 'Range Slider',
    typeShorthand: 'range',
    iconPath: __DIR__.'/Icons/range.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/range.ejs',
)]
class RangeField extends AbstractField implements DefaultValueInterface, NumericInterface, EncryptionInterface, ExtraFieldInterface
{
    use EncryptionTrait;

    #[Input\Integer(label: 'Minimum value', instructions: 'The lowest value available on the slider.', order: 1, step: 0.01)]
    protected ?float $minValue = 0;

    #[Input\Integer(label: 'Maximum value', instructions: 'The highest value available on the slider.', order: 2, step: 0.01)]
    protected ?float $maxValue = 100;

    #[Input\Integer(label: 'Step', instructions: 'The increment between slider values. Must be greater than zero.', order: 3, step: 0.01)]
    protected ?float $step = 1;

    #[Input\Integer(label: 'Default value', instructions: 'Leave blank to start at the minimum. Values are aligned to the nearest available step.', order: 4, step: 0.01)]
    protected ?float $defaultValue = null;

    public function getType(): string
    {
        return self::TYPE_RANGE;
    }

    public function getMinValue(): float
    {
        return null !== $this->minValue && is_finite($this->minValue) ? $this->minValue : 0;
    }

    public function getMaxValue(): float
    {
        $max = null !== $this->maxValue && is_finite($this->maxValue) ? $this->maxValue : 100;

        return max($this->getMinValue(), $max);
    }

    public function getStep(): float
    {
        return null !== $this->step && is_finite($this->step) && $this->step > 0 ? $this->step : 1;
    }

    public function getDefaultValue(): float
    {
        $min = $this->getMinValue();
        $max = $this->getMaxValue();
        $step = $this->getStep();
        $value = null !== $this->defaultValue && is_finite($this->defaultValue) ? $this->defaultValue : $min;
        $steps = min(round((max($min, min($max, $value)) - $min) / $step), floor(($max - $min) / $step + 1e-9));

        $value = $min + $steps * $step;

        return is_finite($value) ? max($min, min($max, (float) \sprintf('%.14g', $value))) : $min;
    }

    public function getValue(): mixed
    {
        $value = parent::getValue();

        // Preserve invalid input for validation; never clamp submitted values.
        return (\is_string($value) || \is_int($value) || \is_float($value)) && is_numeric($value) ? $value + 0 : $value;
    }

    public function getContentGqlType(): array|GQLType
    {
        return NumberType::getType();
    }

    protected function getInputHtml(): string
    {
        $attributes = $this->getAttributes()->getInput()->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->replace('type', 'range')
            ->replace('min', $this->getMinValue())
            ->replace('max', $this->getMaxValue())
            ->replace('step', $this->getStep())
            ->replace('data-freeform-range', true)
            ->append('class', 'ff-range-input')
            ->setIfEmpty('value', $this->getValue() ?? $this->getDefaultValue())
            ->set($this->getRequiredAttribute())
        ;
        $htmlAttributes = $attributes->toHtmlTagArray(['field' => $this]);
        $value = $htmlAttributes['value'];
        if (!\is_scalar($value) || !is_numeric($value) || !is_finite((float) $value)) {
            $value = $this->getDefaultValue();
            $htmlAttributes['value'] = $value;
        }

        return Html::tag(
            'div',
            Html::tag('input', '', $htmlAttributes)
            .Html::tag(
                'div',
                Html::tag('span', Html::encode((string) $this->getMinValue()), ['aria-hidden' => 'true'])
                .Html::tag('output', Html::encode((string) $value), ['for' => $htmlAttributes['id'], 'class' => 'ff-range-value', 'aria-live' => 'off', 'hidden' => true])
                .Html::tag('span', Html::encode((string) $this->getMaxValue()), ['aria-hidden' => 'true']),
                ['class' => 'ff-range-values']
            ),
            ['class' => 'ff-range']
        );
    }
}
