<?php

namespace Solspace\Freeform\Elements\Actions\Pro;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use craft\web\View;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;

class ResendNotificationsAction extends ElementAction
{
    /**
     * {@inheritdoc}
     */
    public function getTriggerLabel(): string
    {
        return Freeform::t('Resend Notifications');
    }

    /**
     * {@inheritdoc}
     */
    public function performAction(ElementQueryInterface $query): bool
    {
        $templateMode = \Craft::$app->view->getTemplateMode();
        \Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_SITE);

        $integrations = Freeform::getInstance()->integrations;
        foreach ($query->all() as $submission) {
            // @var Submission $submission
            $integrations->sendOutEmailNotifications($submission);
        }

        $this->setMessage('Notifications sent successfully');

        \Craft::$app->view->setTemplateMode($templateMode);

        return true;
    }
}
