<?php

namespace Solspace\Freeform\Fields\Implementations;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Translatable;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;

#[Type(name: 'Button / Link', typeShorthand: 'button-link', iconPath: __DIR__.'/Icons/button-link.svg', previewTemplatePath: __DIR__.'/PreviewTemplates/button-link.ejs')]
class ButtonLinkField extends ContentField
{
    #[Translatable]
    #[Input\Text(label: 'Link Text', order: 6)]
    protected string $linkText = 'Learn more';

    #[Translatable]
    #[Input\Text(label: 'Destination URL', instructions: 'A web address, relative path, #section, mailto: address, or tel: number.', order: 7)]
    protected string $url = '';

    #[Input\Select(label: 'Appearance', order: 8, options: ['filled' => 'Filled button', 'outline' => 'Outline button', 'link' => 'Text link'])]
    protected string $appearance = 'filled';

    #[Input\Select(label: 'Size', order: 9, options: ['small' => 'Small', 'medium' => 'Medium', 'large' => 'Large'])]
    protected string $size = 'medium';

    #[Input\Select(label: 'Alignment', order: 10, options: ['left' => 'Left', 'center' => 'Center', 'right' => 'Right'])]
    protected string $alignment = 'left';

    #[VisibilityFilter('properties.useComponentAccent != true')]
    #[Input\ColorPicker(label: 'Button / Link Color', order: 11)]
    protected string $color = '#1d4ed8';

    #[Input\Boolean(label: 'Use Component Accent', instructions: 'Use the accent color of a styled component. Turn off to use the colors below.', order: 10)]
    protected bool $useComponentAccent = false;

    #[VisibilityFilter('properties.appearance == "filled" && properties.useComponentAccent != true')]
    #[Input\ColorPicker(label: 'Text Color', order: 12)]
    protected string $textColor = '#ffffff';

    #[Input\Boolean(label: 'Open in New Tab', order: 13)]
    protected bool $newTab = false;

    public function getType(): string
    {
        return 'button-link';
    }

    public function getUrl(): string
    {
        $url = trim($this->getTranslationTable()->get('url', $this->url));
        if (!$url || preg_match('/[\x00-\x20\x7f\\\]/', $url) || str_starts_with($url, '//')) {
            return '#';
        }
        if (preg_match('/^([a-z][a-z0-9+.-]*):/i', $url, $matches)) {
            $scheme = strtolower($matches[1]);
            if (!\in_array($scheme, ['http', 'https', 'mailto', 'tel'], true)) {
                return '#';
            }
            if (\in_array($scheme, ['http', 'https'], true) && !parse_url($url, \PHP_URL_HOST)) {
                return '#';
            }
            if (\strlen($url) <= \strlen($scheme) + 1) {
                return '#';
            }
        }

        return $url;
    }

    protected function getInputHtml(): string
    {
        $color = preg_match('/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/iD', $this->color) ? $this->color : '#1d4ed8';
        $textColor = preg_match('/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/iD', $this->textColor) ? $this->textColor : '#ffffff';
        if ($this->useComponentAccent) {
            $color = 'var(--freeform-button-accent-color, '.$color.')';
            $textColor = 'var(--freeform-button-accent-text-color, '.$textColor.')';
        }
        $appearance = \in_array($this->appearance, ['filled', 'outline', 'link'], true) ? $this->appearance : 'filled';
        [$padding, $fontSize] = ['small' => ['8px 16px', 14], 'medium' => ['12px 24px', 16], 'large' => ['16px 32px', 18]][$this->size] ?? ['12px 24px', 16];
        $radius = $this->useComponentAccent ? 'var(--freeform-component-radius, 6px)' : '6px';
        $style = 'display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;max-width:100%;overflow-wrap:anywhere;white-space:normal;line-height:1.3;font-weight:600;border-radius:'.$radius.';font-size:'.$fontSize.'px;';
        $style .= 'padding:'.('link' === $appearance ? '0' : $padding).';border:1px solid '.('link' === $appearance ? 'transparent' : $color).';';
        $style .= 'background:'.('filled' === $appearance ? $color : 'transparent').';color:'.('filled' === $appearance ? $textColor : $color).';text-decoration:'.('link' === $appearance ? 'underline' : 'none');
        $link = Html::a(Html::encode($this->getTranslationTable()->get('linkText', $this->linkText)), $this->getUrl(), [
            'class' => 'freeform-button-link',
            'style' => $style,
            'target' => $this->newTab ? '_blank' : null,
            'rel' => $this->newTab ? 'noopener noreferrer' : null,
        ]);
        $alignment = \in_array($this->alignment, ['left', 'center', 'right'], true) ? $this->alignment : 'left';

        return Html::tag('div', $link, ['style' => 'text-align:'.$alignment]);
    }
}
