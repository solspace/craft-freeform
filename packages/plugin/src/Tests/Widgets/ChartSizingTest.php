<?php

namespace Solspace\Freeform\Tests\Widgets;

use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Widgets\Pro\LinearChartsWidget;
use Solspace\Freeform\Widgets\Pro\RadialChartsWidget;

/**
 * @covers \Solspace\Freeform\Widgets\AbstractChartWidget
 */
class ChartSizingTest extends TestCase
{
    #[TestWith([null])]
    #[TestWith([10])]
    #[TestWith([20])]
    #[TestWith([50])]
    #[TestWith([100])]
    public function testNewAndLegacyWidgetsUseNormalWithoutAnExplicitPreset(?int $legacyHeight): void
    {
        foreach ([LinearChartsWidget::class, RadialChartsWidget::class] as $class) {
            $widget = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
            $widget->chartHeight = $legacyHeight;

            self::assertSame('normal', $widget->getResolvedChartSize());
        }
    }

    #[TestWith(['compact'])]
    #[TestWith(['normal'])]
    #[TestWith(['large'])]
    public function testExplicitPresetsOverrideTheLegacyPercentage(string $size): void
    {
        foreach ([LinearChartsWidget::class, RadialChartsWidget::class] as $class) {
            $widget = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
            $widget->chartHeight = 100;
            $widget->chartSize = $size;

            self::assertSame($size, $widget->getResolvedChartSize());
        }
    }

    public function testUnknownSavedSizesFallBackToNormal(): void
    {
        foreach ([LinearChartsWidget::class, RadialChartsWidget::class] as $class) {
            $widget = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
            $widget->chartSize = 'unsupported';

            self::assertSame('normal', $widget->getResolvedChartSize());
        }
    }

    public function testTheChosenPresetSurvivesSavingAndReloadingSettings(): void
    {
        foreach ([LinearChartsWidget::class, RadialChartsWidget::class] as $class) {
            $widget = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
            $widget->chartSize = 'large';
            $settings = $widget->getSettings();
            self::assertSame('large', $settings['chartSize']);

            $restored = (new \ReflectionClass($class))->newInstanceWithoutConstructor();
            $restored->setAttributes($settings, false);
            self::assertSame('large', $restored->getResolvedChartSize());
        }
    }
}
