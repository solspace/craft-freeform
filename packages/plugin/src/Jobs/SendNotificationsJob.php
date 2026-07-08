<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Jobs;

use craft\helpers\StringHelper;
use craft\queue\BaseJob;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\ProcessPostedValuesEvent;
use Solspace\Freeform\Events\Notifications\PrepareSendNotificationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\NotificationInterface;
use yii\base\Event;

class SendNotificationsJob extends BaseJob implements NotificationJobInterface
{
    public const EVENT_PREPARE_NOTIFICATION_JOB = 'prepare-send-notification';

    public ?int $formId = null;
    public ?int $submissionId = null;
    public array $postedData = [];
    public ?RecipientCollection $recipients = null;
    public ?NotificationTemplate $template = null;
    public ?int $siteId = null;
    public array $headers = [];
    public ?string $notificationType;
    public ?int $notificationId = null;
    public ?string $submissionIp = null;

    public function __construct($config = [])
    {
        parent::__construct($config);

        Event::trigger(
            $this,
            self::EVENT_PREPARE_NOTIFICATION_JOB,
            new PrepareSendNotificationEvent($this)
        );

        if (!$this->siteId) {
            $this->siteId = \Craft::$app->getSites()->getCurrentSite()->id;
        }
    }

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();
        $notificationProvider = \Craft::$container->get(NotificationsProvider::class);

        $sites = \Craft::$app->getSites();
        $originalSiteId = $sites->getCurrentSite()->id;

        try {
            $sites->setCurrentSite($this->siteId);

            // Set the application language to the site's primary language
            \Craft::$app->language = $sites->getCurrentSite()->language;

            // We need to pass in the site so when the form loads, we set the translated field labels for that forms site context.
            $form = $freeform->forms->getFormById($this->formId, $sites->getCurrentSite()->handle);
            if (!$form) {
                return;
            }

            $notification = $this->notificationId
                ? $notificationProvider->getByFormAndId($form, $this->notificationId)
                : null;
            $logger = $this->getLogger($notification, $form);

            if (!$this->recipients) {
                $logger->warning('No recipients found for the notification', ['form' => $form->getHandle()]);

                return;
            }

            if (!$this->template) {
                $logger->warning('No template found for the notification', ['form' => $form->getHandle()]);

                return;
            }

            if ($this->submissionId) {
                $submission = Submission::find()
                    ->id($this->submissionId)
                    ->siteId($this->siteId)
                    ->isHidden(null)
                    ->one()
                ;
            } else {
                $submission = $this->createTmpSubmission($form);
            }

            if (!$submission) {
                $logger->warning('Stored submission could not be loaded for the notification job; using posted data instead.', [
                    'form' => $form->getHandle(),
                    'submissionId' => $this->submissionId,
                    'siteId' => $this->siteId,
                ]);

                $submission = $this->createTmpSubmission($form);
            }

            if ($submission && $submission->isSpam) {
                return;
            }

            $event = new ProcessPostedValuesEvent($form, $submission, $this->postedData);
            Event::trigger(FormJobInterface::class, FormJobInterface::EVENT_PROCESS_POSTED_DATA, $event);

            $form->valuesFromSubmission($event->getSubmission());

            $freeform->mailer->sendEmail(
                $form,
                $this->recipients,
                $this->template,
                $submission,
                $this->headers,
                $logger,
                $notification,
            );
        } finally {
            // Stop leaking the notification site into the next job
            $sites->setCurrentSite($originalSiteId);

            \Craft::$app->language = $sites->getCurrentSite()->language;
        }
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Notifications');
    }

    private function getLogger(?NotificationInterface $notification, Form $form): LoggerInterface
    {
        $loggerProvider = \Craft::$container->get(NotificationLoggerProvider::class);

        return $loggerProvider->getLogger($notification, $form);
    }

    private function createTmpSubmission(Form $form): Submission
    {
        $submission = Submission::create($form);
        $submission->setFormFieldValues($this->postedData);

        $submission->id = 0;
        $submission->incrementalId = 0;
        $submission->uid = StringHelper::UUID();
        $submission->siteId = $this->siteId;
        $submission->ip = $this->submissionIp;
        $submission->statusId = $form->getSettings()->getGeneral()->defaultStatus;
        $submission->dateCreated = new \DateTime();
        $submission->title = Submission::generateTitle($submission, $form);

        $form->setSubmission($submission);

        return $submission;
    }
}
