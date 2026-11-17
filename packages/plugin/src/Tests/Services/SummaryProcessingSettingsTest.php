<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\FormAttributesCollection;
use Solspace\Freeform\Library\Collections\PageCollection;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SummaryService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversNothing]
class SummaryProcessingSettingsTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith(['button'])]
    #[TestWith(['overlay'])]
    #[TestWith(['both'])]
    public function testSupportSummaryHandlesEveryProcessingModeWithoutReadingRemovedFlags(string $mode): void
    {
        $behavior = new BehaviorSettings();
        $behavior->processingDisplay = $mode;
        $settings = $this->createStub(Settings::class);
        $settings->method('getBehavior')->willReturn($behavior);
        $settings->method('getGeneral')->willReturn(new GeneralSettings());
        $form = $this->createStub(Form::class);
        $form->method('getSettings')->willReturn($settings);
        $form->method('getPages')->willReturn(new PageCollection());
        $form->method('getLayout')->willReturn(new FormLayout());
        $form->method('getAttributes')->willReturn(new FormAttributesCollection());
        $forms = $this->createStub(FormsService::class);
        $forms->method('getAllForms')->willReturn([$form]);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $plugin->method('__get')->willReturnMap([['forms', $forms]]);
        app()->instance(Freeform::class, $plugin);
        $summary = (new \ReflectionMethod(SummaryService::class, 'extractFromComposer'))->invoke(new SummaryService());
        self::assertTrue($summary->loadingIndicators);
        self::assertFalse($summary->multiPage);
        self::assertSame([], $summary->fieldTypes);
    }
}
