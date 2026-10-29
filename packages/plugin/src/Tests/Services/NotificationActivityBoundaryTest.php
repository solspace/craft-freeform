<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Bundles\Notifications\SendListeners\AdminNotifications;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Jobs\FreeformQueueHandler;
use Solspace\Freeform\Library\DataObjects\DisabledFunctionality;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Services\MailerService;

#[CoversNothing]
class NotificationActivityBoundaryTest extends TestCase
{
    #[TestWith([false])]
    #[TestWith([true])]
    public function testAbsentNotificationsAndUnconfiguredTemplatesDoNotAttemptEmail(bool $hasNotification): void
    {
        $recipients = RecipientCollection::fromArray(['qa@example.test']);
        $notification = $this->createStub(Admin::class);
        $notification->method('getRecipients')->willReturn($recipients);
        $notification->method('getTemplate')->willReturn(null);
        $form = $this->createStub(Form::class);
        $form->method('isDisabled')->willReturn(new DisabledFunctionality());
        $provider = $this->createMock(NotificationsProvider::class);
        $provider->expects(self::once())->method('getByFormAndClass')->with($form, Admin::class)->willReturn($hasNotification ? [$notification] : []);
        $queue = $this->createMock(FreeformQueueHandler::class);
        $queue->expects(self::never())->method('executeNotificationJob');
        $mailer = $this->createMock(MailerService::class);
        $mailer->expects(self::never())->method('sendEmail');
        $listener = $this->getMockBuilder(AdminNotifications::class)->disableOriginalConstructor()->onlyMethods(['getProcessedRecipientsAndTemplate'])->getMock();
        $listener->expects($hasNotification ? self::once() : self::never())->method('getProcessedRecipientsAndTemplate')->willReturn([$recipients, null]);
        (new \ReflectionProperty(AdminNotifications::class, 'notificationsProvider'))->setValue($listener, $provider);
        (new \ReflectionProperty(AdminNotifications::class, 'queueHandler'))->setValue($listener, $queue);
        $submission = $this->createMock(Submission::class);
        $submission->expects($hasNotification ? self::once() : self::never())->method('getFormFieldValues')->willReturn([]);
        $listener->sendToRecipients(new SendNotificationsEvent($form, $submission, $mailer, 1));
    }
}
