<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2018, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Mailing;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Form;

interface MailHandlerInterface
{
    /**
     * Send out an email to recipients using the given mail template
     *
     * @param Form             $form
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
     * @return NotificationInterface
     */
    public function getNotificationById($id): NotificationInterface;
}
