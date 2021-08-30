<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl\Checks;

use Solspace\Commons\Helpers\ComparisonHelper;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\SpamReason;

class BlacklistedEmails extends AbstractCheck
{
    public function handleCheck(ValidationEvent $event)
    {
        $showErrorBelowFields = $this->getSettings()->showErrorsForBlockedEmails;
        $emails = $this->getSettings()->getBlockedEmails();
        $emailsMessage = $this->getSettings()->blockedEmailsError;

        if (!$emails) {
            return;
        }

        $form = $event->getForm();
        foreach ($form->getLayout()->getPages() as $page) {
            foreach ($page->getFields() as $field) {
                if ($field instanceof EmailField) {
                    foreach ($field->getValue() as $value) {
                        foreach ($emails as $email) {
                            if (ComparisonHelper::stringContainsWildcardKeyword($email, $value)) {
                                $event->getForm()->markAsSpam(
                                    SpamReason::TYPE_BLOCKED_EMAIL_ADDRESS,
                                    sprintf(
                                        'Email field "%s" contains a blocked email address "%s"',
                                        $field->getHandle(),
                                        $email
                                    )
                                );

                                if ($this->isDisplayErrors()) {
                                    $form->addError(Freeform::t('Form contains a blocked email'));
                                }

                                if ($showErrorBelowFields) {
                                    $field->addError(Freeform::t($emailsMessage, ['email' => $value]));
                                }

                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}
