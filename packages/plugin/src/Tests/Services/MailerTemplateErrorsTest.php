<?php

namespace Solspace\Freeform\Tests\Services;

use CraftCms\Cms\ProjectConfig\ProjectConfig;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Activity\ActivityDiagnostics;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Records\Notifications\NotificationWrapperRecord;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\MailerService;
use Solspace\Freeform\Services\Notifications\NotificationWrappersService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use Twig\Environment;
use Twig\Error\Error as TwigError;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;
use Twig\Loader\ArrayLoader;

#[CoversClass(MailerService::class)]
class MailerTemplateErrorsTest extends TestCase
{
    use UsesCraft6Container;

    private mixed $previousApp;
    private MailerService $mailer;
    private Environment $twig;
    private NotificationWrappersService $wrappers;
    private ActivityService $activity;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->twig = new Environment(new ArrayLoader());
        $this->mailer = (new \ReflectionClass(MailerService::class))->newInstanceWithoutConstructor();
        $this->wrappers = $this->createStub(NotificationWrappersService::class);
        $this->activity = $this->createMock(ActivityService::class);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get', 'isPro'])->getMock();
        $plugin->method('isPro')->willReturn(true);
        $plugin->method('__get')->willReturnMap([
            ['notificationWrappers', $this->wrappers],
            ['activity', $this->activity],
        ]);
        app()->instance(Freeform::class, $plugin);
        $config = $this->createStub(ProjectConfig::class);
        $config->method('get')->willReturn([]);
        app()->instance(ProjectConfig::class, $config);
        \Craft::$app = new class($this->twig) {
            public self $view;

            public function __construct(private Environment $twig)
            {
                $this->view = $this;
            }

            public function getTwig(): Environment
            {
                return $this->twig;
            }

            public function getSites(): self
            {
                return $this;
            }

            public function getCurrentSite(): object
            {
                return (object) ['uid' => 'qa'];
            }

            public function getTemplateMode(): string
            {
                return 'site';
            }

            public function setTemplateMode(string $mode): void {}
        };
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    #[TestWith(['fromName', 'From Name'])]
    #[TestWith(['fromEmail', 'From Email'])]
    #[TestWith(['textBody', 'Plain-text body'])]
    #[TestWith(['body', 'HTML body'])]
    #[TestWith(['subject', 'Subject'])]
    #[TestWith(['cc', 'CC'])]
    #[TestWith(['bcc', 'BCC'])]
    #[TestWith(['replyToName', 'Reply-To Name'])]
    #[TestWith(['replyToEmail', 'Reply-To Email'])]
    #[TestWith(['presetAssets', 'Predefined Assets'])]
    public function testSyntaxErrorsIdentifyTheNotificationField(string $property, string $label): void
    {
        $notification = $this->notification();
        $notification->{$property} = "\n\n\n{% set address = person@example.com %}{{ address }}";

        try {
            $this->mailer->compileMessage($notification, []);
            self::fail('Expected a Twig syntax error');
        } catch (SyntaxError $exception) {
            self::assertStringContainsString('Unexpected character "@"', $exception->getMessage());
            self::assertStringContainsString('in "Notification: '.$label.'" at line 4 column ', $exception->getMessage());
            self::assertStringNotContainsString('__string_template__', $exception->getMessage());
            self::assertSame(4, $exception->getTemplateLine());
            self::assertGreaterThan(0, $exception->getTemplateColumn());
            self::assertSame(ActivityContext::MAIL_TEMPLATE_SYNTAX, ActivityContext::exceptionReason($exception, ActivityContext::MAIL_RENDER_FAILED));
            self::assertStringContainsString('Notification: '.$label, ActivityDiagnostics::fromException($exception)['message']);
        }
    }

    public function testWrapperErrorsIdentifyTheWrapper(): void
    {
        $notification = $this->notification();
        $notification->wrapperId = 1;
        $wrapper = $this->createStub(NotificationWrapperRecord::class);
        $wrapper->method('__get')->with('content')->willReturn('{% set address = person@example.com %}');
        $this->wrappers->method('getById')->with(1)->willReturn($wrapper);

        $this->expectException(SyntaxError::class);
        $this->expectExceptionMessage('in "Notification: Wrapper" at line 1');
        $this->mailer->compileMessage($notification, []);
    }

