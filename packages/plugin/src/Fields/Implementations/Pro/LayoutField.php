<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;

#[Type(name: 'Layout', typeShorthand: 'layout', iconPath: __DIR__.'/../Icons/layout.svg')]
class LayoutField extends GroupField implements InputOnlyInterface, NoEmailPresenceInterface
{
    protected string $instructions = '';

    #[Input\Hidden]
    protected ?string $fieldType = null;

    #[Input\Select(label: 'Column Layout', order: 6, options: ['one' => '1 column', 'two' => '2 columns', 'three' => '3 columns', 'four' => '4 columns', 'five' => '5 columns', 'six' => '6 columns', 'wide' => 'Wide + narrow', 'narrow' => 'Narrow + wide', 'sidebar' => 'Narrow + wide + narrow', 'three-one' => '3:1 columns', 'one-three' => '1:3 columns'])]
    protected string $preset = 'two';

    #[Input\Text(label: 'Column Proportions', instructions: 'Optional. Enter one relative width per column, from 0.1 to 100 (for example: 1, 2, 1). Leave empty to use the selected layout. Invalid proportions fall back to that layout.', order: 7)]
    protected string $columnProportions = '';

    #[Input\Select(label: 'Column Gap', order: 8, options: ['small' => 'Small', 'medium' => 'Medium', 'large' => 'Large'])]
    protected string $gap = 'medium';

    #[Input\Select(label: 'Columns On Smaller Screens', order: 9, options: ['stack' => 'Stack', 'keep' => 'Keep'])]
    protected string $mobile = 'stack';

    #[Input\Select(label: 'Vertical Alignment', instructions: 'Position the contents within each column.', order: 9, options: ['top' => 'Top', 'middle' => 'Middle', 'bottom' => 'Bottom'])]
    protected string $verticalAlignment = 'top';

    #[Input\Select(label: 'Background', order: 10, options: ['none' => 'None', 'color' => 'Color', 'image' => 'Image'])]
    protected string $background = 'none';

    #[VisibilityFilter('properties.background != "none"')]
    #[Input\ColorPicker(label: 'Background Color', order: 11)]
    protected string $backgroundColor = '#f1f5f9';

    #[VisibilityFilter('properties.background == "image"')]
    #[Input\AssetPicker(label: 'Background Image', instructions: 'Decorative image behind the section content. Keep important information in the text.', order: 12, criteria: ['kind' => 'image'], limit: 1)]
    protected array $backgroundImage = [];

    #[VisibilityFilter('properties.background != "none"')]
    #[Input\ColorPicker(label: 'Text Color', order: 13)]
    protected string $textColor = '#334155';

    #[VisibilityFilter('properties.background == "image"')]
    #[Input\ColorPicker(label: 'Overlay Color', order: 14)]
    protected string $overlayColor = '#000000';

    #[VisibilityFilter('properties.background == "image" && properties.overlayColor != "rgba(0,0,0,0)" && properties.overlayColor != "transparent"')]
    #[Input\Select(label: 'Overlay Opacity', order: 15, options: ['light' => '10%', 'quarter' => '25%', 'half' => '50%', 'strong' => '75%', 'custom' => 'Custom'])]
    protected string $overlayOpacityPreset = 'custom';

    #[VisibilityFilter('properties.background == "image" && properties.overlayColor != "rgba(0,0,0,0)" && properties.overlayColor != "transparent" && properties.overlayOpacityPreset == "custom"')]
    #[Input\Integer(label: 'Custom Opacity', instructions: 'Percentage from 0 (clear) to 100 (solid).', order: 15, min: 0, max: 100, unit: '%')]
    protected int $overlayOpacity = 45;

    #[VisibilityFilter('properties.background != "none"')]
    #[Input\Select(label: 'Section Padding', order: 16, options: ['none' => 'None (0px)', 'small' => 'Small (24px)', 'medium' => 'Medium (40px)', 'large' => 'Large (64px)'])]
    protected string $padding = 'medium';

    #[VisibilityFilter('properties.background != "none"')]
    #[Input\Integer(label: 'Minimum Height', instructions: 'Content can expand beyond this height. Use 0 for automatic height.', order: 17, min: 0, max: 1000, unit: 'px')]
    protected int $minHeight = 0;

    #[Input\Select(label: 'Column Style', order: 18, options: ['plain' => 'Plain', 'cards' => 'Cards'])]
    protected string $columnStyle = 'plain';

    #[VisibilityFilter('properties.columnStyle == "cards"')]
    #[Input\ColorPicker(label: 'Card Background Color', order: 19)]
    protected string $cardBackgroundColor = '#ffffff';

    #[VisibilityFilter('properties.columnStyle == "cards"')]
    #[Input\ColorPicker(label: 'Card Text Color', order: 20)]
    protected string $cardTextColor = '#334155';

