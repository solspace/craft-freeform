<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\actions\DeleteActionInterface;
use craft\elements\db\ElementQueryInterface;
use Solspace\Freeform\Freeform;

class DeleteSubmissionAction extends ElementAction implements DeleteActionInterface
{
    public ?string $confirmationMessage = null;

    public ?string $successMessage = null;

    public bool $hard = false;

    public static function isDestructive(): bool
    {
        return true;
    }

    public function canHardDelete(): bool
    {
        return true;
    }

    public function setHardDelete(): void
    {
        $this->hard = true;
    }

    public function getTriggerLabel(): string
    {
        if ($this->hard) {
            return Freeform::t('Delete selected permanently');
        }

        return Freeform::t('Delete selected...');
    }

    public function getConfirmationMessage(): string
    {
        return $this->confirmationMessage;
    }

    public function performAction(ElementQueryInterface $query): bool
    {
        $service = Freeform::getInstance()->submissions;
        $success = $this->hard ? $service->delete($query, false, true) : $service->deleteWithUndo($query);

        $this->setMessage($this->successMessage);

        return $success;
    }
}
