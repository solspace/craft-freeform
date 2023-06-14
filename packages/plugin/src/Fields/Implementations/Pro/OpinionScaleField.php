<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Property\Implementations\TabularData\TabularDataTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Properties\Options\OptionsCollection;
use Solspace\Freeform\Fields\Properties\Options\Preset\PresetOptions;
use Solspace\Freeform\Fields\Properties\TabularData\TabularData;
use Solspace\Freeform\Form\Form;

#[Type(
    name: 'Opinion Scale',
    typeShorthand: 'opinion-scale',
    iconPath: __DIR__.'/../Icons/text.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/opinion-scale.ejs',
)]
class OpinionScaleField extends AbstractField implements ExtraFieldInterface, OptionsInterface
{
    #[ValueTransformer(TabularDataTransformer::class)]
    #[Input\TabularData(
        label: 'Scales',
        instructions: '',
        value: [],
        configuration: [
            [
                'key' => 'value',
                'label' => 'Value',
            ],
            [
                'key' => 'label',
                'label' => 'Label (Optional)',
            ],
        ],
    )]
    protected TabularData $scales;

    #[ValueTransformer(TabularDataTransformer::class)]
    #[Input\TabularData(
        label: 'Legends',
        instructions: '',
        value: [],
        configuration: [
            ['key' => 'label', 'label' => 'Legend'],
        ],
    )]
    protected TabularData $legends;

    public function __construct(Form $form)
    {
        parent::__construct($form);

        $this->scales = new TabularData();
        $this->legends = new TabularData();
    }

    public function getType(): string
    {
        return self::TYPE_OPINION_SCALE;
    }

    public function getScales(): TabularData
    {
        return $this->scales;
    }

    public function getOptions(): OptionsCollection
    {
        $collection = new PresetOptions();
        foreach ($this->getScales() as $row) {
            $value = $row[0] ?? null;
            $label = $row[1] ?? $value;

            $collection->add(
                $label,
                $value,
                $this->getValue() === $value,
            );
        }

        return $collection;
    }

    public function getOptionsAsKeyValuePairs(): array
    {
        $options = [];
        foreach ($this->getOptions() as $option) {
            $options[$option->getValue()] = $option->getLabel();
        }

        return $options;
    }

    public function getLegends(): TabularData
    {
        return $this->legends;
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();
        $description[] = 'Single option value allowed.';

        $values = [];

        foreach ($this->getOptions() as $option) {
            $values[] = '"'.$option->getValue().'"';
        }

        if (!empty($values)) {
            $description[] = 'Options include '.implode(', ', $values).'.';
        }

        $legends = [];

        foreach ($this->getLegends() as $legend) {
            $legends[] = '"'.$legend['legend'].'"';
        }

        if (!empty($legends)) {
            $description[] = 'Legends include '.implode(' to ', $legends).'.';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    protected function getInputHtml(): string
    {
        if (empty($this->scales)) {
            return '';
        }

        $attributes = $this->attributes->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', 'radio')
        ;

        $output = '<div class="opinion-scale">';

        $output .= '<ul class="opinion-scale-scales">';
        foreach ($this->getScales() as $index => $scale) {
            [$value, $label] = $scale;
            $label = $label ?: $value;

            $isSelected = $value == $this->getValue();
            $id = $this->getIdAttribute()."-{$index}";

            $inputAttributes = $attributes
                ->clone()
                ->replace('id', $id)
                ->replace('value', $value)
                ->replace('checked', $isSelected)
            ;

            $output .= '<li>';

            $output .= '<input'.$inputAttributes.' />';

            $output .= '<label for="'.$id.'">';
            $output .= $this->translate($label);
            $output .= '</label>';

            $output .= '</li>';
        }
        $output .= '</ul>';

        if ($this->getLegends()) {
            $output .= '<ul class="opinion-scale-legends">';
            foreach ($this->getLegends() as $legend) {
                $output .= '<li>';
                $output .= $legend[0];
                $output .= '</li>';
            }
            $output .= '</ul>';
        }

        $output .= '</div>';

        return $output;
    }
}