    #[VisibilityFilter('properties.columnStyle == "cards"')]
    #[Input\ColorPicker(label: 'Card Border Color', order: 21)]
    protected string $cardBorderColor = '#dbe3ec';

    #[VisibilityFilter('properties.columnStyle == "cards" && properties.cardBorderColor != "rgba(0,0,0,0)" && properties.cardBorderColor != "transparent"')]
    #[Input\Select(label: 'Card Border Width', order: 22, options: ['none' => '0px (none)', 'one' => '1px', 'two' => '2px', 'three' => '3px', 'custom' => 'Custom'])]
    protected string $cardBorderWidthPreset = 'custom';

    #[VisibilityFilter('properties.columnStyle == "cards" && properties.cardBorderColor != "rgba(0,0,0,0)" && properties.cardBorderColor != "transparent" && properties.cardBorderWidthPreset == "custom"')]
    #[Input\Integer(label: 'Custom Card Border Width', instructions: 'Use 0 for no border.', order: 22, min: 0, max: 8, unit: 'px')]
    protected int $cardBorderWidth = 1;

    #[VisibilityFilter('properties.columnStyle == "cards" && properties.cardBorderColor != "rgba(0,0,0,0)" && properties.cardBorderColor != "transparent"')]
    #[Input\Select(label: 'Card Corner Radius', order: 23, options: ['three' => '3px', 'five' => '5px', 'ten' => '10px', 'fifteen' => '15px', 'twenty' => '20px', 'custom' => 'Custom'])]
    protected string $cardRadiusPreset = 'custom';

    #[VisibilityFilter('properties.columnStyle == "cards" && properties.cardBorderColor != "rgba(0,0,0,0)" && properties.cardBorderColor != "transparent" && properties.cardRadiusPreset == "custom"')]
    #[Input\Integer(label: 'Custom Card Corner Radius', order: 23, min: 0, max: 64, unit: 'px')]
    protected int $cardRadius = 12;

    #[VisibilityFilter('properties.columnStyle == "cards"')]
    #[Input\Select(label: 'Card Padding', order: 24, options: ['none' => 'None (0px)', 'small' => 'Small (16px)', 'medium' => 'Medium (24px)', 'large' => 'Large (32px)'])]
    protected string $cardPadding = 'medium';

    public function getOverlayOpacity(): int
    {
        return ['light' => 10, 'quarter' => 25, 'half' => 50, 'strong' => 75][$this->overlayOpacityPreset] ?? max(0, min(100, $this->overlayOpacity));
    }

    public function getType(): string
    {
        return 'layout';
    }

    public function getPreset(): string
    {
        return \in_array($this->preset, ['one', 'two', 'three', 'four', 'five', 'six', 'wide', 'narrow', 'three-one', 'one-three', 'sidebar'], true) ? $this->preset : 'two';
    }

    public function getColumnWidths(): string
    {
        $preset = $this->getPreset();
        $default = ['one' => '1fr', 'two' => '1fr 1fr', 'three' => '1fr 1fr 1fr', 'four' => 'repeat(4, minmax(0, 1fr))', 'five' => 'repeat(5, minmax(0, 1fr))', 'six' => 'repeat(6, minmax(0, 1fr))', 'wide' => '2fr 1fr', 'narrow' => '1fr 2fr', 'three-one' => '3fr 1fr', 'one-three' => '1fr 3fr', 'sidebar' => '1fr 2fr 1fr'][$preset];
        $input = trim($this->columnProportions);
        $values = preg_split('/[,\s]+/', $input);
        $count = ['one' => 1, 'two' => 2, 'three' => 3, 'four' => 4, 'five' => 5, 'six' => 6, 'wide' => 2, 'narrow' => 2, 'three-one' => 2, 'one-three' => 2, 'sidebar' => 3][$preset];
        if (!$input || \strlen($input) > 200 || \count($values) !== $count) {
            return $default;
        }
        foreach ($values as $value) {
            if (!preg_match('/^(?:\d+(?:\.\d+)?|\.\d+)$/D', $value) || (float) $value < 0.1 || (float) $value > 100) {
                return $default;
            }
        }

        return implode(' ', array_map(static fn ($value) => 'minmax(0, '.(float) $value.'fr)', $values));
    }

    public function getGap(): int
    {
        return ['small' => 8, 'medium' => 16, 'large' => 32][$this->gap] ?? 16;
    }

    public function isStackedOnMobile(): bool
    {
        return 'keep' !== $this->mobile;
    }

    public function getVerticalAlignment(): string
    {
        return ['top' => 'flex-start', 'middle' => 'center', 'bottom' => 'flex-end'][$this->verticalAlignment] ?? 'flex-start';
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }

