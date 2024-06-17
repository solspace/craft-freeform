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
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\Components\Recipients\Recipient;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;

class SendDynamicTemplateRecipientsNotificationsJob extends BaseJob implements NotificationJobInterface
{
    public const BAG_KEY = 'dynamicNotification';
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

        $data = $form->getProperties()->get(self::BAG_KEY);

        $template = $data['template'] ?? null;
        $recipients = $data['recipients'] ?? [];

        if (empty($recipients) || !$template) {
            return;
        }

        $notification = $freeform->notifications->requireNotification($form, $template, 'Dynamic Notification from template params');
        if (!$notification) {
            return;
        }

        $recipientCollection = new RecipientCollection();

        if (\is_array($recipients)) {
            foreach ($recipients as $recipient) {
                $recipientCollection->add(new Recipient($recipient, ''));
            }
        } else {
            $recipientCollection->add(new Recipient($recipients, ''));
        }

        $notificationTemplate = NotificationTemplate::fromRecord($notification);

        $freeform->mailer->sendEmail(
            $form,
            $recipientCollection,
            $fields,
            $notificationTemplate,
            $submission
        );
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Dynamic Template Recipients Notifications');
    }
}
