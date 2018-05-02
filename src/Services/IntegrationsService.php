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

use craft\base\Component;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\MailingListField;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Models\IntegrationsQueueModel;
use Solspace\Freeform\Records\IntegrationsQueueRecord;

class IntegrationsService extends Component
{
    /**
     * Pushes all emails to their respective mailing lists, if applicable
     * Does nothing otherwise
     *
     * @param Submission $submission
     * @param AbstractField[] $fields
     */
    public function pushToMailingLists(Submission $submission, array $fields)
    {
        $form = $submission->getForm();
        $mailingListHandler = Freeform::getInstance()->mailingLists;

        foreach ($fields as $field) {
            try {
                $emailField = $form->getLayout()->getFieldByHash($field->getEmailFieldHash());

                // TODO: Log any errors that happen
                $integration = $mailingListHandler->getIntegrationObjectById($field->getIntegrationId());
                $mailingList = $mailingListHandler->getListById($integration, $field->getResourceId());

                /** @var FieldObject[] $mailingListFieldsByHandle */
                $mailingListFieldsByHandle = [];
                foreach ($mailingList->getFields() as $mailingListField) {
                    $mailingListFieldsByHandle[$mailingListField->getHandle()] = $mailingListField;
                }

                $emailList = $submission->{$emailField->getHandle()}->getValue();
                if ($emailList) {
                    $mappedValues = [];
                    if ($field->getMapping()) {
                        foreach ($field->getMapping() as $key => $handle) {
                            if (!isset($mailingListFieldsByHandle[$key])) {
                                continue;
                            }

                            $mailingListField = $mailingListFieldsByHandle[$key];

                            $convertedValue = $integration->convertCustomFieldValue(
                                $mailingListField,
                                $submission->{$handle}->getValue()
                            );

                            $mappedValues[$key] = $convertedValue;
                        }
                    }

                    $mailingList->pushEmailsToList($emailList, $mappedValues);
                    $mailingListHandler->flagIntegrationForUpdating($integration);
                }

            } catch (FreeformException $exception) {
                continue;
            }
        }
    }

    /**
     * Send out any email notifications
     *
     * @param Submission $submission
     */
    public function sendOutEmailNotifications(Submission $submission = null)
    {
        $mailer = Freeform::getInstance()->mailer;
        $form = $submission->getForm();
        $fields = $form->getLayout()->getFields();
        $adminNotifications = $form->getAdminNotificationProperties();

        if ($adminNotifications->getNotificationId()) {
            $mailer->sendEmail(
                $form,
                $adminNotifications->getRecipientArray(),
                $adminNotifications->getNotificationId(),
                $fields,
                $submission
            );
        }

        $recipientFields = $form->getLayout()->getRecipientFields();

        foreach ($recipientFields as $field) {
            $mailer->sendEmail(
                $form,
                $submission->{$field->getHandle()}->getValue(),
                $field->getNotificationId(),
                $fields,
                $submission
            );
        }

        $dynamicRecipients = $form->getDynamicNotificationData();
        if ($dynamicRecipients && $dynamicRecipients->getRecipients()) {
            $mailer->sendEmail(
                $form,
                $dynamicRecipients->getRecipients(),
                $dynamicRecipients->getTemplate(),
                $fields,
                $submission
            );
        }
    }

    /**
     * Push the submitted data to the mapped fields of a CRM integration
     *
     * @param Submission $submission
     */
    public function pushToCRM(Submission $submission)
    {
        Freeform::getInstance()->crm->pushObject($submission);
    }
}
