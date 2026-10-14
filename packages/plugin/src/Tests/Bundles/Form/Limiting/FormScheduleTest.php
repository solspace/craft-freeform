<?php

namespace Solspace\Freeform\Tests\Bundles\Form\Limiting;

use Carbon\Carbon;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Limiting\FormSchedule;
use Solspace\Freeform\Bundles\Form\Limiting\FormStopSubmissionsAfter;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Settings;

#[CoversClass(FormSchedule::class)]
#[CoversClass(FormStopSubmissionsAfter::class)]
class FormScheduleTest extends TestCase
{
    protected function tearDown(): void
    {
        Carbon::setTestNow();
    }

    #[TestWith(['2026-10-14T08:59:59-05:00', FormSchedule::PENDING])]
    #[TestWith(['2026-10-14T09:00:00-05:00', null])]
    #[TestWith(['2026-10-14T17:00:00-05:00', null])]
    #[TestWith(['2026-10-14T17:00:01-05:00', FormSchedule::EXPIRED])]
    #[TestWith(['2026-10-14T14:00:00+00:00', null])]
    public function testScheduleUsesExactInstantsIncludingTimezoneOffsets(string $now, ?string $status): void
    {
        $settings = $this->settings();
        self::assertSame($status, FormSchedule::getStatus($settings, new \DateTimeImmutable($now)));
    }

    public function testDisabledScheduleIgnoresSavedDates(): void
    {
        $settings = $this->settings();
        $settings->scheduleEnabled = false;
        self::assertNull(FormSchedule::getStatus($settings, new \DateTimeImmutable('2030-01-01')));
    }

    public function testEitherBoundaryCanBeOmitted(): void
    {
        $settings = $this->settings();
        $settings->startSubmissionsAt = null;
        self::assertNull(FormSchedule::getStatus($settings, new \DateTimeImmutable('2026-01-01')));
        $settings->stopSubmissionsAfter = null;
        self::assertNull(FormSchedule::getStatus($settings, new \DateTimeImmutable('2030-01-01')));
        $settings->startSubmissionsAt = new \DateTime('2026-10-14');
        self::assertSame(FormSchedule::PENDING, FormSchedule::getStatus($settings, new \DateTimeImmutable('2026-01-01')));
    }

    public function testExistingCutoffKeepsItsEntireFinalDay(): void
    {
        $settings = new BehaviorSettings();
        $original = new \DateTime('2026-10-14T00:00:00-05:00');
        $settings->stopSubmissionsAfter = $original;
        $settings->normalizeSchedule();
        self::assertTrue($settings->scheduleEnabled);
        self::assertSame('23:59:59', $settings->stopSubmissionsAfter->format('H:i:s'));
        self::assertSame('00:00:00', $original->format('H:i:s'));
        self::assertNull(FormSchedule::getStatus($settings, new \DateTimeImmutable('2026-10-14T23:59:59-05:00')));
        self::assertSame(FormSchedule::EXPIRED, FormSchedule::getStatus($settings, new \DateTimeImmutable('2026-10-15T00:00:00-05:00')));
        $settings->normalizeSchedule();
        self::assertSame('23:59:59', $settings->stopSubmissionsAfter->format('H:i:s'));
    }

    public function testNewSchedulesPreserveChosenTimesWhenLoaded(): void
    {
        $settings = $this->settings();
        $settings->normalizeSchedule();
        self::assertSame('17:00:00', $settings->stopSubmissionsAfter->format('H:i:s'));
    }

    #[TestWith(['2026-10-14T08:00:00-05:00'])]
    #[TestWith(['2026-10-14T09:00:00-05:00'])]
    public function testEndMustBeAfterStart(string $end): void
    {
        $errors = FormSchedule::validateSettings((object) [
            'scheduleEnabled' => true,
            'startSubmissionsAt' => '2026-10-14T09:00:00-05:00',
            'stopSubmissionsAfter' => $end,
        ]);
        self::assertArrayHasKey('stopSubmissionsAfter', $errors);
    }

    public function testInvalidDateIsReportedAndDisabledDatesAreIgnored(): void
    {
        $settings = (object) ['scheduleEnabled' => true, 'startSubmissionsAt' => 'not-a-date'];
        self::assertArrayHasKey('startSubmissionsAt', FormSchedule::validateSettings($settings));
        $settings->scheduleEnabled = false;
        self::assertSame([], FormSchedule::validateSettings($settings));
    }

    #[TestWith(['2026-10-14T08:00:00-05:00', 'This form is not available yet.'])]
    #[TestWith(['2026-10-14T18:00:00-05:00', 'This form can no longer be submitted.'])]
    public function testSubmissionsOutsideScheduleStopValidation(string $now, string $error): void
    {
        Carbon::setTestNow(new Carbon($now));
        $settings = $this->createMock(Settings::class);
        $settings->method('getBehavior')->willReturn($this->settings());
        $form = $this->createMock(Form::class);
        $form->method('getSettings')->willReturn($settings);
        $form->expects(self::once())->method('addError')->with($error)->willReturnSelf();
        $event = new ValidationEvent($form);
        $bundle = (new \ReflectionClass(FormStopSubmissionsAfter::class))->newInstanceWithoutConstructor();
        $bundle->handler($event);
        self::assertFalse($event->isValid);
        self::assertFalse($event->getValidationOverride());
    }

    public function testUnavailableRenderShowsEscapedMessageWithoutRenderingForm(): void
    {
        Carbon::setTestNow(new Carbon('2026-10-14T08:00:00-05:00'));
        $behavior = $this->settings();
        $behavior->schedulePendingMessage = '<script>bad()</script>';
        $form = $this->form($behavior);
        $form->expects(self::never())->method('getFormHandler');
        self::assertFalse($form->isAvailable());
        $html = (string) $form->render();
        self::assertStringContainsString('&lt;script&gt;', $html);
        self::assertStringNotContainsString('<form', $html);
    }

    public function testEmptyMessageHidesUnavailableFormCompletely(): void
    {
        Carbon::setTestNow(new Carbon('2026-10-14T18:00:00-05:00'));
        $behavior = $this->settings();
        $behavior->scheduleExpiredMessage = '';
        self::assertNull($this->form($behavior)->render());
    }

    private function settings(): BehaviorSettings
    {
        $settings = new BehaviorSettings();
        $settings->scheduleEnabled = true;
        $settings->startSubmissionsAt = new \DateTime('2026-10-14T09:00:00-05:00');
        $settings->stopSubmissionsAfter = new \DateTime('2026-10-14T17:00:00-05:00');

        return $settings;
    }

    private function form(BehaviorSettings $behavior): Form
    {
        $settings = $this->createMock(Settings::class);
        $settings->method('getBehavior')->willReturn($behavior);
        $form = $this->getMockBuilder(Form::class)->disableOriginalConstructor()->onlyMethods(['getSettings', 'setProperties', 'getFormHandler'])->getMock();
        $form->method('getSettings')->willReturn($settings);
        $form->method('setProperties')->willReturnSelf();
        $translations = $this->createMock(TranslationProvider::class);
        $translations->method('getTranslation')->willReturnCallback(static fn ($context, $namespace, $key, $value) => $value);
        (new \ReflectionProperty(Form::class, 'translationProvider'))->setValue($form, $translations);

        return $form;
    }
}
