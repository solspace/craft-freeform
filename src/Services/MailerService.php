<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\mail\Message;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Mailer\SendEmailEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Logging\CraftLogger;
use Solspace\Freeform\Library\Mailing\MailHandlerInterface;
use Solspace\Freeform\Library\Mailing\NotificationInterface;
use yii\base\Component;

class MailerService extends Component implements MailHandlerInterface
{
    const EVENT_BEFORE_SEND = 'beforeSend';
    const EVENT_AFTER_SEND  = 'afterSend';

    const LOG_CATEGORY = 'freeform_notifications';

    /**
     * Send out an email to recipients using the given mail template
     *
     * @param Form             $form
     * @param array|string     $recipients
     * @param mixed            $notificationId
     * @param FieldInterface[] $fields
     * @param Submission       $submission
     *
     * @return int - number of successfully sent emails
     * @throws FreeformException
     */
    public function sendEmail(
        Form $form,
        $recipients,
        $notificationId,
        array $fields,
        Submission $submission = null
    ): int
    {
        $logger        = new CraftLogger();
        $sentMailCount = 0;
        $notification  = $this->getNotificationById($notificationId);

        if (!is_array($recipients)) {
            $recipients = $recipients ? array($recipients) : array();
        }

        if (!$notification) {
            throw new FreeformException(
                Freeform::t(
                    'Email notification template with ID {id} not found',
                    ['id' => $notificationId]
                )
            );
        }

        $fieldValues = $this->getFieldValues($fields, $form, $submission);

        $view = \Craft::$app->view;

        foreach ($recipients as $recipientName => $emailAddress) {
            $fromName  = $view->renderString($notification->getFromName(), $fieldValues);
            $fromEmail = $view->renderString($notification->getFromEmail(), $fieldValues);

            $email = new Message();

            try {
                $email->variables = $fieldValues;
                $email
                    ->setTo([$emailAddress => $recipientName])
                    ->setFrom([$fromEmail => $fromName])
                    ->setSubject($view->renderString($notification->getSubject(), $fieldValues))
                    ->setHtmlBody($view->renderString($notification->getBodyHtml(), $fieldValues))
                    ->setTextBody($view->renderString($notification->getBodyText(), $fieldValues));


                if ($notification->getReplyToEmail()) {
                    $email->setReplyTo($view->renderString($notification->getReplyToEmail(), $fieldValues));
                }
            } catch (\Exception $e) {
                $message = $e->getMessage();
                $message = 'Email notification [' . $notification->getHandle() . ']: ' . $message;

                $logger->log(CraftLogger::LEVEL_ERROR, $message, self::LOG_CATEGORY);
                continue;
            }

            if ($notification->isIncludeAttachmentsEnabled()) {
                foreach ($fields as $field) {
                    if (!$field->getHandle()) {
                        continue;
                    }
                    $fieldValue = $submission->{$field->getHandle()}->getValue();
                    if ($field instanceof FileUploadInterface && $fieldValue) {
                        $assetIds = $fieldValue;
                        foreach ($assetIds as $assetId) {
                            $asset = \Craft::$app->assets->getAssetById((int) $assetId);
                            if ($asset) {
                                $email->attach($asset->getTransformSource());
                            }
                        }
                    }
                }
            }

            try {
                $sendEmailEvent = new SendEmailEvent($email, $form, $notification, $fieldValues, $submission);
                $this->trigger(self::EVENT_BEFORE_SEND, $sendEmailEvent);

                if (!$sendEmailEvent->isValid) {
                    continue;
                }

                $emailSent = \Craft::$app->mailer->send($email);

                $this->trigger(self::EVENT_AFTER_SEND, $sendEmailEvent);

                if ($emailSent) {
                    $sentMailCount++;
                }
            } catch (\Exception $e) {
                $message = $e->getMessage();
                $message = 'Email notification [' . $notification->getHandle() . ']: ' . $message;

                $logger->log(CraftLogger::LEVEL_ERROR, $message, self::LOG_CATEGORY);
            }
        }

        return $sentMailCount;
    }

    /**
     * @param int $id
     *
     * @return NotificationInterface
     */
    public function getNotificationById($id): NotificationInterface
    {
        return Freeform::getInstance()->notifications->getNotificationById($id);
    }

    /**
     * @param FieldInterface[] $fields
     * @param Form             $form
     * @param Submission       $submission
     *
     * @return array
     */
    private function getFieldValues(array $fields, Form $form, Submission $submission = null): array
    {
        $postedValues = [];
        $usableFields = [];
        foreach ($fields as $field) {
            if ($field instanceof NoStorageInterface || $field instanceof FileUploadInterface) {
                continue;
            }

            $field->setValue($submission->{$field->getHandle()}->getValue());
            $usableFields[]                    = $field;
            $postedValues[$field->getHandle()] = $field->getValueAsString();
        }

        $postedValues['allFields']   = $usableFields;
        $postedValues['form']        = $form;
        $postedValues['submission']  = $submission;
        $postedValues['dateCreated'] = new \DateTime();
        $postedValues['token']       = $submission ? $submission->token : null;

        return $postedValues;
    }
}
