<?php

namespace Solspace\Freeform\Tests\Widgets;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Widgets\Pro\RecentWidget;

/**
 * @covers \Solspace\Freeform\Widgets\Pro\RecentWidget
 */
class RecentWidgetSettingsTest extends TestCase
{
    public function testNewAndLegacySettingsEnableBothControlsByDefault(): void
    {
        $widget = (new \ReflectionClass(RecentWidget::class))->newInstanceWithoutConstructor();
        $widget->setAttributes(['title' => 'Recent', 'limit' => 5, 'formIds' => '*'], false);

        self::assertTrue($widget->showFilters);
        self::assertTrue($widget->showPagination);
    }

    public function testDisabledControlsSurviveSavingAndReloadingSettings(): void
    {
        $widget = (new \ReflectionClass(RecentWidget::class))->newInstanceWithoutConstructor();
        $widget->showFilters = false;
        $widget->showPagination = false;
        $settings = $widget->getSettings();

        self::assertFalse($settings['showFilters']);
        self::assertFalse($settings['showPagination']);

        $restored = (new \ReflectionClass(RecentWidget::class))->newInstanceWithoutConstructor();
        $restored->setAttributes($settings, false);

        self::assertFalse($restored->showFilters);
        self::assertFalse($restored->showPagination);
    }
}
