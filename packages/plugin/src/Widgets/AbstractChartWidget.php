<?php

namespace Solspace\Freeform\Widgets;

use Solspace\Freeform\Freeform;

abstract class AbstractChartWidget extends AbstractWidget
{
    public const CHART_SIZES = ['compact', 'normal', 'large'];

    public ?string $chartSize = null;

    // Accept legacy percentage settings when Craft hydrates saved widgets.
    // Widgets without an explicit size now use the consistent Normal preset.
    public ?int $chartHeight = null;

    public function settingsAttributes(): array
    {
        // Craft excludes properties declared on abstract classes by default.
        return array_values(array_unique([...parent::settingsAttributes(), 'chartSize']));
    }

    public function getResolvedChartSize(): string
    {
        if (\in_array($this->chartSize, self::CHART_SIZES, true)) {
            return $this->chartSize;
        }

        return 'normal';
    }

    public function getChartSizeOptions(): array
    {
        return [
            'compact' => Freeform::t('Compact'),
            'normal' => Freeform::t('Normal'),
            'large' => Freeform::t('Large'),
        ];
    }
}
