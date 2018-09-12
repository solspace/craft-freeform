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
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\DeleteEvent;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\StaticValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use Solspace\Freeform\Records\UnfinalizedFileRecord;
use yii\base\Component;

class SubmissionsService extends Component implements SubmissionHandlerInterface
{
    const EVENT_BEFORE_SUBMIT = 'beforeSubmit';
    const EVENT_AFTER_SUBMIT  = 'afterSubmit';
    const EVENT_BEFORE_DELETE = 'beforeDelete';
    const EVENT_AFTER_DELETE  = 'afterDelete';

    const MIN_PURGE_AGE   = 7;
    const PURGE_CACHE_KEY = 'freeform_purge_cache_key';
    const PURGE_CACHE_TTL = 3600; // 1 hour

    /** @var Submission[] */
    private static $submissionCache = [];

    /**
     * @param int $id
     *
     * @return Submission|null
     */
    public function getSubmissionById($id)
    {
        if (null === self::$submissionCache || !isset(self::$submissionCache[$id])) {
            if (null === self::$submissionCache) {
                self::$submissionCache = [];
            }

            self::$submissionCache[$id] = Submission::find()->id($id)->one();
        }

        return self::$submissionCache[$id];
    }

    /**
     * @param array|null $formIds
     * @param array|null $statusIds
     * @param bool       $isSpam
     *
     * @return int
     */
    public function getSubmissionCount(array $formIds = null, array $statusIds = null, bool $isSpam = false): int
    {
        return (int) (new Query())
            ->select(['COUNT(id)'])
            ->from(Submission::TABLE)
            ->filterWhere(
                [
                    'formId'   => $formIds,
                    'statusId' => $statusIds,
                    'isSpam'   => $isSpam,
                ]
            )
            ->scalar();
    }

    /**
     * Returns submission count by form ID
     *
     * @param bool $isSpam
     *
     * @return array
     */
    public function getSubmissionCountByForm(bool $isSpam = false): array
    {
        $countList = (new Query())
            ->select(['[[formId]]', 'COUNT([[id]]) as [[submissionCount]]'])
            ->from(Submission::TABLE)
            ->filterWhere(['isSpam' => $isSpam])
            ->groupBy('[[formId]]')
            ->all();

        $submissionCountByForm = [];
        foreach ($countList as $data) {
            $submissionCountByForm[$data['formId']] = (int) $data['submissionCount'];
        }

        return $submissionCountByForm;
    }

    /**
     * Stores the submitted fields to database
     *
     * @param Form $form
     *
     * @return Submission|null
     */
    public function storeSubmission(Form $form)
    {
        $submission = $this->createSubmissionFromForm($form);

        $beforeSubmitEvent = new SubmitEvent($submission, $form);
        $this->trigger(self::EVENT_BEFORE_SUBMIT, $beforeSubmitEvent);

        if ($beforeSubmitEvent->isValid && \Craft::$app->getElements()->saveElement($submission)) {
            $this->finalizeFormFiles($form);
            $this->trigger(self::EVENT_AFTER_SUBMIT, new SubmitEvent($submission, $form));

            return $submission;
        }

        return null;
    }

    /**
     * @inheritdoc
     */
    public function createSubmissionFromForm(Form $form)
    {
        $fields        = $form->getLayout()->getFields();
        $savableFields = [];
        foreach ($fields as $field) {
            if ($field instanceof NoStorageInterface) {
                continue;
            }

            $value = $field->getValue();

            // Since the value is obfuscated, we have to get the real value
            if ($field instanceof ObscureValueInterface) {
                $value = $field->getActualValue($value);
            } else if ($field instanceof StaticValueInterface) {
                if (!empty($value)) {
                    $value = $field->getStaticValue();
                }
            }

            $savableFields[$field->getHandle()]     = $value;
            $titleReplacements[$field->getHandle()] = $value;
        }

        $dateCreated = new \DateTime();

        $titleReplacements['dateCreated'] = $dateCreated->format('Y-m-d H:i:s');
        $fieldsByHandle                   = $form->getLayout()->getFieldsByHandle();


        if (!$form->isMarkedAsSpam()) {
            $submission = Submission::create();
        } else {
            $submission = SpamSubmission::create();
        }

        $submission->ip          = $form->isIpCollectingEnabled() ? \Craft::$app->request->getRemoteIP() : null;
        $submission->formId      = $form->getId();
        $submission->statusId    = $form->getDefaultStatus();
        $submission->isSpam      = $form->isMarkedAsSpam();
        $submission->dateCreated = $dateCreated;
        $submission->dateUpdated = $dateCreated;
        $submission->title       = \Craft::$app->view->renderString(
            $form->getSubmissionTitleFormat(),
            array_merge(
                $fieldsByHandle,
                [
                    'dateCreated' => $dateCreated,
                    'form'        => $form,
                ]
            )
        );

        $submission->setFormFieldValues($savableFields);

        return $submission;
    }

