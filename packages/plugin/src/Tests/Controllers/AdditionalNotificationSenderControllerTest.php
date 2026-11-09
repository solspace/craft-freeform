<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Solspace\Freeform\Bundles\Notifications\Providers\AdditionalNotificationRecipientsProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Bundles\Rules\Types\NotificationRuleValidator;
use Solspace\Freeform\controllers\notifications\SenderController;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField as EmailNotification;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Services\MailerService;
use Solspace\Freeform\Services\NotificationsService;
use Solspace\Freeform\Services\SubmissionsService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

#[CoversClass(SenderController::class)]
class AdditionalNotificationSenderControllerTest extends TestCase
{
    private mixed $previousContainer;

    protected function setUp(): void
    {
        $this->previousContainer = \Craft::$container;
    }

    protected function tearDown(): void
    {
        \Craft::$container = $this->previousContainer;
    }

    #[TestWith([['alice@example.test', 'bob@example.test'], '', [1 => ['alice@example.test'], 2 => ['bob@example.test']]])]
    #[TestWith([['alice@example.test'], '', [1 => ['alice@example.test']]])]
    #[TestWith([[], 'team@example.test', [1 => ['team@example.test'], 2 => ['team@example.test']]])]
    #[TestWith([['alice@example.test', 'bob@example.test'], 'team@example.test', [1 => ['team@example.test', 'alice@example.test'], 2 => ['team@example.test', 'bob@example.test']]])]
    public function testBulkSendKeepsRecipientsAndContentScopedToEachSubmission(array $selected, string $manual, array $expected): void
    {
        [$controller, $mailer, $field] = $this->fixture(['selectedEmails' => $selected, 'emails' => $manual]);
        $sent = [];
        $mailer->expects(self::exactly(\count($expected)))->method('sendEmail')->willReturnCallback(
            static function ($form, $recipients, $template, $submission) use (&$sent, $field): int {
                $sent[$submission->id] = $recipients->emailsToArray();
                self::assertSame(1 === $submission->id ? 'alice@example.test' : 'bob@example.test', $field->getValue());

                return $recipients->count();
            },
        );

        self::assertTrue($controller->actionSend()->data);
        self::assertSame($expected, $sent);
    }

    #[TestWith([[]])]
    #[TestWith([['unrelated@example.test']])]
    public function testEmptyOrStaleSelectionsDoNotSend(array $selected): void
    {
        [$controller, $mailer] = $this->fixture(['selectedEmails' => $selected]);
        $mailer->expects(self::never())->method('sendEmail');

        self::assertSame('No emails specified', $controller->actionSend()->data);
        self::assertSame(400, $controller->response->statusCode);
    }

    #[TestWith([['emails' => 'invalid']])]
    #[TestWith([['emails' => ['unexpected']]])]
    #[TestWith([['selectedEmails' => [['unexpected']]]])]
    #[TestWith([['submissionIds' => [['unexpected']]]])]
    #[TestWith([['templateMode' => 'unknown']])]
    #[TestWith([['template' => ['unexpected']]])]
    public function testMalformedRequestsDoNotSend(array $params): void
    {
        [$controller, $mailer] = $this->fixture($params);
        $mailer->expects(self::never())->method('sendEmail');

        $this->expectException(BadRequestHttpException::class);
        $controller->actionSend();
    }

