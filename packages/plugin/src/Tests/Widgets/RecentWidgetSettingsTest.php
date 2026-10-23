<?php

namespace Solspace\Freeform\Tests\Widgets;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Widgets\Pro\RecentWidget;
use yii\web\ForbiddenHttpException;

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

    public function testPickerIncludesFormsWithoutRecentRowsAndRespectsConfiguredAndReadableForms(): void
    {
        $widget = $this->scopedWidget();
        $widget->formIds = '*';
        self::assertSame([2 => 'Contact', 200 => 'Older form'], $widget->getFormFilterOptions());
        $widget->formIds = [200, 300];
        self::assertSame([200 => 'Older form'], $widget->getFormFilterOptions());
        $widget->setFormFilter(200);
        self::assertSame([200, 300], $widget->getSettings()['formIds']);
        self::assertArrayNotHasKey('formFilter', $widget->getSettings());
        $widget->setFormFilter(null);
    }

    public function testSelectingAnUnreadableFormIsRejected(): void
    {
        $widget = $this->scopedWidget();
        $widget->formIds = '*';
        $this->expectException(ForbiddenHttpException::class);
        $widget->setFormFilter(300);
    }

    public function testSelectingAFormOutsideTheWidgetConfigurationIsRejected(): void
    {
        $widget = $this->scopedWidget();
        $widget->formIds = [2];
        $this->expectException(ForbiddenHttpException::class);
        $widget->setFormFilter(200);
    }

    public function testHiddenFiltersCannotBeOverriddenByARequest(): void
    {
        $widget = $this->scopedWidget();
        $widget->formIds = '*';
        $widget->showFilters = false;
        $this->expectException(ForbiddenHttpException::class);
        $widget->setFormFilter(200);
    }

    private function scopedWidget(): RecentWidget
    {
        $service = $this->createMock(FormsService::class);
        $service->method('getAllFormNames')->willReturn([2 => 'Contact', 200 => 'Older form', 300 => 'Restricted']);
        $service->method('getAllowedReadFormIds')->willReturn([2, 200]);
        $widget = $this->getMockBuilder(RecentWidget::class)->disableOriginalConstructor()->onlyMethods(['getFormService'])->getMock();
        $widget->method('getFormService')->willReturn($service);

        return $widget;
    }
}
