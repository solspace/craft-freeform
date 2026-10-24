<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;

#[Type(name: 'Heading', typeShorthand: 'heading', iconPath: __DIR__.'/Icons/heading.svg', previewTemplatePath: __DIR__.'/PreviewTemplates/heading.ejs')]
class HeadingField extends ContentField
{
    #[Translatable]
    #[Input\Text(label: 'Heading', order: 6)]
    protected string $content = '';

    #[Input\Select(label: 'Heading Level', order: 7, options: ['h1' => 'H1', 'h2' => 'H2', 'h3' => 'H3', 'h4' => 'H4', 'h5' => 'H5', 'h6' => 'H6'])]
    protected string $level = 'h2';

    #[Input\Select(label: 'Alignment', order: 8, options: ['left' => 'Left', 'center' => 'Center', 'right' => 'Right'])]
    protected string $alignment = 'left';

    #[Input\Select(label: 'Text Size', instructions: 'Choose a visual size independently of the heading level. Larger sizes scale down on small screens.', order: 9, options: ['default' => 'Template default', 'small' => 'Small (24px)', 'medium' => 'Medium (32px)', 'large' => 'Large (48px)', 'display' => 'Display (64px)', 'custom' => 'Custom'])]
    protected string $textSize = 'default';

    #[VisibilityFilter('properties.textSize == "custom"')]
    #[Input\Integer(label: 'Custom Text Size', order: 10, min: 8, max: 200, unit: 'px')]
    protected int $fontSize = 72;

    public function getTextSizeStyle(): string
    {
        $size = 'custom' === $this->textSize ? max(8, min(200, $this->fontSize)) : (['small' => 24, 'medium' => 32, 'large' => 48, 'display' => 64][$this->textSize] ?? 0);

        return $size ? 'font-size: clamp('.min(24, $size).'px, 8vw, '.$size.'px); line-height: 1.15; overflow-wrap: anywhere' : '';
    }

    public function getType(): string
    {
        return 'heading';
    }

    public function getContent(): string
    {
        return $this->getTranslationTable()->get('content', $this->content);
    }

    protected function getInputHtml(): string
    {
        $level = \in_array($this->level, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], true) ? $this->level : 'h2';
        $alignment = \in_array($this->alignment, ['left', 'center', 'right'], true) ? $this->alignment : 'left';

        return Html::tag($level, Html::encode($this->getContent()), ['style' => 'text-align: '.$alignment.($this->getTextSizeStyle() ? '; '.$this->getTextSizeStyle() : '')]);
    }
}
