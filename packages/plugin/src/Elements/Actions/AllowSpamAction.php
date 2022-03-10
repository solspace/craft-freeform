<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use Solspace\Freeform\Freeform;

class AllowSpamAction extends ElementAction
{
    public string $confirmationMessage;

    public string $successMessage;

    public function getTriggerLabel(): string
    {
        return Freeform::t('Allow selected…');
    }

    public static function isDestructive(): bool
    {
        return false;
    }

    public function getConfirmationMessage(): string
    {
        return $this->confirmationMessage;
    }

    public function performAction(ElementQueryInterface $query): bool
    {
        $submissions = $query->all();
        foreach ($submissions as $submission) {
            Freeform::getInstance()->spamSubmissions->allowSpamSubmission($submission);
        }

        $this->setMessage($this->successMessage);

        return true;
    }
}
