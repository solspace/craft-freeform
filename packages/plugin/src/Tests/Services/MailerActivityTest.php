<?php

namespace Solspace\Freeform\Tests\Services;

use craft\mail\Message;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\MailerService;

#[CoversNothing]
class MailerActivityTest extends TestCase
{
    #[TestWith(['unavailable', null])]
    #[TestWith(['accepted', null])]
    #[TestWith(['rejected', ActivityContext::MAIL_REJECTED])]
    #[TestWith(['render', ActivityContext::MAIL_RENDER_FAILED])]
    #[TestWith(['before', ActivityContext::MAIL_PREPARATION_FAILED])]
    #[TestWith(['transport', ActivityContext::MAIL_SEND_EXCEPTION])]
    #[TestWith(['after', ActivityContext::MAIL_AFTER_SEND_FAILED])]
    #[TestWith(['missing', ActivityContext::MAIL_TEMPLATE_MISSING])]
    #[TestWith(['recipients', ActivityContext::MAIL_NO_RECIPIENTS])]
    public function testNotificationOutcomeRecordsSafeStageWithoutRecipientOrExceptionText(string $scenario, ?int $reason): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;
        $events = [];
        $activity = $this->createMock(ActivityService::class);
        $activity->method('record')->willReturnCallback(static function ($event, $formId, $submissionId, $metadata) use (&$events) {
            $events[] = [$event, $formId, $submissionId, $metadata];
        });
        $edition = $this->createStub(EditionHelper::class);
        $edition->method('isBelow')->willReturn(true);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['get', 'edition'])->getMock();
        if ('unavailable' === $scenario) {
            $plugin->method('get')->with('activity')->willThrowException(new \RuntimeException('Diagnostics unavailable'));
        } else {
            $plugin->method('get')->with('activity')->willReturn($activity);
        }
        $plugin->method('edition')->willReturn($edition);
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];
        $view = new class {
            public string $mode = 'cp';

            public function getTemplateMode(): string
            {
                return $this->mode;
            }

            public function setTemplateMode(string $mode): void
            {
                $this->mode = $mode;
            }
        };
        $transport = new class($scenario) {
            public int $calls = 0;

            public function __construct(private string $scenario) {}

            public function send($message): bool
            {
                ++$this->calls;
                if ('transport' === $this->scenario) {
                    throw new \RuntimeException('SECRET transport response');
                }

                return 'rejected' !== $this->scenario;
            }
        };
        \Craft::$app = (object) ['view' => $view, 'mailer' => $transport];

        try {
            $mailer = $this->getMockBuilder(MailerService::class)->disableOriginalConstructor()->onlyMethods(['processRecipients', 'compileTwigVariables', 'compileMessage'])->getMock();
            $mailer->method('processRecipients')->willReturn('recipients' === $scenario ? [] : ['private@example.test']);
            $mailer->method('compileTwigVariables')->willReturn([]);
            $message = $this->createStub(Message::class);
            $message->method('setTo')->willReturnSelf();
            if ('render' === $scenario) {
                $mailer->method('compileMessage')->willThrowException(new \RuntimeException('SECRET template'));
            } else {
                $mailer->method('compileMessage')->willReturn($message);
            }
            foreach (['before' => MailerService::EVENT_BEFORE_SEND, 'after' => MailerService::EVENT_AFTER_SEND] as $stage => $event) {
                if ($scenario === $stage) {
                    $mailer->on($event, static fn () => throw new \RuntimeException('SECRET handler'));
                }
            }
            $form = $this->createStub(Form::class);
            $form->method('getId')->willReturn(12);
            $template = $this->createStub(NotificationTemplate::class);
            $count = $mailer->sendEmail($form, new RecipientCollection(), 'missing' === $scenario ? null : $template);
            self::assertSame(\in_array($scenario, ['accepted', 'unavailable'], true) ? 1 : 0, $count);
            self::assertSame('cp', $view->mode);
            if ('unavailable' === $scenario) {
                self::assertSame([], $events);
                self::assertSame(1, $transport->calls);

                return;
            }
            self::assertCount('after' === $scenario ? 2 : 1, $events);
            $last = $events[array_key_last($events)];
            self::assertSame(null === $reason ? 'email-sent' : 'email-error', $last[0]);
            self::assertSame($reason, $last[3]['reasonCode'] ?? null);
            self::assertStringNotContainsString('SECRET', json_encode($events));
            self::assertStringNotContainsString('private@example.test', json_encode($events));
            self::assertSame(\in_array($scenario, ['accepted', 'rejected', 'transport', 'after'], true) ? 1 : 0, $transport->calls);
        } finally {
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }
}
