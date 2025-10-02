<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Attributes\FieldAttributesTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\OpinionScale\LegendsTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\OpinionScale\ScalesTransformer;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Limitation;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\BaseOptionsField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Properties\OpinionScale\Legend;
use Solspace\Freeform\Fields\Properties\OpinionScale\Scale;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;

#[Type(
    name: 'Opinion Scale',
    typeShorthand: 'opinion-scale',
    iconPath: __DIR__.'/../Icons/opinion-scale.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/opinion-scale.ejs',
)]
class OpinionScaleField extends BaseOptionsField implements ExtraFieldInterface, OptionsInterface
{
    #[Translatable]
    #[ValueTransformer(ScalesTransformer::class)]
    #[Input\TabularData(
        label: 'Scales',
        instructions: 'The options a user can choose from.',
        value: [],
        configuration: [
            [
                'key' => 'value',
                'label' => 'Value',
            ],
            [
                'key' => 'label',
                'label' => 'Label (Optional)',
                'translatable' => true,
            ],
        ],
    )]
    protected array $scales = [];

    #[Translatable]
    #[ValueTransformer(LegendsTransformer::class)]
    #[Input\TabularData(
        label: 'Legends',
        instructions: 'Descriptions of options or ranges of options (does not need to match the number of options available).',
        value: [],
        configuration: [
            [
                'key' => 'label',
                'label' => 'Legend',
                'translatable' => true,
            ],
        ],
    )]
    protected array $legends = [];

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
                'label' => 'Scale Input',
                'previewTag' => 'input',
            ],
            [
                'handle' => 'optionLabel',
                'label' => 'Scale Label',
                'previewTag' => 'label',
            ],
            [
                'handle' => 'option',
                'label' => 'Legend',
                'previewTag' => 'li',
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
        ]
    )]
    protected FieldAttributesCollection $attributes;

    public function getType(): string
    {
        return self::TYPE_OPINION_SCALE;
    }

    /**
     * @return Scale[]
     */
    public function getScales(): array
    {
        $scales = $this->scales;

        $translationTable = $this->getTranslationTable();
        if ($translationTable->get('scales')) {
            $translatedScales = $translationTable->get('scales');

            $translations = [];
            foreach ($scales as $scale) {
                $found = array_find($translatedScales, fn ($item) => $item[0] === $scale->getValue());
                if ($found) {
                    $translations[] = new Scale($found[0], $found[1]);
                } else {
                    $translations[] = $scale;
                }
            }

            $scales = $translations;
        }

        return $scales;
    }

    /**
     * @return Legend[]
     */
    public function getLegends(): array
    {
        $translations = $this->getTranslationTable()->get('legends');
        if (!$translations) {
            return $this->legends;
        }

        $legends = [];
        foreach ($translations as $translation) {
            [$label] = $translation;

            $legends[] = new Legend($label);
        }

        return $legends;
    }

    public function getOptions(): OptionCollection
    {
        $collection = new OptionCollection();
        foreach ($this->getScales() as $scale) {
            $value = $scale->getValue();
            $label = $scale->getLabel();

            $collection->add($value, $label);
        }

        return $collection;
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();
        $description[] = 'Single option value allowed.';

        $values = [];
        foreach ($this->getScales() as $scale) {
            $values[] = '"'.$scale->getValue().'"';
        }

        if (!empty($values)) {
            $description[] = 'Options include '.implode(', ', $values).'.';
        }

        $legends = [];
        foreach ($this->getLegends() as $legend) {
            $legends[] = '"'.$legend.'"';
        }

        if (!empty($legends)) {
            $description[] = 'Legends include '.implode(' to ', $legends).'.';
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
        if (empty($this->scales)) {
            return '';
        }

        $attributesCollection = $this->getAttributes();

        $attributes = $attributesCollection
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', 'radio')
        ;

        $output = '<div class="opinion-scale">';

        $output .= '<ul class="opinion-scale-scales">';
        foreach ($this->getScales() as $index => $scale) {
            $label = $scale->getLabel();
            $value = $scale->getValue();

            $label = $label ?: $value;

            $isSelected = $value == $this->getValue();
            $id = $this->getIdAttribute()."-{$index}";

            $variables = [
                'i' => $index,
                'index' => $index,
                'scale' => $scale,
                'option' => $scale,
                'field' => $this,
            ];

            $inputAttributes = $attributes
                ->clone()
                ->replace('id', $id)
                ->replace('value', $value)
                ->replace('checked', $isSelected)
            ;

            $output .= '<li>';

            $output .= Html::tag(
                $inputAttributes->getTag('input'),
                '',
                $inputAttributes->toHtmlTagArray($variables)
            );

            $labelAttributes = $attributesCollection
                ->getOptionLabel()
                ->clone()
                ->setIfEmpty('for', $id)
            ;

            $output .= Html::tag(
                $labelAttributes->getTag('label'),
                $label,
                $labelAttributes->toHtmlTagArray($variables)
            );

            $output .= '</li>';
        }
        $output .= '</ul>';

        if ($this->getLegends()) {
            $output .= '<ul class="opinion-scale-legends">';
            foreach ($this->getLegends() as $index => $legend) {
                $legendAttributes = $attributesCollection
                    ->getOption()
                    ->clone()
                ;

                $output .= Html::tag(
                    $legendAttributes->getTag('li'),
                    $legend,
                    $legendAttributes->toHtmlTagArray([
                        'i' => $index,
                        'index' => $index,
                        'legend' => $legend,
                        'field' => $this,
                    ])
                );
            }
            $output .= '</ul>';
        }

        $output .= '</div>';

        return $output;
    }
}
