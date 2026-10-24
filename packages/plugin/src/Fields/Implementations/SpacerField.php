<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;

#[Type(name: 'Spacer', typeShorthand: 'spacer', iconPath: __DIR__.'/Icons/spacer.svg', previewTemplatePath: __DIR__.'/PreviewTemplates/spacer.ejs')]
class SpacerField extends ContentField
{
    #[Input\Select(label: 'Height', order: 6, options: ['small' => 'Small (20px)', 'medium' => 'Medium (40px)', 'large' => 'Large (64px)', 'custom' => 'Custom'])]
    protected string $spacing = 'medium';

    #[VisibilityFilter('properties.spacing === "custom"')]
    #[Input\Integer(label: 'Custom Height', order: 7, min: 0, max: 1000, unit: 'px')]
    protected int $height = 40;

    public function getType(): string
    {
        return 'spacer';
    }

    public function getHeight(): int
    {
        return 'custom' === $this->spacing ? max(0, min(1000, $this->height)) : (['small' => 20, 'medium' => 40, 'large' => 64][$this->spacing] ?? 40);
    }

    protected function getInputHtml(): string
    {
        return Html::tag('div', '', ['aria-hidden' => 'true', 'style' => 'height: '.$this->getHeight().'px']);
    }
}
