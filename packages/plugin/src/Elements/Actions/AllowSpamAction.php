<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use Solspace\Freeform\Freeform;

class AllowSpamAction extends ElementAction
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
        return Freeform::t('Allow selected…');
    }

    /**
     * {@inheritdoc}
     */
    public static function isDestructive(): bool
    {
        return false;
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
        $submissions = $query->all();
        foreach ($submissions as $submission) {
            Freeform::getInstance()->spamSubmissions->allowSpamSubmission($submission);
        }

        $this->setMessage($this->successMessage);

        return true;
    }
}
