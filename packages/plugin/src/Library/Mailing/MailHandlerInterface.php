<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Mailing;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Form;

interface MailHandlerInterface
{
    /**
     * Send out an email to recipients using the given mail template.
     *
     * @param array|string     $recipients
     * @param int              $notificationId
     * @param FieldInterface[] $fields
     * @param Submission       $submission
     *
     * @return int - number of successfully sent emails
     */
    public function sendEmail(
        Form $form,
        $recipients,
        $notificationId,
        array $fields,
        Submission $submission = null
    ): int;

    /**
     * @param int $id
     *
     * @return null|NotificationInterface
     */
    public function getNotificationById($id);
}
