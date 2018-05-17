<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\records\Element;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Database\SpamSubmissionHandlerInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;

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
    public function whitelistSpamSubmission(SpamSubmission $submission)
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
     * Processes spam submission so it could be processed normally in case of whitelisting
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
            $date = new \DateTime("-$age days");

            $ids = (new Query())
                ->select(['id'])
                ->from(Submission::TABLE)
                ->where(['<', 'dateCreated', $date->format('Y-m-d H:i:s')])
                ->andWhere(['isSpam' => true])
                ->column();

            \Craft::$app->db
                ->createCommand()
                ->delete(
                    Element::tableName(),
                    ['id' => $ids]
                )
                ->execute();

            \Craft::$app->cache->set(static::PURGE_CACHE_KEY, true, static::PURGE_CACHE_TTL);
        }
    }
}
