<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Properties\Options\OptionsCollection;
use Solspace\Freeform\Fields\Properties\Options\Preset\PresetOptions;
use Solspace\Freeform\Fields\Validation\Constraints\NumericConstraint;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\HashHelper;

#[Type(
    name: 'Rating',
    typeShorthand: 'rating',
    iconPath: __DIR__.'/../Icons/text.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/rating.ejs',
)]
class RatingField extends AbstractField implements ExtraFieldInterface, OptionsInterface
{
    public const MIN_VALUE = 3;
    public const MAX_VALUE = 10;

    #[Input\Select(
        label: 'Maximum Number of Stars',
        options: [
            1 => 1,
            2 => 2,
            3 => 3,
            4 => 4,
            5 => 5,
            6 => 6,
            7 => 7,
            8 => 8,
            9 => 9,
            10 => 10,
        ],
    )]
    protected int $maxValue = 5;

    #[Input\ColorPicker('Unselected Color')]
    protected string $colorIdle = '#DDDDDD';

    #[Input\ColorPicker('Hover Color')]
    protected string $colorHover = '#FFD700';

    #[Input\ColorPicker('Selected Color')]
    protected string $colorSelected = '#FF7700';

    /**
     * @param T $value
     */
    public function setValue(mixed $value): FieldInterface
    {
        // Prevents GraphQL from triggering an number constraint violation
        if (!empty($this->getValue())) {
            $this->value = $value;
        } else {
            $this->value = null;
        }

        return $this;
    }

    public function getType(): string
    {
        return self::TYPE_RATING;
    }

    public function getOptions(): OptionsCollection
    {
        $collection = new PresetOptions();

        for ($i = 1; $i <= $this->getMaxValue(); ++$i) {
            $collection->add($i, $i, $i === (int) $this->getValue());
        }

        return $collection;
    }

    public function getOptionsAsKeyValuePairs(): array
    {
        $options = [];
        foreach ($this->getOptions() as $option) {
            $options[$option->value] = $option->label;
        }

        return $options;
    }

    public function getMaxValue(): int
    {
        return min(
            max(self::MIN_VALUE, $this->maxValue),
            self::MAX_VALUE
        );
    }

    public function getColorIdle(): string
    {
        return $this->colorIdle;
    }

    public function getColorHover(): string
    {
        return $this->colorHover;
    }

    public function getColorSelected(): string
    {
        return $this->colorSelected;
    }

    /**
     * {@inheritDoc}
     */
    public function getConstraints(): array
    {
        $constraints = parent::getConstraints();
        $constraints[] = new NumericConstraint(
            1,
            $this->getMaxValue(),
            null,
            null,
            null,
            false,
            null,
            null,
            null,
            $this->translate('Rating must be between {{min}} and {{max}}')
        );

        return $constraints;
    }

    public function getContentGqlType(): array|\GraphQL\Type\Definition\Type
    {
        return \GraphQL\Type\Definition\Type::int();
    }

    public function getContentGqlMutationArgumentType(): array|\GraphQL\Type\Definition\Type
    {
        $description = $this->getContentGqlDescription();
        $description[] = 'Single option value allowed.';

        $values = [];

        foreach ($this->getOptions() as $option) {
            $values[] = $option->getValue();
        }

        if (!empty($values)) {
            $description[] = 'Options include '.implode(', ', $values).'.';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    /**
     * {@inheritDoc}
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->replace('type', 'radio')
        ;

        $spanAttributes = (new Attributes())
            ->append('class', 'form-rating-field-wrapper')
            ->append('class', $this->getFormSha().'-'.$this->getHandle().'-rating-wrapper')
            ->set('id', $this->getIdAttribute())
        ;

        $output = $this->getStyles();

        $output .= '<div>';
        $output .= '<span '.$spanAttributes.'>';

        $maxValue = $this->getMaxValue();
        for ($i = $maxValue; $i >= 1; --$i) {
            $starId = $this->getIdAttribute().'_star_'.$i;

            $inputAttributes = clone $attributes;
            $inputAttributes
                ->set('id', $starId)
                ->replace('value', $i)
                ->replace('checked', (int) $this->getValue() === $i)
            ;

            $output .= '<input'.$inputAttributes.' />'.\PHP_EOL;

            $output .= '<label for="'.$starId.'"></label>';
        }
        $output .= '</span>';
        $output .= '<div style="clear: both;"></div>';
        $output .= '</div>';

        return $output;
    }

    private function getStyles(): string
    {
        $freeform = \Yii::getAlias('@freeform');
        $cssPath = $freeform.'/Resources/css/front-end/fields/rating.css';

        $output = '<style>'.\PHP_EOL;
        $output .= @file_get_contents($cssPath);
        $output .= '</style>';

        $replaceMap = [
            'formhash' => $this->getFormSha(),
            'fieldname' => $this->getHandle(),
            'coloridle' => $this->getColorIdle(),
            'colorhover' => $this->getColorHover(),
            'colorselected' => $this->getColorSelected(),
        ];

        return str_replace(array_keys($replaceMap), $replaceMap, $output);
    }

    private function getFormSha(): string
    {
        return 'f'.HashHelper::sha1($this->getId(), 6);
    }
}
