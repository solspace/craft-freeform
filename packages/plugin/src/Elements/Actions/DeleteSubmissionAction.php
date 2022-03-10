<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use Solspace\Freeform\Freeform;

class DeleteSubmissionAction extends ElementAction
{
    public string $confirmationMessage;

    public string $successMessage;

    public function getTriggerLabel(): string
    {
        return Freeform::t('Delete…');
    }

    public static function isDestructive(): bool
    {
        return true;
    }

    public function getConfirmationMessage(): string
    {
        return $this->confirmationMessage;
    }

    public function performAction(ElementQueryInterface $query): bool
    {
        Freeform::getInstance()->submissions->delete($query->all());

        $this->setMessage($this->successMessage);

        return true;
    }
}