    public function testIncludedTemplateErrorsRetainTheirOwnNameAndLine(): void
    {
        $this->twig->getLoader()->setTemplate('footer.twig', "\n{% set address = person@example.com %}");
        $notification = $this->notification();
        $notification->body = '{% include "footer.twig" %}';

        $this->expectException(SyntaxError::class);
        $this->expectExceptionMessage('in "Notification: HTML body (footer.twig)" at line 2');
        $this->mailer->compileMessage($notification, []);
    }

    #[TestWith(['{{ missingValue }}', RuntimeError::class, ActivityContext::MAIL_RENDER_FAILED])]
    #[TestWith(['{% include "missing.twig" %}', LoaderError::class, ActivityContext::MAIL_TEMPLATE_UNAVAILABLE])]
    public function testOtherTwigFailuresRetainTheirTypeAndIdentifyTheField(string $body, string $exceptionClass, int $reason): void
    {
        $this->twig->enableStrictVariables();
        $notification = $this->notification();
        $notification->body = $body;

        try {
            $this->mailer->compileMessage($notification, []);
            self::fail('Expected a Twig error');
        } catch (TwigError $exception) {
            self::assertInstanceOf($exceptionClass, $exception);
            self::assertStringContainsString('Notification: HTML body', $exception->getMessage());
            self::assertSame($reason, ActivityContext::exceptionReason($exception, ActivityContext::MAIL_RENDER_FAILED));
        }
    }

    #[TestWith(['filename', 'PDF attachment filename'])]
    #[TestWith(['body', 'PDF attachment body'])]
    public function testPdfTemplateErrorsIdentifyTheAttachmentField(string $field, string $label): void
    {
        $invalid = '{% set address = person@example.com %}';
        $this->expectException(SyntaxError::class);
        $this->expectExceptionMessage('in "Notification: '.$label.'" at line 1');
        $this->mailer->renderPdf('body' === $field ? $invalid : 'Body', 'filename' === $field ? $invalid : 'Attachment', []);
    }

    public function testPlainEmailAddressesAndWrapperOutputRemainValid(): void
    {
        $notification = $this->notification();
        $notification->body = 'Contact: person@example.com';
        $notification->textBody = 'Contact: person@example.com';
        $notification->wrapperId = 1;
        $wrapper = $this->createStub(NotificationWrapperRecord::class);
        $wrapper->method('__get')->with('content')->willReturn('<main>{{ emailBody }}</main>');
        $this->wrappers->method('getById')->willReturn($wrapper);

        $message = $this->mailer->compileMessage($notification, []);
        self::assertSame('<main>Contact: person@example.com</main>', $message->getSymfonyEmail()->getHtmlBody());
        self::assertSame('Contact: person@example.com', $message->getSymfonyEmail()->getTextBody());
    }

    public function testSendFailureRecordsTheFieldInCustomerDiagnostics(): void
    {
        $notification = $this->notification();
        $notification->textBody = '{% set address = person@example.com %}';
        $mailer = $this->getMockBuilder(MailerService::class)->disableOriginalConstructor()->onlyMethods(['processRecipients', 'compileTwigVariables'])->getMock();
        $mailer->method('processRecipients')->willReturn(['person@example.com']);
        $mailer->method('compileTwigVariables')->willReturn([]);
        $form = $this->createStub(Form::class);
        $form->method('getId')->willReturn(7);
        $this->activity->expects(self::once())->method('record')->with('email-error', 7, null, self::callback(static function ($metadata) {
            self::assertSame(ActivityContext::MAIL_TEMPLATE_SYNTAX, $metadata['reasonCode']);
            self::assertStringContainsString('Notification: Plain-text body', $metadata['diagnostics']['message']);
            self::assertStringNotContainsString('__string_template__', json_encode($metadata));
            self::assertStringNotContainsString('{% set', json_encode($metadata));

            return true;
        }));

        self::assertSame(0, $mailer->sendEmail($form, new RecipientCollection(), $notification));
    }

    private function notification(): NotificationTemplate
    {
        $notification = new NotificationTemplate();
        $notification->name = 'QA notification';
        $notification->handle = 'qa';
        $notification->fromName = 'Sender';
        $notification->fromEmail = 'sender@example.com';
        $notification->replyToEmail = 'reply@example.com';
        $notification->body = 'Body';
        $notification->textBody = 'Text';
        $notification->subject = 'Subject';
        $notification->includeAttachments = false;

        return $notification;
    }
}