    public function testUnauthorizedSubmissionsAreRejectedBeforeAnySending(): void
    {
        [$controller, $mailer] = $this->fixture(['emails' => 'team@example.test'], false);
        $mailer->expects(self::never())->method('sendEmail');

        $this->expectException(ForbiddenHttpException::class);
        $controller->actionSend();
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testDialogueDeduplicatesChoicesAndShowsTheirSubmissionCounts(bool $configured): void
    {
        [$controller] = $this->fixture(configured: $configured);
        $controller->expects(self::once())->method('renderTemplate')->with(
            'freeform/_components/modals/send_additional_notification',
            self::callback(static function (array $variables) use ($configured): bool {
                self::assertSame(2, $variables['submissionCount']);
                self::assertSame(['alice@example.test', 'bob@example.test'], array_keys($variables['recipients']));
                self::assertSame(1, $variables['recipients']['alice@example.test']['count']);
                self::assertSame($configured ? [
                    ['label' => 'Email', 'type' => 'field'],
                    ['label' => 'Submitter', 'type' => 'notification'],
                ] : [['label' => 'Email', 'type' => 'field']], $variables['recipients']['alice@example.test']['sources']);
                self::assertSame($configured ? ['Submitter confirmation'] : [], $variables['recipients']['alice@example.test']['templates']);

                return true;
            }),
        )->willReturn($controller->response);
        $controller->actionDialogue();
    }

    public function testConfiguredOnlySendingDoesNotRequireAnOverrideTemplate(): void
    {
        [$controller, $mailer, $field, $service] = $this->fixture(['templateMode' => 'configured', 'template' => '', 'selectedEmails' => ['alice@example.test', 'bob@example.test']], configured: true);
        $service->expects(self::never())->method('requireNotification');
        $sent = [];
        $mailer->expects(self::exactly(2))->method('sendEmail')->willReturnCallback(static function ($form, $recipients, $template, $submission, $headers, $logger, $notification) use (&$sent, $field): int {
            $sent[] = [$submission->id, $template->getId(), $recipients->emailsToArray()];
            self::assertNotNull($notification);
            self::assertSame($recipients->emailsToArray()[0], $field->getValue());

            return 1;
        });
        self::assertTrue($controller->actionSend()->data);
        self::assertSame([[1, 21, ['alice@example.test']], [2, 21, ['bob@example.test']]], $sent);
    }

    public function testConfiguredAndAdditionalAddressesUseTheirOwnTemplates(): void
    {
        [$controller, $mailer] = $this->fixture(['templateMode' => 'configured', 'selectedEmails' => ['alice@example.test', 'bob@example.test'], 'emails' => 'extra@example.test'], configured: true);
        $sent = [];
        $mailer->expects(self::exactly(4))->method('sendEmail')->willReturnCallback(static function ($form, $recipients, $template, $submission) use (&$sent): int {
            $sent[] = [$submission->id, $template->getId(), $recipients->emailsToArray()];

            return 1;
        });
        self::assertTrue($controller->actionSend()->data);
        self::assertSame([[1, 21, ['alice@example.test']], [1, 12, ['extra@example.test']], [2, 21, ['bob@example.test']], [2, 12, ['extra@example.test']]], $sent);
    }

    public function testConfiguredModeDoesNotSilentlySendToUnconfiguredAddresses(): void
    {
        [$controller, $mailer] = $this->fixture(['templateMode' => 'configured', 'template' => '', 'selectedEmails' => ['alice@example.test']]);
        $mailer->expects(self::never())->method('sendEmail');
        self::assertSame('No emails specified', $controller->actionSend()->data);
        self::assertSame(400, $controller->response->statusCode);
    }

    public function testAdditionalAddressesStillRequireATemplateInConfiguredMode(): void
    {
        [$controller, $mailer] = $this->fixture(['templateMode' => 'configured', 'template' => '', 'selectedEmails' => ['alice@example.test'], 'emails' => 'extra@example.test'], configured: true);
        $mailer->expects(self::never())->method('sendEmail');
        self::assertSame('Please select a template', $controller->actionSend()->data);
        self::assertSame(400, $controller->response->statusCode);
    }

    public function testAdditionalAddressDoesNotReceiveADuplicateOfTheSameConfiguredTemplate(): void
    {
        [$controller, $mailer] = $this->fixture(['templateMode' => 'configured', 'selectedEmails' => ['alice@example.test', 'bob@example.test'], 'emails' => 'alice@example.test'], configured: true, configuredTemplateId: 12);
        $sent = [];
        $mailer->expects(self::exactly(3))->method('sendEmail')->willReturnCallback(static function ($form, $recipients, $template, $submission) use (&$sent): int {
            $sent[] = [$submission->id, $recipients->emailsToArray()];

            return 1;
        });
        self::assertTrue($controller->actionSend()->data);
        self::assertSame([[1, ['alice@example.test']], [2, ['bob@example.test']], [2, ['alice@example.test']]], $sent);
    }

    public function testUnavailableAdditionalTemplateStopsConfiguredSendsBeforeAnyEmailIsSent(): void
    {
        [$controller, $mailer, , $service] = $this->fixture(['templateMode' => 'configured', 'selectedEmails' => ['alice@example.test'], 'emails' => 'extra@example.test'], configured: true, templateAvailable: false);
        $mailer->expects(self::never())->method('sendEmail');
        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('The selected template is no longer available');
        $controller->actionSend();
    }

    private function fixture(array $params = [], bool $editable = true, bool $configured = false, int $configuredTemplateId = 21, bool $templateAvailable = true): array
    {
        $params = array_replace(['template' => '12', 'emails' => '', 'selectedEmails' => [], 'submissionIds' => [1, 2, 1]], $params);
        $request = $this->createStub(Request::class);
        $request->method('getIsPost')->willReturn(true);
        $request->method('getIsCpRequest')->willReturn(true);
        $request->method('post')->willReturnCallback(static fn ($name, $default = null) => $params[$name] ?? $default);
        $request->method('getParam')->willReturnCallback(static fn ($name, $default = null) => $params[$name] ?? $default);

        // Reuse one mutable form, as FormsService does, to catch content leaking
        // from the last hydrated submission into an earlier submission's email.
        $value = '';
        $field = $this->createStub(EmailField::class);
        $field->method('getHandle')->willReturn('email');
        $field->method('getLabel')->willReturn('Email');
        $field->method('getValue')->willReturnCallback(static function () use (&$value) { return $value; });
        $field->method('getRecipients')->willReturnCallback(static function () use (&$value) { return RecipientCollection::fromArray([$value]); });
        $layout = $this->createStub(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection([$field]));
        $form = $this->createStub(Form::class);
        $form->method('getLayout')->willReturn($layout);
        $form->method('getName')->willReturn('Contact');
        $form->method('get')->willReturn($field);
        $form->method('valuesFromSubmission')->willReturnCallback(static function (Submission $submission) use (&$value): void {
            $value = 1 === $submission->id ? 'alice@example.test' : 'bob@example.test';
        });

        $submissions = [];
        foreach ([1, 2] as $id) {
            $submission = $this->createStub(Submission::class);
            $submission->id = $id;
            $submission->method('getForm')->willReturn($form);
            $submission->method('getIsEditable')->willReturn($editable);
            $submissions[$id] = $submission;
        }
        $submissionsService = $this->createStub(SubmissionsService::class);
        $submissionsService->method('getSubmissionById')->willReturnCallback(static fn ($id) => $submissions[$id] ?? null);

        $notifications = $this->createStub(NotificationsProvider::class);
        $configuredTemplate = new NotificationTemplate();
        $configuredTemplate->id = $configuredTemplateId;
        $configuredTemplate->name = 'Submitter confirmation';
        $configuration = $this->createStub(EmailNotification::class);
        $configuration->method('isEnabled')->willReturn(true);
        $configuration->method('getName')->willReturn('Submitter');
        $configuration->method('getField')->willReturn($field);
        $configuration->method('getTemplate')->willReturn($configuredTemplate);
        $notifications->method('getByForm')->willReturn($configured ? [$configuration] : []);
        $provider = new AdditionalNotificationRecipientsProvider($notifications, $this->createStub(NotificationRuleValidator::class), new IsolatedTwig(), $this->createStub(RuleValidator::class));
        $loggerProvider = $this->createStub(NotificationLoggerProvider::class);
        $loggerProvider->method('getLogger')->willReturn(new NullLogger());
        \Craft::$container = new class($provider, $loggerProvider) {
            public function __construct(private object $provider, private object $loggerProvider) {}

            public function get(string $class): object
            {
                return AdditionalNotificationRecipientsProvider::class === $class ? $this->provider : $this->loggerProvider;
            }
        };

        $record = $this->createStub(NotificationTemplateRecord::class);
        $record->method('__isset')->willReturn(true);
        $record->method('__get')->willReturnCallback(static fn ($name) => match ($name) {
            'id' => 12,
            'uid', 'handle', 'name', 'description' => 'test',
            'autoText', 'includeAttachments' => false,
            default => null,
        });
        $notificationsService = $this->createMock(NotificationsService::class);
        $notificationsService->method('requireNotification')->willReturn($templateAvailable ? $record : null);
        $notificationsService->method('getAllNotifications')->willReturn([]);
        $mailer = $this->createMock(MailerService::class);
        $controller = $this->getMockBuilder(SenderController::class)->disableOriginalConstructor()
            ->onlyMethods(['getSubmissionsService', 'getNotificationsService', 'getMailerService', 'renderTemplate'])->getMock()
        ;
        $controller->request = $request;
        $controller->response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $controller->method('getSubmissionsService')->willReturn($submissionsService);
        $controller->method('getNotificationsService')->willReturn($notificationsService);
        $controller->method('getMailerService')->willReturn($mailer);

        return [$controller, $mailer, $field, $notificationsService];
    }
}
