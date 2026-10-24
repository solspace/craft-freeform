<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Form\Settings\Implementations\Toolbars\RichTextToolbarConfiguration;

#[Type(name: 'Callout', typeShorthand: 'callout', iconPath: __DIR__.'/Icons/callout.svg', previewTemplatePath: __DIR__.'/PreviewTemplates/callout.ejs')]
class CalloutField extends ContentField
{
    #[Translatable]
    #[Input\Hidden]
    protected string $content = '';

    #[Translatable]
    #[Input\Wysiwyg(label: 'Text', order: 6, menu: false, statusbar: false, toolbar: RichTextToolbarConfiguration::class)]
    protected ?string $richContent = null;

    #[Input\Select(label: 'Appearance', order: 7, options: ['neutral' => 'Neutral', 'info' => 'Information', 'success' => 'Success', 'warning' => 'Warning', 'danger' => 'Danger'])]
    protected string $appearance = 'info';

    public function getType(): string
    {
        return 'callout';
    }

    public function getContent(): string
    {
        $translations = $this->getTranslationTable();
        $rich = $translations->get('richContent');
        if (null !== $rich) {
            return $rich;
        }
        $legacy = $translations->get('content');
        if (null !== $legacy) {
            return nl2br(Html::encode($legacy));
        }

        return $this->richContent ?? nl2br(Html::encode($this->content));
    }

    protected function getInputHtml(): string
    {
        $appearance = \in_array($this->appearance, ['neutral', 'info', 'success', 'warning', 'danger'], true) ? $this->appearance : 'info';
        $color = ['neutral' => '#64748b', 'info' => '#2563eb', 'success' => '#15803d', 'warning' => '#d97706', 'danger' => '#b91c1c'][$appearance];

        return Html::tag('div', $this->getContent(), [
            'class' => 'freeform-callout freeform-callout-'.$appearance,
            'style' => "padding: 1rem; border-inline-start: 3px solid {$color}; background: color-mix(in srgb, {$color} 8%, transparent)",
        ]);
    }
}
