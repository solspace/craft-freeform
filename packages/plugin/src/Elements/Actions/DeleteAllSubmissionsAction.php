<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use Solspace\Freeform\Freeform;

class DeleteAllSubmissionsAction extends ElementAction
{
    /** @var string */
    public $confirmationMessage;

    /** @var string */
    public $successMessage;

    /**
     * {@inheritdoc}
     */
    public function getTriggerLabel(): string
    {
        return Freeform::t('Delete All…');
    }

    /**
     * {@inheritdoc}
     */
    public static function isDestructive(): bool
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function getConfirmationMessage()
    {
        return $this->confirmationMessage;
    }

    /**
     * Performs the action on any elements that match the given criteria.
     */
    public function performAction(ElementQueryInterface $query): bool
    {
        $query->id(null);

        Freeform::getInstance()->submissions->delete($query->all());

        $this->setMessage($this->successMessage);

        return true;
    }
}