    public function getLayoutCss(): string
    {
        return file_get_contents(\dirname(__DIR__, 3).'/Resources/css/layout.css');
    }

    public function getBackgroundImageUrl(): ?string
    {
        $id = (int) ($this->backgroundImage[0] ?? 0);

        return $id > 0 ? \Craft::$app->assets->getAssetById($id)?->getUrl() : null;
    }

    /** @return array<string, string> */
    public function getAppearanceStyle(): array
    {
        if (!\in_array($this->background, ['color', 'image'], true)) {
            return [];
        }

        $padding = ['none' => 0, 'small' => 24, 'medium' => 40, 'large' => 64][$this->padding] ?? 40;
        $styles = [
            '--freeform-background-color' => $this->safeColor($this->backgroundColor, '#f1f5f9', true),
            '--freeform-text-color' => $this->safeColor($this->textColor, '#334155'),
            '--freeform-padding' => $padding.'px',
            '--freeform-min-height' => max(0, min(1000, $this->minHeight)).'px',
            '--freeform-background-image' => 'none',
        ];
        if ('image' === $this->background) {
            $color = $this->safeColor($this->overlayColor, '#000000', true);
            $hex = substr($color, 1);
            if (3 === \strlen($hex)) {
                $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
            }
            $overlay = 'transparent' === $color ? 'rgba(0, 0, 0, 0)' : \sprintf('rgba(%d, %d, %d, %s)', hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2)), $this->getOverlayOpacity() / 100);
            $url = $this->getBackgroundImageUrl();
            if ($url) {
                // Quote CSS strings so asset filenames cannot break out of url().
                $quoted = '"'.str_replace(['\\', '"', "\n", "\r", "\f"], ['\\\\', '\"', '\a ', '\d ', '\c '], $url).'"';
                $styles['--freeform-background-image'] = 'linear-gradient('.$overlay.', '.$overlay.'), url('.$quoted.')';
            }
        }

        return $styles;
    }

    public function getLayoutStyle(): string
    {
        $styles = ['--freeform-columns' => $this->getColumnWidths(), '--freeform-gap' => $this->getGap().'px', '--freeform-vertical-alignment' => $this->getVerticalAlignment()] + $this->getAppearanceStyle() + $this->getCardStyle();

        return implode('; ', array_map(static fn ($key, $value) => $key.': '.$value, array_keys($styles), $styles));
    }

    /** @return array<string, string> */
    public function getCardStyle(): array
    {
        if ('cards' !== $this->columnStyle) {
            return [];
        }

        return [
            '--freeform-card-background' => $this->safeColor($this->cardBackgroundColor, '#ffffff'),
            '--freeform-card-color' => $this->safeColor($this->cardTextColor, '#334155'),
            '--freeform-card-border-color' => $this->safeColor($this->cardBorderColor, '#dbe3ec', true),
            '--freeform-card-border-width' => (['none' => 0, 'one' => 1, 'two' => 2, 'three' => 3][$this->cardBorderWidthPreset] ?? max(0, min(8, $this->cardBorderWidth))).'px',
            '--freeform-card-radius' => (['three' => 3, 'five' => 5, 'ten' => 10, 'fifteen' => 15, 'twenty' => 20, 'square' => 0, 'small' => 4, 'medium' => 8, 'rounded' => 12, 'large' => 24][$this->cardRadiusPreset] ?? max(0, min(64, $this->cardRadius))).'px',
            '--freeform-card-padding' => (['none' => 0, 'small' => 16, 'medium' => 24, 'large' => 32][$this->cardPadding] ?? 24).'px',
        ];
    }

    protected function getInputHtml(): string
    {
        \Craft::$app->view->registerCss($this->getLayoutCss(), [], 'freeform-layout');
        $content = '';
        foreach ($this->getLayout()?->getRows() ?? [] as $row) {
            foreach ($row->getFields() as $column) {
                $content .= $column->render();
            }
        }

        return Html::tag('div', $content, [
            'class' => 'freeform-layout-columns',
            'data-stack' => $this->isStackedOnMobile() ? 'true' : 'false',
            'data-freeform-background-image' => $this->getBackgroundImageUrl(),
            'data-appearance' => $this->getAppearanceStyle() ? 'true' : 'false',
            'data-cards' => $this->getCardStyle() ? 'true' : 'false',
            'style' => $this->getLayoutStyle(),
        ]);
    }

    private function safeColor(string $color, string $fallback, bool $transparent = false): string
    {
        if ($transparent && \in_array($color, ['transparent', 'rgba(0,0,0,0)'], true)) {
            return 'transparent';
        }

        return preg_match('/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/iD', $color) ? $color : $fallback;
    }
}
