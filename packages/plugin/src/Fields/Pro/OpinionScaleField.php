<?php

namespace Solspace\Freeform\Fields\Pro;

use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleValueTrait;

class OpinionScaleField extends AbstractField implements ExtraFieldInterface
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

            $scales[$index] = [
                'value' => $scale['value'],
                'label' => $scale['label'] ?? $scale['value'],
            ];
        }

        return $scales;
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
