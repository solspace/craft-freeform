<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;

class ResendNotificationsAction extends ElementAction
{
    /**
     * @inheritdoc
     */
    public function getTriggerLabel(): string
    {
        return Freeform::t('Resend Notifications');
    }

    /**
     * @inheritdoc
     */
    public function performAction(ElementQueryInterface $query): bool
    {
        $integrations = Freeform::getInstance()->integrations;
        foreach ($query->all() as $submission) {
            /** @var Submission $submission */
            $integrations->sendOutEmailNotifications($submission);
        }

        $this->setMessage('Notifications sent successfully');

        return true;
    }
}
