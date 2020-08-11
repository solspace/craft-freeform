<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\records\Asset as AssetRecord;
use craft\records\Element;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Database\SpamSubmissionHandlerInterface;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Records\FieldRecord;
use Solspace\Freeform\Records\SpamReasonRecord;

class SpamSubmissionsService extends SubmissionsService implements SpamSubmissionHandlerInterface
{
    const MIN_PURGE_AGE   = 3;
    const PURGE_CACHE_KEY = 'freeform_purge_spam_cache_key';

    /**
     * @inheritdoc
     */
    public function getSubmissionById($id)
    {
        return SpamSubmission::find()->id($id)->one();
    }

    /**
     * Takes spam submission, converts it to non-spam submission and runs all necessary processes
     * for non-spam submission.
     *
     * @param SpamSubmission $submission
     *
     * @return bool
     */
    public function allowSpamSubmission(SpamSubmission $submission)
    {
        $submission->isSpam = false;
        \Craft::$app->getElements()->saveElement($submission);

        //HACK: this is dirty, but I wasn't able to find better way to
        //      quickly convert SpamSubmission to Submission
        $element       = Element::findOne($submission->id);
        $element->type = Submission::class;
        $element->save(false);

        $layout            = $submission->getForm()->getLayout();
        $integrationsQueue = Freeform::getInstance()->integrationsQueue;
        $tasks             = $integrationsQueue->getTasksBySubmissionId($submission->id);
        $fields            = [];
        foreach ($tasks as $task) {
            $fields[] = $layout->getFieldByHash($task->fieldHash);
        }

        Freeform::getInstance()->submissions->postProcessSubmission($submission, $fields);

        $integrationsQueue->deleteTasksBySubmissionId($submission->id);

        return true;
    }

    /**
     * Processes spam submission so it could be processed normally in case of allowing
     *
     * @param Submission      $submission
     * @param AbstractField[] $mailingListOptedInFields
     */
    public function postProcessSubmission(Submission $submission, array $mailingListOptedInFields)
    {
        if (!$submission instanceof SpamSubmission || !$submission->id) {
            throw new FreeformException('Invalid $submission, can process only stored SpamSubmission instances.');
        }

        Freeform::getInstance()->integrationsQueue->enqueueIntegrations($submission, $mailingListOptedInFields);
    }

    /**
     * Removes all old spam submissions according to the spam age set in settings
     */
    public function purgeSubmissions()
    {
        $hasBeenPurgedRecently = \Craft::$app->cache->get(static::PURGE_CACHE_KEY);
        if ($hasBeenPurgedRecently) {
            return;
        }

        $age = Freeform::getInstance()->settings->getPurgableSpamAgeInDays();
        if (\is_int($age) && $age >= static::MIN_PURGE_AGE) {
            $date          = new \DateTime("-$age days");
            $assetFieldIds = (new Query())
                ->select(['id'])
                ->from(FieldRecord::TABLE)
                ->where(['type' => FieldInterface::TYPE_FILE])
                ->column();

            $columns = ['id'];
            foreach ($assetFieldIds as $assetFieldId) {
                $columns[] = Submission::getFieldColumnName($assetFieldId);
            }

            $results = (new Query())
                ->select($columns)
                ->from(Submission::TABLE)
                ->where(['<', 'dateCreated', $date->format('Y-m-d H:i:s')])
                ->andWhere(['isSpam' => true])
                ->all();

            $ids      = [];
            $assetIds = [];
            foreach ($results as $result) {
                $ids[] = $result['id'];
                unset ($result['id']);

                foreach ($result as $values) {
                    if (!$values) {
                        continue;
                    }

                    $values = \GuzzleHttp\json_decode($values);
                    foreach ($values as $value) {
                        $assetIds[] = $value;
                    }
                }
            }

            \Craft::$app->db
                ->createCommand()
                ->delete(
                    Element::tableName(),
                    ['id' => $ids]
                )
                ->execute();

            foreach ($assetIds as $assetId) {
                if (is_numeric($assetId)) {
                    try {
                        $asset = AssetRecord::find()->where(['id' => $assetId])->one();
                        if ($asset) {
                            $asset->delete();
                        }
                    } catch (\Exception $e) {
                    }
                }
            }
        }

        \Craft::$app->cache->set(static::PURGE_CACHE_KEY, true, static::PURGE_CACHE_TTL);
    }

    /**
     * @param SubmitEvent $event
     */
    public function persistSpamReasons(SubmitEvent $event)
    {
        $form       = $event->getForm();
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
}
