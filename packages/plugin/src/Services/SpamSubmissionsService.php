<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
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
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Database\SpamSubmissionHandlerInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;

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

        // HACK: this is dirty, but I wasn't able to find better way to
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

        foreach ($submission->getForm()->getLayout()->getFields() as $field) {
            $handle = $field->getHandle();
            if (!$handle || $field instanceof NoStorageInterface) {
                continue;
            }

            try {
                $field->setValue($submission->{$field->getHandle()}->getValue());
            } catch (\Exception $exception) {
            }
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

    protected function findSubmissions(): Query
    {
        return (new Query())
            ->from(SpamSubmission::TABLE)
            ->where(['isSpam' => true])
        ;
    }
}
