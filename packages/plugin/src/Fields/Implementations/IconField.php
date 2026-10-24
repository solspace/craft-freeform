<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Services\FormIconService;

#[Type(name: 'Icon', typeShorthand: 'icon', iconPath: __DIR__.'/Icons/icon.svg', previewTemplatePath: __DIR__.'/PreviewTemplates/icon.ejs')]
class IconField extends ContentField
{
    #[Validators\IconName]
    #[Input\IconPicker(label: 'Icon', instructions: 'Choose from Craft’s searchable icon library.', order: 6)]
    protected string $icon = 'star';

    #[Input\Select(label: 'Icon Size', order: 7, options: ['small' => 'Small (24px)', 'medium' => 'Medium (48px)', 'large' => 'Large (64px)', 'custom' => 'Custom'])]
    protected string $iconSizePreset = 'custom';

    #[VisibilityFilter('properties.iconSizePreset == "custom"')]
    #[Input\Integer(label: 'Custom Size', order: 7, min: 8, max: 256, unit: 'px')]
    protected int $iconSize = 48;

    #[Input\ColorPicker(label: 'Icon Color', order: 8)]
    protected string $color = '#64748b';

    #[Input\Select(label: 'Alignment', order: 9, options: ['left' => 'Left', 'center' => 'Center', 'right' => 'Right'])]
    protected string $alignment = 'left';

    #[Translatable]
    #[Input\Text(label: 'Accessible Text', instructions: 'The icon name is filled automatically. Customize it to describe its meaning, or leave empty for a decorative icon.', order: 10)]
    protected string $accessibleText = '';

    public function getType(): string
    {
        return 'icon';
    }

    public function getIconSvg(): ?string
    {
        return (new FormIconService())->getSvg($this->icon);
    }

    public function getDisplaySize(): int
    {
        return ['small' => 24, 'medium' => 48, 'large' => 64][$this->iconSizePreset] ?? max(8, min(256, $this->iconSize));
    }

    protected function getInputHtml(): string
    {
        $svg = $this->getIconSvg();
        if (!$svg) {
            return '';
        }
        $size = $this->getDisplaySize();
        $color = preg_match('/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/iD', $this->color) ? $this->color : '#64748b';
        $label = $this->getTranslationTable()->get('accessibleText', $this->accessibleText);
        $alignment = \in_array($this->alignment, ['left', 'center', 'right'], true) ? $this->alignment : 'left';
        $svg = Html::modifyTagAttributes($svg, [
            'width' => $size, 'height' => $size, 'fill' => 'currentColor', 'style' => 'display:block;max-width:100%;height:auto;color:'.$color,
            'role' => $label ? 'img' : false, 'aria-label' => $label ?: false, 'aria-hidden' => $label ? false : 'true', 'aria-labelledby' => false, 'focusable' => 'false',
        ]);

        return Html::tag('div', $svg, ['style' => 'display:flex;justify-content:'.['left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end'][$alignment]]);
    }
}
