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

    #[Input\Select(label: 'Component Design', instructions: 'Auto follows Settings → Component Design. Custom lets you override individual settings and reset them to follow the form again.', order: 1, value: 'form', options: ['form' => 'Auto', 'custom' => 'Custom'])]
    // Saved layouts without a design mode retain their original appearance.
    protected string $designStyle = 'manual';

    #[Input\Hidden(value: [])]
    protected ?array $designOverrides = null;

    #[VisibilityFilter('properties.designStyle == "form"')]
    #[Input\Select(label: 'Treatment', order: 2, options: ['soft' => 'Soft', 'bold' => 'Bold'])]
    protected string $designTreatment = 'soft';

    #[VisibilityFilter('properties.designStyle == "custom"')]
    #[Input\ColorPicker(label: 'Accent Color', order: 3)]
    protected string $designAccentColor = '#6d28d9';

    #[VisibilityFilter('properties.designStyle == "custom"')]
    #[Input\ColorPicker(label: 'Text on Accent', order: 3)]
    protected string $designAccentTextColor = '#ffffff';

    #[Input\Hidden]
    protected string $designSurfaceColor = '#f5f3ff';

    #[Input\Hidden]
    protected string $designTextColor = '#2e1065';

    #[Input\Hidden]
    protected string $designSpacing = 'comfortable';

    #[Input\Hidden]
    protected string $designCorners = 'soft';

    #[Input\Select(label: 'Column Layout', order: 6, options: ['one' => '1 column', 'two' => '2 columns', 'three' => '3 columns', 'four' => '4 columns', 'five' => '5 columns', 'six' => '6 columns', 'wide' => 'Wide + narrow', 'narrow' => 'Narrow + wide', 'sidebar' => 'Narrow + wide + narrow', 'three-one' => '3:1 columns', 'one-three' => '1:3 columns'])]
    protected string $preset = 'two';

    #[Input\Text(label: 'Column Proportions', instructions: 'Optional. Enter one relative width per column, from 0.1 to 100 (for example: 1, 2, 1). Leave empty to use the selected layout. Invalid proportions fall back to that layout.', order: 7)]
    protected string $columnProportions = '';

    #[Input\Select(label: 'Column Gap', order: 8, options: ['small' => 'Small', 'medium' => 'Medium', 'large' => 'Large', 'custom' => 'Custom'])]
    protected string $gap = 'medium';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.designOverrides.includes("gap") && properties.gap == "custom"')]
    #[Input\Integer(label: 'Custom Column Gap', order: 8, min: 0, max: 200, unit: 'px')]
    protected int $customGap = 20;

    #[Input\Select(label: 'Columns On Smaller Screens', order: 9, options: ['stack' => 'Stack', 'keep' => 'Keep'])]
    protected string $mobile = 'stack';

    #[Input\Select(label: 'Vertical Alignment', instructions: 'Position the contents within each column.', order: 9, options: ['top' => 'Top', 'middle' => 'Middle', 'bottom' => 'Bottom'])]
    protected string $verticalAlignment = 'top';

    #[VisibilityFilter('properties.designStyle == "custom"')]
    #[Input\Select(label: 'Background', order: 10, options: ['none' => 'None', 'color' => 'Color', 'image' => 'Image'])]
    protected string $background = 'none';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.designOverrides.includes("background") && properties.background != "none"')]
    #[Input\ColorPicker(label: 'Background Color', order: 11)]
    protected string $backgroundColor = '#f1f5f9';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.designOverrides.includes("background") && properties.background == "image"')]
    #[Input\AssetPicker(label: 'Background Image', instructions: 'Decorative image behind the section content. Keep important information in the text.', order: 12, criteria: ['kind' => 'image'], limit: 1)]
    protected array $backgroundImage = [];

    #[VisibilityFilter('properties.designStyle == "custom"')]
    #[Input\ColorPicker(label: 'Section Text Color', order: 13)]
    protected string $textColor = '#334155';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.designOverrides.includes("background") && properties.background == "image"')]
    #[Input\ColorPicker(label: 'Overlay Color', order: 14)]
    protected string $overlayColor = '#000000';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.designOverrides.includes("background") && properties.background == "image" && properties.overlayColor != "rgba(0,0,0,0)" && properties.overlayColor != "transparent"')]
    #[Input\Select(label: 'Overlay Opacity', order: 15, options: ['light' => '10%', 'quarter' => '25%', 'half' => '50%', 'strong' => '75%', 'custom' => 'Custom'])]
    protected string $overlayOpacityPreset = 'custom';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.designOverrides.includes("background") && properties.background == "image" && properties.overlayColor != "rgba(0,0,0,0)" && properties.overlayColor != "transparent" && properties.overlayOpacityPreset == "custom"')]
    #[Input\Integer(label: 'Custom Opacity', instructions: 'Percentage from 0 (clear) to 100 (solid).', order: 15, min: 0, max: 100, unit: '%')]
    protected int $overlayOpacity = 45;

    #[VisibilityFilter('properties.designStyle == "custom"')]
    #[Input\Select(label: 'Section Padding', order: 16, options: ['none' => 'None (0px)', 'small' => 'Small (24px)', 'medium' => 'Medium (40px)', 'large' => 'Large (64px)', 'custom' => 'Custom'])]
    protected string $padding = 'medium';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.designOverrides.includes("padding") && properties.padding == "custom"')]
    #[Input\Integer(label: 'Custom Section Padding', order: 16, min: 0, max: 200, unit: 'px')]
    protected int $customPadding = 32;

    #[VisibilityFilter('properties.designStyle == "custom"')]
    #[Input\Select(label: 'Section Corner Radius', order: 17, options: ['square' => '0px', 'three' => '3px', 'five' => '5px', 'ten' => '10px', 'fifteen' => '15px', 'twenty' => '20px', 'custom' => 'Custom'])]
    protected string $sectionRadiusPreset = 'custom';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.designOverrides.includes("sectionRadiusPreset") && properties.sectionRadiusPreset == "custom"')]
    #[Input\Integer(label: 'Custom Section Corner Radius', order: 17, min: 0, max: 64, unit: 'px')]
    protected int $sectionRadius = 12;

    #[VisibilityFilter('properties.designStyle == "custom"')]
    #[Input\Integer(label: 'Minimum Height', instructions: 'Content can expand beyond this height. Use 0 for automatic height.', order: 17, min: 0, max: 1000, unit: 'px')]
    protected int $minHeight = 0;

    #[Input\Select(label: 'Column Style', order: 18, options: ['plain' => 'Plain', 'cards' => 'Cards'])]
    protected string $columnStyle = 'plain';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.columnStyle == "cards"')]
    #[Input\ColorPicker(label: 'Card Background Color', order: 19)]
    protected string $cardBackgroundColor = '#ffffff';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.columnStyle == "cards"')]
    #[Input\ColorPicker(label: 'Card Text Color', order: 20)]
    protected string $cardTextColor = '#334155';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.columnStyle == "cards"')]
    #[Input\ColorPicker(label: 'Card Border Color', order: 21)]
    protected string $cardBorderColor = '#dbe3ec';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.columnStyle == "cards" && (!properties.designOverrides.includes("cardBorderColor") || (properties.cardBorderColor != "rgba(0,0,0,0)" && properties.cardBorderColor != "transparent"))')]
    #[Input\Select(label: 'Card Border Width', order: 22, options: ['none' => '0px (none)', 'one' => '1px', 'two' => '2px', 'three' => '3px', 'custom' => 'Custom'])]
    protected string $cardBorderWidthPreset = 'custom';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.columnStyle == "cards" && (!properties.designOverrides.includes("cardBorderColor") || (properties.cardBorderColor != "rgba(0,0,0,0)" && properties.cardBorderColor != "transparent")) && properties.designOverrides.includes("cardBorderWidthPreset") && properties.cardBorderWidthPreset == "custom"')]
    #[Input\Integer(label: 'Custom Card Border Width', instructions: 'Use 0 for no border.', order: 22, min: 0, max: 8, unit: 'px')]
    protected int $cardBorderWidth = 1;

    #[VisibilityFilter('properties.designStyle == "custom" && properties.columnStyle == "cards" && (!properties.designOverrides.includes("cardBorderColor") || (properties.cardBorderColor != "rgba(0,0,0,0)" && properties.cardBorderColor != "transparent"))')]
    #[Input\Select(label: 'Card Corner Radius', order: 23, options: ['three' => '3px', 'five' => '5px', 'ten' => '10px', 'fifteen' => '15px', 'twenty' => '20px', 'custom' => 'Custom'])]
    protected string $cardRadiusPreset = 'custom';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.columnStyle == "cards" && (!properties.designOverrides.includes("cardBorderColor") || (properties.cardBorderColor != "rgba(0,0,0,0)" && properties.cardBorderColor != "transparent")) && properties.designOverrides.includes("cardRadiusPreset") && properties.cardRadiusPreset == "custom"')]
    #[Input\Integer(label: 'Custom Card Corner Radius', order: 23, min: 0, max: 64, unit: 'px')]
    protected int $cardRadius = 12;

    #[VisibilityFilter('properties.designStyle == "custom" && properties.columnStyle == "cards"')]
    #[Input\Select(label: 'Card Padding', order: 24, options: ['none' => 'None (0px)', 'small' => 'Small (16px)', 'medium' => 'Medium (24px)', 'large' => 'Large (32px)', 'custom' => 'Custom'])]
    protected string $cardPadding = 'medium';

    #[VisibilityFilter('properties.designStyle == "custom" && properties.columnStyle == "cards" && properties.designOverrides.includes("cardPadding") && properties.cardPadding == "custom"')]
    #[Input\Integer(label: 'Custom Card Padding', order: 24, min: 0, max: 200, unit: 'px')]
    protected int $customCardPadding = 24;

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
        return ['small' => 8, 'medium' => 16, 'large' => 32][$this->gap] ?? ('custom' === $this->gap ? max(0, min(200, $this->customGap)) : 16);
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
        if ($this->isDesigned()) {
            return $this->getComponentDesignStyle();
        }

        return $this->getIndividualAppearanceStyle();
    }

    public function getLayoutStyle(): string
    {
        $design = $this->getComponentDesignStyle();
        $styles = ['--freeform-columns' => $this->getColumnWidths(), '--freeform-gap' => ($design['--freeform-component-gap'] ?? $this->getGap().'px'), '--freeform-vertical-alignment' => $this->getVerticalAlignment()] + $this->getAppearanceStyle() + $this->getCardStyle();

        return implode('; ', array_map(static fn ($key, $value) => $key.': '.$value, array_keys($styles), $styles));
    }

    /** @return array<string, string> */
    public function getCardStyle(): array
    {
        if ('cards' !== $this->columnStyle) {
            return [];
        }

        if ($this->isDesigned()) {
            $design = $this->getComponentDesignStyle();

            $styles = [
                '--freeform-card-background' => '#ffffff',
                '--freeform-card-color' => $design['--freeform-component-body-color'],
                '--freeform-card-border-color' => 'color-mix(in srgb, '.$design['--freeform-accent-color'].' 20%, #ffffff)',
                '--freeform-card-border-width' => '1px',
                '--freeform-card-radius' => $design['--freeform-component-card-radius'],
                '--freeform-card-padding' => $design['--freeform-component-card-padding'],
            ];
            $individual = $this->getIndividualCardStyle();
            foreach ([
                'cardBackgroundColor' => '--freeform-card-background',
                'cardTextColor' => '--freeform-card-color',
                'cardBorderColor' => '--freeform-card-border-color',
                'cardBorderWidthPreset' => '--freeform-card-border-width',
                'cardRadiusPreset' => '--freeform-card-radius',
                'cardPadding' => '--freeform-card-padding',
            ] as $handle => $variable) {
                if ($this->hasDesignOverride($handle)) {
                    $styles[$variable] = $individual[$variable];
                }
            }

            return $styles;
        }

        return $this->getIndividualCardStyle();
    }

    /** @return array<string, string> */
    public function getComponentDesignStyle(): array
    {
        if (!$this->isDesigned()) {
            return [];
        }

        $local = [
            'accent' => $this->safeColor($this->designAccentColor, '#6d28d9'),
            'accentText' => $this->safeColor($this->designAccentTextColor, '#ffffff'),
            'surface' => $this->safeColor($this->designSurfaceColor, '#f5f3ff'),
            'text' => $this->safeColor($this->designTextColor, '#2e1065'),
            'spacing' => $this->designSpacing,
            'corners' => $this->designCorners,
        ];
        $design = 'custom' === $this->designStyle && null === $this->designOverrides
            ? $local
            : $this->getForm()->getSettings()->getGeneral()->getComponentDesign();
        foreach (['designAccentColor' => 'accent', 'designAccentTextColor' => 'accentText', 'designSurfaceColor' => 'surface', 'designTextColor' => 'text', 'designSpacing' => 'spacing', 'designCorners' => 'corners'] as $handle => $key) {
            if ($this->hasDesignOverride($handle)) {
                $design[$key] = $local[$key];
            }
        }
        $spacing = ['compact' => [16, 12, 12], 'comfortable' => [32, 20, 24], 'spacious' => [56, 32, 36]][$design['spacing']] ?? [32, 20, 24];
        $radius = ['square' => 0, 'soft' => 12, 'rounded' => 24][$design['corners']] ?? 12;
        $bold = 'bold' === $this->getDesignTreatment();

        $styles = [
            '--freeform-accent-color' => $design['accent'],
            '--freeform-accent-text-color' => $design['accentText'],
            '--freeform-button-accent-color' => $bold ? $design['accentText'] : $design['accent'],
            '--freeform-button-accent-text-color' => $bold ? $design['accent'] : $design['accentText'],
            '--freeform-background-color' => $bold ? $design['accent'] : $design['surface'],
            '--freeform-text-color' => $bold ? $design['accentText'] : $design['text'],
            '--freeform-component-body-color' => $design['text'],
            '--freeform-padding' => $spacing[0].'px',
            '--freeform-component-gap' => $spacing[1].'px',
            '--freeform-component-card-padding' => $spacing[2].'px',
            '--freeform-component-radius' => $radius.'px',
            '--freeform-component-card-radius' => $radius.'px',
            '--freeform-min-height' => '0px',
            '--freeform-background-image' => 'none',
        ];
        if ($this->hasDesignOverride('background')) {
            $individual = $this->getIndividualAppearanceStyle();
            $styles['--freeform-background-color'] = $individual['--freeform-background-color'] ?? 'transparent';
            $styles['--freeform-background-image'] = $individual['--freeform-background-image'] ?? 'none';
        }
        if ($this->hasDesignOverride('textColor')) {
            $styles['--freeform-text-color'] = $this->safeColor($this->textColor, '#334155');
        }
        if ($this->hasDesignOverride('sectionRadiusPreset')) {
            $styles['--freeform-component-radius'] = (['square' => 0, 'three' => 3, 'five' => 5, 'ten' => 10, 'fifteen' => 15, 'twenty' => 20][$this->sectionRadiusPreset] ?? max(0, min(64, $this->sectionRadius))).'px';
        }
        if ($this->hasDesignOverride('padding')) {
            $styles['--freeform-padding'] = (['none' => 0, 'small' => 24, 'medium' => 40, 'large' => 64][$this->padding] ?? ('custom' === $this->padding ? max(0, min(200, $this->customPadding)) : 40)).'px';
        }
        if ($this->hasDesignOverride('minHeight')) {
            $styles['--freeform-min-height'] = max(0, min(1000, $this->minHeight)).'px';
        }
        if ($this->hasDesignOverride('gap')) {
            $styles['--freeform-component-gap'] = $this->getGap().'px';
        }

        return $styles;
    }

    public function isDesigned(): bool
    {
        return \in_array($this->designStyle, ['form', 'custom'], true);
    }

    public function getDesignTreatment(): string
    {
        return 'form' === $this->designStyle && 'bold' === $this->designTreatment ? 'bold' : 'soft';
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
            'data-design' => $this->isDesigned() ? 'true' : 'false',
            'data-design-treatment' => $this->getDesignTreatment(),
            'style' => $this->getLayoutStyle(),
        ]);
    }

    private function getIndividualAppearanceStyle(): array
    {
        if (!\in_array($this->background, ['color', 'image'], true)) {
            return [];
        }

        $padding = ['none' => 0, 'small' => 24, 'medium' => 40, 'large' => 64][$this->padding] ?? ('custom' === $this->padding ? max(0, min(200, $this->customPadding)) : 40);
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

    private function getIndividualCardStyle(): array
    {
        return [
            '--freeform-card-background' => $this->safeColor($this->cardBackgroundColor, '#ffffff'),
            '--freeform-card-color' => $this->safeColor($this->cardTextColor, '#334155'),
            '--freeform-card-border-color' => $this->safeColor($this->cardBorderColor, '#dbe3ec', true),
            '--freeform-card-border-width' => (['none' => 0, 'one' => 1, 'two' => 2, 'three' => 3][$this->cardBorderWidthPreset] ?? max(0, min(8, $this->cardBorderWidth))).'px',
            '--freeform-card-radius' => (['three' => 3, 'five' => 5, 'ten' => 10, 'fifteen' => 15, 'twenty' => 20, 'square' => 0, 'small' => 4, 'medium' => 8, 'rounded' => 12, 'large' => 24][$this->cardRadiusPreset] ?? max(0, min(64, $this->cardRadius))).'px',
            '--freeform-card-padding' => (['none' => 0, 'small' => 16, 'medium' => 24, 'large' => 32][$this->cardPadding] ?? ('custom' === $this->cardPadding ? max(0, min(200, $this->customCardPadding)) : 24)).'px',
        ];
    }

    private function hasDesignOverride(string $handle): bool
    {
        $overrides = $this->designOverrides ?? ['designAccentColor', 'designAccentTextColor', 'designSurfaceColor', 'designTextColor', 'designSpacing', 'designCorners'];

        return 'custom' === $this->designStyle && \in_array($handle, $overrides, true);
    }

    private function safeColor(string $color, string $fallback, bool $transparent = false): string
    {
        if ($transparent && \in_array($color, ['transparent', 'rgba(0,0,0,0)'], true)) {
            return 'transparent';
        }

        return preg_match('/^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/iD', $color) ? $color : $fallback;
    }
}
