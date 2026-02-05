<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\FieldAttributesTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\BaseOptionsField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Traits\DefaultTextValueTrait;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Helpers\HashHelper;

#[Type(
    name: 'Rating',
    typeShorthand: 'rating',
    iconPath: __DIR__.'/../Icons/rating.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/rating.ejs',
)]
class RatingField extends BaseOptionsField implements ExtraFieldInterface, OptionsInterface, DefaultValueInterface
{
    use DefaultTextValueTrait;

    public const MIN_VALUE = 3;
    public const MAX_VALUE = 10;

    #[Limitation('props.rating', 'max')]
    #[DefaultValue('props.rating.max')]
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

    #[Limitation('props.rating', 'idle')]
    #[DefaultValue('props.rating.idle')]
    #[Input\ColorPicker('Unselected Color')]
    protected string $colorIdle = '#DDDDDD';

    #[Limitation('props.rating', 'hover')]
    #[DefaultValue('props.rating.hover')]
    #[Input\ColorPicker('Hover Color')]
    protected string $colorHover = '#FFD700';

    #[Limitation('props.rating', 'selected')]
    #[DefaultValue('props.rating.selected')]
    #[Input\ColorPicker('Selected Color')]
    protected string $colorSelected = '#FF7700';

    #[Section('attributes')]
    #[Limitation('layout.fields.attributes')]
    #[ValueTransformer(FieldAttributesTransformer::class)]
    #[Input\Attributes(
        instructions: 'Add attributes to your field elements.',
        tabs: [
            [
                'handle' => 'container',
                'label' => 'Container',
                'previewTag' => 'div',
            ],
            [
                'handle' => 'input',
                'label' => 'Input',
                'previewTag' => 'input',
            ],
            [
                'handle' => 'label',
                'label' => 'Label',
                'previewTag' => 'label',
            ],
            [
                'handle' => 'instructions',
                'label' => 'Instructions',
                'previewTag' => 'div',
            ],
            [
                'handle' => 'error',
                'label' => 'Error',
                'previewTag' => 'ul',
            ],
            [
                'handle' => 'optionLabel',
                'label' => 'Star',
                'previewTag' => 'label',
            ],
        ]
    )]
    protected FieldAttributesCollection $attributes;

    public function setValue(mixed $value): FieldInterface
    {
        if (!empty($value)) {
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

    public function getOptions(): OptionCollection
    {
        $collection = new OptionCollection();

        for ($i = 1; $i <= $this->getMaxValue(); ++$i) {
            $collection->add($i, $i);
        }

        return $collection;
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

    public function getContentGqlType(): array|GQLType
    {
        return GQLType::int();
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
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
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    protected function getInputHtml(): string
    {
        $attributeCollection = $this->getAttributes();

        $attributes = $attributeCollection
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->replace('type', 'radio')
        ;

        $spanAttributes = (new Attributes())
            ->append('class', 'form-rating-field-wrapper')
            ->set('id', $this->getIdAttribute())
        ;

        $output = '';

        $maxValue = $this->getMaxValue();
        for ($i = $maxValue; $i >= 1; --$i) {
            $starId = $this->getIdAttribute().'_star_'.$i;
            $isChecked = (int) $this->getValue() === $i;

            $variables = [
                'i' => $i,
                'index' => $i,
                'field' => $this,
                'checked' => $isChecked,
            ];

            $inputAttributes = $attributes
                ->clone()
                ->set('id', $starId)
                ->replace('value', $i)
                ->replace('checked', $isChecked)
            ;

            $output .= Html::tag(
                $inputAttributes->getTag('input'),
                '',
                $inputAttributes->toHtmlTagArray($variables)
            );

            $labelAttributes = $attributeCollection
                ->getOptionLabel()
                ->clone()
                ->setIfEmpty('for', $starId)
            ;

            $output .= Html::tag(
                'label',
                '',
                $labelAttributes->toHtmlTagArray($variables)
            );
        }

        return Html::tag(
            'div',
            Html::tag(
                'span',
                $output,
                $spanAttributes->toHtmlTagArray([
                    'field' => $this,
                ])
            )
        );
    }

    private function getFormSha(): string
    {
        return 'f'.HashHelper::sha1($this->getId(), 6);
    }
}
