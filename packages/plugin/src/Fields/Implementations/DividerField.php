<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;

#[Type(name: 'Divider', typeShorthand: 'divider', iconPath: __DIR__.'/Icons/divider.svg', previewTemplatePath: __DIR__.'/PreviewTemplates/divider.ejs')]
class DividerField extends ContentField
{
    #[Input\Select(label: 'Line Style', order: 6, options: ['solid' => 'Solid', 'dashed' => 'Dashed', 'dotted' => 'Dotted'])]
    protected string $lineStyle = 'solid';

    #[Input\Select(label: 'Vertical Spacing', instructions: 'Margin above and below the line.', order: 7, options: ['small' => 'Small (8px)', 'medium' => 'Medium (16px)', 'large' => 'Large (32px)'])]
    protected string $spacing = 'medium';

    #[Input\ColorPicker(label: 'Line Color', order: 8)]
    protected string $lineColor = 'currentColor';

    #[Input\Select(label: 'Thickness', order: 9, options: ['one' => '1px (default)', 'two' => '2px', 'three' => '3px', 'five' => '5px', 'custom' => 'Custom'])]
    protected string $thicknessPreset = 'custom';

    #[VisibilityFilter('properties.thicknessPreset == "custom"')]
    #[Input\Integer(label: 'Custom Thickness', order: 10, min: 1, max: 20, unit: 'px')]
    protected int $thickness = 1;

    public function getThickness(): int
    {
        return ['one' => 1, 'two' => 2, 'three' => 3, 'five' => 5][$this->thicknessPreset] ?? max(1, min(20, $this->thickness));
    }

    public function getType(): string
    {
        return 'divider';
    }

    protected function getInputHtml(): string
    {
        $style = \in_array($this->lineStyle, ['solid', 'dashed', 'dotted'], true) ? $this->lineStyle : 'solid';
        $spacing = ['small' => 8, 'medium' => 16, 'large' => 32][$this->spacing] ?? 16;
        $color = preg_match('/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/iD', $this->lineColor) ? $this->lineColor : 'currentColor';
        $thickness = $this->getThickness();
        $opacity = 'currentColor' === $color ? '.25' : '1';

        return Html::tag('hr', '', ['style' => "color: inherit; border: 0; border-top: {$thickness}px {$style} {$color}; opacity: {$opacity}; margin: {$spacing}px 0"]);
    }
}
