<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\EventListeners;

use craft\mail\Message;
use Solspace\Freeform\Events\Mailer\SendEmailEvent;
use Solspace\Freeform\Events\Notifications\PrepareSendNotificationEvent;
use Solspace\Freeform\Integrations\Single\FormMonitor\Providers\FormMonitorProvider;
use Solspace\Freeform\Jobs\SendNotificationsJob;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\MailerService;
use yii\base\Event;

class EmailOverrides extends FeatureBundle
{
    public function __construct(
        private FormMonitorProvider $formMonitorProvider,
        private FormsService $formsService,
    ) {
        Event::on(
            SendNotificationsJob::class,
            SendNotificationsJob::EVENT_PREPARE_NOTIFICATION_JOB,
            [$this, 'handleJobPreparation'],
        );

        Event::on(
            MailerService::class,
            MailerService::EVENT_BEFORE_SEND,
            [$this, 'handleEmails'],
        );
    }

    public function handleJobPreparation(PrepareSendNotificationEvent $event): void
    {
        $job = $event->getJob();

        $form = $this->formsService->getFormById($job->formId);
        $isFormMonitorRequest = $this->formMonitorProvider->isRequestFromFormMonitor($form);
        if (!$isFormMonitorRequest) {
            return;
        }

        $formMonitor = $this->formMonitorProvider->getFormMonitor($form);
        if (!$formMonitor) {
            return;
        }

        if (Conditional::class === $job->notificationType) {
            $job->headers = ['X-Form-Monitor' => 'false'];

            return;
        }

        if (!$formMonitor->getTestEmails()) {
            $job->headers = ['X-Form-Monitor' => 'false'];

            return;
        }

        $isProduction = 'production' === strtolower(\Craft::$app->getConfig()->env);
        if ($formMonitor->getLiveOnly() && !$isProduction) {
            $job->headers = ['X-Form-Monitor' => 'false'];

            return;
        }

        $job->headers = [
            'X-Form-Monitor' => 'true',
            'X-Form-Monitor-Form-Id' => (string) $form->getId(),
            'X-Form-Monitor-Submission-Id' => (string) $job->submissionId,
            'X-Form-Monitor-Request-Id' => (string) $this->formMonitorProvider->getRequestId($form),
            'X-Form-Monitor-Notification-Type' => (string) $job->notificationType,
        ];
    }

    public function handleEmails(SendEmailEvent $event): void
    {
        $message = $event->getMessage();
        $formMonitorHeader = $message->getHeader('X-Form-Monitor');

        // If there is no such header - skip this handler
        if (null === $formMonitorHeader) {
            return;
        }

        // Normalize header value to string
        $headerValue = $this->normalizeHeaderValue($formMonitorHeader);

        // If the header is present, but set to `false` => prevent the email from being sent
        if ('false' === $headerValue) {
            $event->isValid = false;

            return;
        }

        // Only process if this is actually a Form Monitor request
        if ('true' !== $headerValue) {
            return;
        }

        $to = $message->getTo();
        $replyTo = $message->getReplyTo();
        $cc = $message->getCc();
        $bcc = $message->getBcc();

        $message->setTo('inbound@test.formmonitor.com');
        $message->setCc([]);
        $message->setBcc([]);
        $message->setReplyTo([]);

        $this->setHeader($message, 'X-Form-Monitor-To', $to);
        $this->setHeader($message, 'X-Form-Monitor-Reply-To', $replyTo);
        $this->setHeader($message, 'X-Form-Monitor-Cc', $cc);
        $this->setHeader($message, 'X-Form-Monitor-Bcc', $bcc);

        // Check if this is a test email (has test token header)
        $testTokenHeader = $message->getHeader('X-Form-Monitor-Test-Email-Token');
        if ($testTokenHeader) {
            $testToken = $this->normalizeHeaderValue($testTokenHeader);
            $this->setHeader($message, 'X-Form-Monitor-Test-Email-Token', $testToken);
        }
    }

    private function normalizeHeaderValue($value): string
    {
        if (\is_array($value)) {
            return (string) reset($value);
        }

        return (string) $value;
    }

    private function setHeader(Message $message, $header, mixed $value): void
    {
        if (!$value) {
            return;
        }

        if (\is_array($value)) {
            $recipients = [];
            foreach ($value as $email => $name) {
                if (empty($email)) {
                    continue;
                }

                $recipient = $email;
                if (!empty($name)) {
                    $recipient = $name.' <'.$email.'>';
                }

                $recipients[] = $recipient;
            }

            $message->setHeader($header, $recipients);
        } else {
            $value = (string) $value;
            $message->setHeader($header, $value);
        }
    }
}
