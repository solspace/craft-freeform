<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Integrations\AI\Fields\AiField;
use Solspace\Freeform\Integrations\Single\FormMonitor\Providers\FormMonitorProvider;
use Solspace\Freeform\Jobs\FreeformQueueHandler;
use Solspace\Freeform\Jobs\ProcessSubmissionJob;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\DataObjects\DisabledFunctionality;
use Solspace\Freeform\Services\Ai\AiService;
use Solspace\Freeform\Services\SettingsService;
use Solspace\Freeform\Services\SubmissionProcessingService;
use Solspace\Freeform\Services\SubmissionsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\base\Event;
use yii\di\Container;

#[CoversNothing]
class SubmissionProcessingServiceTest extends TestCase
{
    use UsesCraft6Container;

    public function testOutboundListenersSeeAiValuesOnlyAfterAiCompletes(): void
    {
        $form = $this->createMock(Form::class);
        $form->method('isDisabled')->willReturn(new DisabledFunctionality());
        $submission = $this->createMock(Submission::class);
        $values = ['analysis' => ''];
        $submission->method('getFormFieldValues')->willReturnCallback(static fn () => $values);
        $ai = $this->createMock(AiService::class);
        $order = [];
        $ai->expects(self::once())->method('processAiFields')->with($form, $submission)->willReturnCallback(static function () use (&$values, &$order) {
            $order[] = 'AI started';
            self::assertCount(1, $order, 'No outbound processing may occur while AI is pending.');
            $values['analysis'] = 'AI result';
            $order[] = 'AI completed';
        });
        $listener = static function (ProcessSubmissionEvent $event) use (&$order, &$values) {
            self::assertSame('AI result', $values['analysis']);
            self::assertSame(['AI started', 'AI completed'], $order);
            $order[] = 'notifications and integrations';
        };
        Event::on(Submission::class, Submission::EVENT_PROCESS_SUBMISSION, $listener);

        try {
            (new SubmissionProcessingService($ai))->process($form, $submission);
            self::assertSame(['AI started', 'AI completed', 'notifications and integrations'], $order);
        } finally {
            Event::off(Submission::class, Submission::EVENT_PROCESS_SUBMISSION, $listener);
        }
    }

    public function testAiFailureDoesNotDispatchDependentWork(): void
    {
        $form = $this->createMock(Form::class);
        $form->method('isDisabled')->willReturn(new DisabledFunctionality());
        $submission = $this->createMock(Submission::class);
        $ai = $this->createMock(AiService::class);
        $ai->method('processAiFields')->willThrowException(new \RuntimeException('AI failed'));
        $calls = 0;
        $listener = static function () use (&$calls) { ++$calls; };
        Event::on(Submission::class, Submission::EVENT_PROCESS_SUBMISSION, $listener);

        try {
            try {
                (new SubmissionProcessingService($ai))->process($form, $submission);
                self::fail('The failed processing step must be retried by the queue.');
            } catch (\RuntimeException $e) {
                self::assertSame('AI failed', $e->getMessage());
            }
            self::assertSame(0, $calls);
        } finally {
            Event::off(Submission::class, Submission::EVENT_PROCESS_SUBMISSION, $listener);
        }
    }

    #[TestWith([true, 123, false, true])]
    #[TestWith([false, 123, false, false])]
    #[TestWith([true, null, false, true])]
    #[TestWith([true, 123, true, false])]
    public function testBackgroundModeDefersStoredAndUnstoredProcessingWhileMonitorRemainsImmediate(bool $enabled, ?int $id, bool $monitorRequest, bool $queued): void
    {
        $settings = $this->createMock(SettingsService::class);
        $settings->method('isQueueEnabled')->willReturn($enabled);
        $service = $this->getMockBuilder(SubmissionsService::class)->onlyMethods(['getSettingsService'])->getMock();
        $service->method('getSettingsService')->willReturn($settings);
        $monitor = $this->createMock(FormMonitorProvider::class);
        $monitor->method('isRequestFromFormMonitor')->willReturn($monitorRequest);
        $processor = $this->createMock(SubmissionProcessingService::class);
        $processor->expects($queued ? self::never() : self::once())->method('process');
        $queue = $this->createMock(FreeformQueueHandler::class);
        $queue->expects($queued ? self::once() : self::never())->method('queueJob')->with(self::callback(static function ($job) use ($id) {
            self::assertInstanceOf(ProcessSubmissionJob::class, $job);
            self::assertSame($id, $job->submissionId);
            self::assertSame(7, $job->siteId);
            self::assertSame(['notifications' => true], $job->disabled);

            return true;
        }));
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(4);
        $form->method('isDisabled')->willReturn(new DisabledFunctionality(['notifications' => true]));
        $submission = $this->createMock(Submission::class);
        $submission->id = $id;
        $submission->siteId = 7;
        $before = \Craft::$container;
        \Craft::$container = new Container();
        \Craft::$container->set(FormMonitorProvider::class, $monitor);
        \Craft::$container->set(SubmissionProcessingService::class, $processor);
        \Craft::$container->set(FreeformQueueHandler::class, $queue);

        try {
            $service->postProcessSubmission($form, $submission);
        } finally {
            \Craft::$container = $before;
        }
    }

    public function testUnstoredAiResultsUpdateBothFormAndSubmissionWithoutWritingARow(): void
    {
        $integration = $this->createStub(AiIntegrationInterface::class);
        $integration->method('isEnabled')->willReturn(true);
        $field = $this->createMock(AiField::class);
        $field->method('getIntegration')->willReturn($integration);
        $field->method('getHandle')->willReturn('analysis');
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection([$field]));
        $form = $this->createMock(Form::class);
        $form->method('getLayout')->willReturn($layout);
        $form->expects(self::once())->method('setFieldValues')->with(['analysis' => 'result'])->willReturnSelf();
        $submission = $this->createMock(Submission::class);
        $submission->id = null;
        $submission->expects(self::once())->method('setFormFieldValues')->with(['analysis' => 'result'], false)->willReturnSelf();
        $ai = $this->getMockBuilder(AiService::class)->disableOriginalConstructor()->onlyMethods(['processAiField'])->getMock();
        $ai->expects(self::once())->method('processAiField')->willReturn('result');
        $ai->processAiFields($form, $submission);
    }
}