    /**
     * Runs all integrations on submission
     *
     * @param Submission      $submission
     * @param AbstractField[] $mailingListOptedInFields
     */
    public function postProcessSubmission(Submission $submission, array $mailingListOptedInFields)
    {
        $freeform = Freeform::getInstance();

        $integrationsService = $freeform->integrations;
        $connectionsService  = $freeform->connections;
        $formsService        = $freeform->forms;

        $form = $submission->getForm();

        $this->markFormAsSubmitted($form);
        
        $connectionsService->connect($form);
        $integrationsService->processPayments($submission);
        $integrationsService->sendOutEmailNotifications($submission);

        if ($form->hasOptInPermission()) {
            $integrationsService->pushToMailingLists($submission, $mailingListOptedInFields);
            $integrationsService->pushToCRM($submission);
        }



        $formsService->onAfterSubmit($form, $submission);
    }

    /**
     * Finalize all files uploaded in this form, so that they don' get deleted
     *
     * @param Form $form
     */
    public function finalizeFormFiles(Form $form)
    {
        $assetIds = [];

        foreach ($form->getLayout()->getFileUploadFields() as $field) {
            $assetIds = array_merge($assetIds, $field->getValue());
        }

        if (empty($assetIds)) {
            return;
        }

        $records = UnfinalizedFileRecord::findAll(['assetId' => $assetIds]);

        foreach ($records as $record) {
            $record->delete();
        }
    }

    /**
     * @param Submission[] $submissions
     *
     * @return bool
     * @throws \Exception
     */
    public function delete(array $submissions): bool
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE);

        if (!$submissions) {
            return false;
        }

        $transaction = \Craft::$app->getDb()->beginTransaction();

        try {
            foreach ($submissions as $submission) {
                $deleteEvent = new DeleteEvent($submission);
                $this->trigger(self::EVENT_BEFORE_DELETE, $deleteEvent);

                if ($deleteEvent->isValid) {
                    \Craft::$app->elements->deleteElementById($submission->id);

                    $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($submission));
                }
            }

            if ($transaction !== null) {
                $transaction->commit();
            }
        } catch (\Exception $e) {
            if ($transaction !== null) {
                $transaction->rollBack();
            }

            throw $e;
        }

        return true;
    }

    /**
     * @param int $oldStatusId
     * @param int $newStatusId
     */
    public function swapStatuses($oldStatusId, $newStatusId)
    {
        $oldStatusId = (int) $oldStatusId;
        $newStatusId = (int) $newStatusId;

        \Craft::$app
            ->db
            ->createCommand()
            ->update(
                Submission::TABLE,
                ['statusId' => $newStatusId],
                'statusId = :oldStatusId',
                [
                    'oldStatusId' => $oldStatusId,
                ]
            );
    }

    /**
     * Gets all submission data by their ID's
     * And returns it as an associative array
     *
     * @param array $submissionIds
     *
     * @return array
     */
    public function getAsArray(array $submissionIds): array
    {
        return (new Query())
            ->select('*')
            ->from(Submission::TABLE)
            ->where(['in', 'id', $submissionIds])
            ->all();
    }

    /**
     * Add a session flash variable that the form has been submitted
     *
     * @param Form $form
     */
    public function markFormAsSubmitted(Form $form)
    {
        \Craft::$app->session->setFlash(Form::SUBMISSION_FLASH_KEY . $form->getId());
    }

    /**
     * Check for a session flash variable for form submissions
     *
     * @param Form $form
     *
     * @return bool
     */
    public function wasFormFlashSubmitted(Form $form): bool
    {
        return (bool) \Craft::$app->session->getFlash(Form::SUBMISSION_FLASH_KEY . $form->getId(), false);
    }

    /**
     * Either returns an array of allowed form ID's
     * for which the user can edit submissions
     * or NULL if *all* form submissions can be edited
     *
     * @return array|null
     */
    public function getAllowedSubmissionFormIds()
    {
        if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)) {
            return null;
        }

        $formIds = PermissionHelper::getNestedPermissionIds(Freeform::PERMISSION_SUBMISSIONS_MANAGE);

        return $formIds;
    }

    /**
     * Removes all old submissions according to the submission age set in settings
     */
    public function purgeSubmissions()
    {
        $hasBeenPurgedRecently = \Craft::$app->cache->get(static::PURGE_CACHE_KEY);
        if ($hasBeenPurgedRecently) {
            return;
        }

        $age = Freeform::getInstance()->settings->getPurgableSubmissionAgeInDays();
        if (\is_int($age) && $age >= static::MIN_PURGE_AGE) {
            $date = new \DateTime("-$age days");

            $ids = (new Query())
                ->select(['id'])
                ->from(Submission::TABLE)
                ->where(['<', 'dateCreated', $date->format('Y-m-d H:i:s')])
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

    /**
     * Checks if the default set status is valid
     * If it isn't - gets the first one and sets that
     *
     * @param Submission $submission
     */
    private function validateAndUpdateStatus(Submission $submission)
    {
        $statusService = Freeform::getInstance()->statuses;
        $statusIds     = $statusService->getAllStatusIds();

        if (!\in_array($submission->statusId, $statusIds, false)) {
            $submission->statusId = reset($statusIds);
        }
    }
}
