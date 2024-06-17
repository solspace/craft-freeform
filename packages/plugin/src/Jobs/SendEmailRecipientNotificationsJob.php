<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Notifications\Components\Recipients\Recipient;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField;

class SendEmailRecipientNotificationsJob extends BaseJob implements NotificationJobInterface
{
    public ?int $submissionId = null;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $submission = $freeform->submissions->getSubmissionById($this->submissionId);
        if (!$submission) {
            return;
        }

        $form = $submission->getForm();
        $fields = $submission->getFieldCollection();

        $notificationsProvider = \Craft::$container->get(NotificationsProvider::class);
        $notifications = $notificationsProvider->getByFormAndClass($form, EmailField::class);

        foreach ($notifications as $notification) {
            $field = $fields->get($notification->getField());
            if (!$field) {
                continue;
            }

            $recipient = $field->getValue();
            if (!$recipient) {
                continue;
            }

            $notificationTemplate = $notification->getTemplate();
            if (!$notificationTemplate) {
                continue;
            }

            $recipientCollection = new RecipientCollection();
            $recipientCollection->add(new Recipient($recipient));

            $freeform->mailer->sendEmail(
                $form,
                $recipientCollection,
                $fields,
                $notificationTemplate,
                $submission
            );
        }
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Email Recipient Notifications');
    }
}
