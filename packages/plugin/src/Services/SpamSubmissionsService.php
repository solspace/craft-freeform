<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\records\Element;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Database\SpamSubmissionHandlerInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Records\SpamReasonRecord;

class SpamSubmissionsService extends SubmissionsService implements SpamSubmissionHandlerInterface
{
    /**
     * {@inheritdoc}
     */
    public function getSubmissionById($id)
    {
        return SpamSubmission::find()->id($id)->one();
    }

    /**
     * Takes spam submission, converts it to non-spam submission and runs all necessary processes
     * for non-spam submission.
     *
     * @return bool
     */
    public function allowSpamSubmission(SpamSubmission $submission)
    {
        $submission->isSpam = false;
        \Craft::$app->getElements()->saveElement($submission);

        //HACK: this is dirty, but I wasn't able to find better way to
        //      quickly convert SpamSubmission to Submission
        $element = Element::findOne($submission->id);
        $element->type = Submission::class;
        $element->save(false);

        $layout = $submission->getForm()->getLayout();
        $integrationsQueue = Freeform::getInstance()->integrationsQueue;
        $tasks = $integrationsQueue->getTasksBySubmissionId($submission->id);
        $fields = [];
        foreach ($tasks as $task) {
            $fields[] = $layout->getFieldByHash($task->fieldHash);
        }

        Freeform::getInstance()->submissions->postProcessSubmission($submission, $fields);

        $integrationsQueue->deleteTasksBySubmissionId($submission->id);

        return true;
    }

    /**
     * Processes spam submission so it could be processed normally in case of allowing.
     *
     * @param AbstractField[] $mailingListOptedInFields
     */
    public function postProcessSubmission(Submission $submission, array $mailingListOptedInFields)
    {
        if (!$submission instanceof SpamSubmission || !$submission->id) {
            throw new FreeformException('Invalid $submission, can process only stored SpamSubmission instances.');
        }

        Freeform::getInstance()->integrationsQueue->enqueueIntegrations($submission, $mailingListOptedInFields);
    }

    public function persistSpamReasons(SubmitEvent $event)
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        if (!$submission->isSpam || !$form->isMarkedAsSpam()) {
            return;
        }

        $spamReasons = $form->getSpamReasons();
        foreach ($spamReasons as $reason) {
            $record = new SpamReasonRecord();
            $record->submissionId = $submission->getId();
            $record->reasonType = $reason->getType();
            $record->reasonMessage = $reason->getMessage();
            $record->save();
        }
    }

    protected function findSubmissions(): Query
    {
        return (new Query())
            ->from(SpamSubmission::TABLE)
            ->where(['isSpam' => true])
        ;
    }
}
