<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Properties\Options\OptionsCollection;
use Solspace\Freeform\Fields\Properties\Options\Preset\PresetOptions;
use Solspace\Freeform\Fields\Traits\SingleValueTrait;

#[Type(
    name: 'Opinion Scale',
    typeShorthand: 'opinion-scale',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class OpinionScaleField extends AbstractField implements ExtraFieldInterface, OptionsInterface
{
    use SingleValueTrait;

    /** @var array */
    protected $scales;

    /** @var array */
    protected $legends;

    public function getType(): string
    {
        return self::TYPE_OPINION_SCALE;
    }

    public function getScales(): array
    {
        if (empty($this->scales)) {
            return [];
        }

        $scales = [];
        foreach ($this->scales as $index => $scale) {
            if (!isset($scale['value']) || '' === $scale['value']) {
                continue;
            }

            $value = $scale['value'];
            $label = $scale['label'] ?? $value;
            if (empty($label)) {
                $label = $value;
            }

            $scales[$index] = [
                'value' => $value,
                'label' => $label,
            ];
        }

        return $scales;
    }

    public function getOptions(): OptionsCollection
    {
        $collection = new PresetOptions();
        foreach ($this->getScales() as $scale) {
            $collection->add(
                $scale['label'],
                $scale['value'],
                $this->getValue() === $scale['value'],
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

    public function getLegends(): array
    {
        $legends = $this->legends ?? [];

        return array_filter($legends);
    }

    protected function getInputHtml(): string
    {
        if (empty($this->scales)) {
            return '';
        }

        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass());

        $output = '<div class="opinion-scale">';

        $output .= '<ul class="opinion-scale-scales">';
        foreach ($this->getScales() as $index => $scale) {
            $value = $scale['value'];
            $isSelected = $value == $this->getValue();
            $id = $this->getIdAttribute()."-{$index}";

            $output .= '<li>';

            $output .= '<input '
                .$this->getInputAttributesString()
                .$this->getAttributeString('name', $this->getHandle())
                .$this->getAttributeString('type', 'radio')
                .$this->getAttributeString('id', $id)
                .$this->getAttributeString('value', $value, true, true)
                .$this->getParameterString('checked', $isSelected)
                .$attributes->getInputAttributesAsString()
                .'/>';

            $output .= '<label for="'.$id.'">';
            $output .= $this->translate($scale['label']);
            $output .= '</label>';

            $output .= '</li>';
        }
        $output .= '</ul>';

        if ($this->getLegends()) {
            $output .= '<ul class="opinion-scale-legends">';
            foreach ($this->getLegends() as $legend) {
                $output .= '<li>';
                $output .= $legend['legend'];
                $output .= '</li>';
            }
            $output .= '</ul>';
        }

        $output .= '</div>';

        return $output;
    }
}
