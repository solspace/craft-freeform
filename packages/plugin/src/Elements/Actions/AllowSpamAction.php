<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Freeform;

class AllowSpamAction extends ElementAction
{
    public string $confirmationMessage;

    public string $successMessage;

    public function getTriggerLabel(): string
    {
        return Freeform::t('Allow selected...');
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
        $undo = Freeform::getInstance()->submissionUndo;
        $undoItems = [];
        $failed = 0;

        try {
            foreach ($submissions as $submission) {
                if (!$submission instanceof SpamSubmission || !$submission->isSpam || $submission->isHidden || $submission->trashed || !$submission->getIsEditable()) {
                    ++$failed;

                    continue;
                }
                if (Freeform::getInstance()->spamSubmissions->allowSpamSubmission($submission)) {
                    $undoItems[] = $undo->snapshot($submission, 'approve');
                } else {
                    ++$failed;
                }
            }
        } finally {
            $undo->recordBatch($undoItems);
        }

        $this->setMessage($failed ? Freeform::t('Some spam submissions could not be approved.') : $this->successMessage);

        return (bool) $undoItems;
    }
}
