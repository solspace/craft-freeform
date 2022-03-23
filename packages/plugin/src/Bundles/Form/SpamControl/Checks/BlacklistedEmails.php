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
        $showErrorBelowFields = (bool) $this->getSettings()->showErrorsForBlockedEmails;
        $emails = $this->getSettings()->getBlockedEmails();
        $emailsMessage = $this->getSettings()->blockedEmailsError;

        if (!$emails) {
            return;
        }

        $form = $event->getForm();
        $emailFields = $form->getLayout()->getFields(EmailField::class);

        foreach ($emailFields as $field) {
            $value = $field->getValue();

            foreach ($emails as $email) {
                if (ComparisonHelper::stringContainsWildcardKeyword($email, $value)) {
                    if ($showErrorBelowFields) {
                        $field->addError(Freeform::t($emailsMessage, ['email' => $value]));
                    }

                    if ($this->isDisplayErrors()) {
                        $form->addError(Freeform::t('Form contains a blocked email'));
                    } else {
                        $event->getForm()->markAsSpam(
                            SpamReason::TYPE_BLOCKED_EMAIL_ADDRESS,
                            sprintf(
                                'Email field "%s" contains a blocked email address "%s"',
                                $field->getHandle(),
                                $email
                            )
                        );
                    }

                    break;
                }
            }
        }
    }
}
