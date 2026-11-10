<?php

namespace Solspace\Freeform\Tests\Services;

use craft\services\Elements;
use Illuminate\Support\MessageBag;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\SubmissionsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversNothing]
class SubmissionActivityTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith([false, false])]
    #[TestWith([true, false])]
    #[TestWith([false, true])]
    #[TestWith([true, true])]
    public function testDiagnosticsPreserveRejectedAndExceptionalSaveOutcomes(bool $throws, bool $diagnosticsUnavailable): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;
        $form = $this->createStub(Form::class);
        $form->method('getId')->willReturn(12);
        $submission = $this->createStub(Submission::class);
        $submission->method('errors')->willReturn(new MessageBag(['email' => ['SECRET submitted value']]));
        $failure = new \RuntimeException('Original save failure');
        $elements = $this->createMock(Elements::class);
        $save = $elements->expects(self::once())->method('saveElement')->with($submission, true, true, false);
        if ($throws) {
            $save->willThrowException($failure);
        } else {
            $save->willReturn(false);
        }
        $activity = $this->createMock(ActivityService::class);
        $activity->expects($diagnosticsUnavailable ? self::never() : self::once())->method('record')
            ->with('error', 12, null, self::callback(static function ($metadata) use ($throws) {
                self::assertSame($throws ? ActivityContext::SUBMISSION_SAVE_EXCEPTION : ActivityContext::SUBMISSION_SAVE_REJECTED, $metadata['reasonCode']);
                self::assertSame(1, $metadata['errorCount']);
                self::assertStringNotContainsString('SECRET submitted value', json_encode($metadata));
                if ($throws) {
                    self::assertSame('Original save failure', $metadata['diagnostics']['message']);
                    self::assertSame(\RuntimeException::class, $metadata['diagnostics']['exception']);
                } else {
                    self::assertArrayNotHasKey('diagnostics', $metadata);
                }

                return true;
            }))
        ;
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        app()->instance(Freeform::class, $plugin);
        $get = $plugin->method('__get')->with('activity');
        if ($diagnosticsUnavailable) {
            $get->willThrowException(new \RuntimeException('Diagnostics unavailable'));
        } else {
            $get->willReturn($activity);
        }
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];
        \Craft::$app = new class($elements) {
            public function __construct(private Elements $elements) {}

            public function getElements(): Elements
            {
                return $this->elements;
            }
        };

        try {
            $settings = $this->createStub(SettingsService::class);
            $settings->method('isUpdateSearchIndexes')->willReturn(false);
            $service = $this->getMockBuilder(SubmissionsService::class)->onlyMethods(['getSettingsService'])->getMock();
            $service->method('getSettingsService')->willReturn($settings);

            try {
                self::assertFalse($service->storeSubmission($form, $submission));
                self::assertFalse($throws, 'An original save exception must propagate.');
            } catch (\RuntimeException $actual) {
                self::assertTrue($throws);
                self::assertSame($failure, $actual);
            }
        } finally {
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }
}
