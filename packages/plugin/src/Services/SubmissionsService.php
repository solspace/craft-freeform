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

use Carbon\Carbon;
use craft\db\Query;
use craft\db\Table;
use craft\records\Asset as AssetRecord;
use craft\records\Element;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\DeleteEvent;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\StaticValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use Solspace\Freeform\Records\FieldRecord;
use Solspace\Freeform\Records\UnfinalizedFileRecord;

class SubmissionsService extends BaseService implements SubmissionHandlerInterface
{
    const EVENT_BEFORE_SUBMIT = 'beforeSubmit';
    const EVENT_AFTER_SUBMIT = 'afterSubmit';
    const EVENT_BEFORE_DELETE = 'beforeDelete';
    const EVENT_AFTER_DELETE = 'afterDelete';
    const EVENT_POST_PROCESS = 'postProcess';

    /** @var Submission[] */
    private static $submissionCache = [];
    private static $submissionTokenCache = [];

    /**
     * @param int $id
     *
     * @return null|Submission
     */
    public function getSubmissionById($id)
    {
        if (!isset(self::$submissionCache[$id])) {
            self::$submissionCache[$id] = Submission::find()->id($id)->one();
        }

        return self::$submissionCache[$id];
    }

    /**
     * @return null|Submission
     */
    public function getSubmissionByToken(string $token)
    {
        if (!isset(self::$submissionTokenCache[$token])) {
            self::$submissionTokenCache[$token] = Submission::find()->where(['token' => $token])->one();
        }

        return self::$submissionTokenCache[$token];
    }

    /**
     * @param int|string|Submission $identificator
     *
     * @return null|Submission
     */
    public function getSubmission($identificator)
    {
        if ($identificator instanceof Submission) {
            return $identificator;
        }

        if (is_numeric($identificator)) {
            return $this->getSubmissionById($identificator);
        }

        return $this->getSubmissionByToken($identificator);
    }

    public function getSubmissionCount(array $formIds = null, array $statusIds = null, bool $isSpam = false): int
    {
        $submissions = Submission::TABLE;
        $query = (new Query())
            ->select(["COUNT({$submissions}.[[id]])"])
            ->from($submissions)
            ->filterWhere(
                [
                    "{$submissions}.[[formId]]" => $formIds,
                    "{$submissions}.[[statusId]]" => $statusIds,
                    "{$submissions}.[[isSpam]]" => $isSpam,
                ]
            )
        ;

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Table::ELEMENTS;
            $query->innerJoin(
                $elements,
                "{$elements}.[[id]] = {$submissions}.[[id]] AND {$elements}.[[dateDeleted]] IS NULL"
            );
        }

        return (int) $query->scalar();
    }

    /**
     * Returns submission count by form ID.
     */
    public function getSubmissionCountByForm(bool $isSpam = false, Carbon $rangeStart = null, Carbon $rangeEnd = null): array
    {
        $submissions = Submission::TABLE;
        $query = (new Query())
            ->select(["{$submissions}.[[formId]]", "COUNT({$submissions}.[[id]]) as [[submissionCount]]"])
            ->from($submissions)
            ->filterWhere(['isSpam' => $isSpam])
            ->groupBy("{$submissions}.[[formId]]")
        ;

        if ($rangeStart) {
            $query->andWhere(['>=', "{$submissions}.[[dateCreated]]", $rangeStart]);
        }

        if ($rangeEnd) {
            $query->andWhere(['<=', "{$submissions}.[[dateCreated]]", $rangeEnd]);
        }

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Element::tableName();
            $query->innerJoin(
                $elements,
                "{$elements}.[[id]] = {$submissions}.[[id]] AND {$elements}.[[dateDeleted]] IS NULL"
            );
        }

        $countList = $query->all();

        $submissionCountByForm = [];
        foreach ($countList as $data) {
            $submissionCountByForm[$data['formId']] = (int) $data['submissionCount'];
        }

        return $submissionCountByForm;
    }

    /**
     * Stores the submitted fields to database.
     *
     * @return null|Submission
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
     * {@inheritdoc}
     */
    public function createSubmissionFromForm(Form $form)
    {
        $isNew = true;
        $submission = null;
        if (!$form->isMarkedAsSpam()) {
            if ($form->getAssociatedSubmissionToken() && Freeform::getInstance()->isPro()) {
                $submission = $this->getSubmissionByToken($form->getAssociatedSubmissionToken());
                $isNew = false;
            }

            if (null === $submission) {
                $submission = Submission::create();
            }
        } else {
            $submission = SpamSubmission::create();
        }

        $fields = $form->getLayout()->getFields();
        $savableFields = [];
        foreach ($fields as $field) {
            if ($field instanceof NoStorageInterface || !$form->hasFieldBeenSubmitted($field)) {
                continue;
            }

            $value = $field->getValue();

            // Since the value is obfuscated, we have to get the real value
            if ($field instanceof ObscureValueInterface) {
                $value = $field->getActualValue($value);
            } elseif ($field instanceof StaticValueInterface) {
                if (!empty($value)) {
                    $value = $field->getStaticValue();
                }
            } elseif ($field instanceof FileUploadField && !$isNew && empty($field->getValue())) {
                continue;
            }

            $savableFields[$field->getHandle()] = $value;
            $titleReplacements[$field->getHandle()] = $value;
        }

        $dateCreated = new \DateTime();

        $titleReplacements['dateCreated'] = $dateCreated->format('Y-m-d H:i:s');
        $fieldsByHandle = $form->getLayout()->getFieldsByHandle();

        $statusId = $form->getDefaultStatus();
        $customStatus = $form->getOverrideStatus();
        if ($customStatus) {
            $customStatus = \Craft::$app->security->decryptByKey(base64_decode($customStatus));
            if ($customStatus) {
                $statusId = $customStatus;
            }
        }

        if (!is_numeric($statusId)) {
            $status = Freeform::getInstance()->statuses->getStatusByHandle($statusId);
            if ($status) {
                $statusId = $status->id;
            }
        }

        if (!$submission->id) {
            $submission->ip = $form->isIpCollectingEnabled() ? \Craft::$app->request->getUserIP() : null;
            $submission->formId = $form->getId();
            $submission->statusId = $statusId;
            $submission->isSpam = $form->isMarkedAsSpam();
            $submission->dateCreated = $dateCreated;
        } elseif ($customStatus) {
            $submission->statusId = $statusId;
        }

        $submission->title = \Craft::$app->view->renderString(
            $form->getSubmissionTitleFormat(),
            array_merge(
                $fieldsByHandle,
                [
                    'dateCreated' => $dateCreated,
                    'form' => $form,
                ]
            )
        );

        $submission->dateUpdated = $dateCreated;
        $submission->setFormFieldValues($savableFields, $isNew);

        return $submission;
    }

    /**
     * Runs all integrations on submission.
     *
     * @param AbstractField[] $mailingListOptedInFields
     */
    public function postProcessSubmission(Submission $submission, array $mailingListOptedInFields)
    {
        $freeform = Freeform::getInstance();

        $integrationsService = $freeform->integrations;
        $connectionsService = $freeform->connections;
        $formsService = $freeform->forms;

        $form = $submission->getForm();

        $this->markFormAsSubmitted($form);

        if ($integrationsService->processPayments($submission)) {
            $connectionsService->connect($form);
            $integrationsService->sendOutEmailNotifications($submission);

            if ($form->hasOptInPermission()) {
                $integrationsService->pushToMailingLists($submission, $mailingListOptedInFields);
                $integrationsService->pushToCRM($submission);
            }
        }

        $formsService->setPostedCookie($form);
        $formsService->onAfterSubmit($form, $submission);
    }

    /**
     * Finalize all files uploaded in this form, so that they don' get deleted.
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
     * @throws \Exception
     */
    public function delete(array $submissions): bool
    {
        $allowedFormIds = $this->getAllowedSubmissionFormIds();
        if (!$submissions) {
            return false;
        }

        $transaction = \Craft::$app->getDb()->beginTransaction();

        try {
            foreach ($submissions as $submission) {
                if (null !== $allowedFormIds && !\in_array($submission->formId, $allowedFormIds, false)) {
                    continue;
                }

                $deleteEvent = new DeleteEvent($submission);
                $this->trigger(self::EVENT_BEFORE_DELETE, $deleteEvent);

                if ($deleteEvent->isValid) {
                    \Craft::$app->elements->deleteElementById($submission->id);

                    $this->trigger(self::EVENT_AFTER_DELETE, new DeleteEvent($submission));
                }
            }

            if (null !== $transaction) {
                $transaction->commit();
            }
        } catch (\Exception $e) {
            if (null !== $transaction) {
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
            )
        ;
    }

    /**
     * Gets all submission data by their ID's
     * And returns it as an associative array.
     */
    public function getAsArray(array $submissionIds): array
    {
        return (new Query())
            ->select('*')
            ->from(Submission::TABLE)
            ->where(['in', 'id', $submissionIds])
            ->all()
        ;
    }

    /**
     * Add a session flash variable that the form has been submitted.
     */
    public function markFormAsSubmitted(Form $form)
    {
        \Craft::$app->session->setFlash(
            Form::SUBMISSION_FLASH_KEY.$form->getId(),
            Freeform::t('Form submitted successfully')
        );
    }

    /**
     * Check for a session flash variable for form submissions.
     */
    public function wasFormFlashSubmitted(Form $form): bool
    {
        return (bool) \Craft::$app->session->getFlash(Form::SUBMISSION_FLASH_KEY.$form->getId(), false);
    }

    /**
     * Either returns an array of allowed form ID's
     * for which the user can edit submissions
     * or NULL if *all* form submissions can be edited.
     *
     * @return null|array
     */
    public function getAllowedSubmissionFormIds()
    {
        if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)) {
            return null;
        }

        return PermissionHelper::getNestedPermissionIds(Freeform::PERMISSION_SUBMISSIONS_MANAGE);
    }

    /**
     * Removes all old submissions according to the submission age set in settings.
     *
     * @param int $age
     *
     * @return array [submissions purged, assets purged]
     */
    public function purgeSubmissions(int $age = null): array
    {
        if (null === $age || $age <= 0 || !Freeform::getInstance()->isPro()) {
            return [0, 0];
        }

        $date = new \DateTime("-{$age} days");
        $date->setTimezone(new \DateTimeZone('UTC'));

        $assetFieldIds = (new Query())
            ->select(['id'])
            ->from(FieldRecord::TABLE)
            ->where(['type' => FieldInterface::TYPE_FILE])
            ->column()
        ;

        $columns = ['id'];
        foreach ($assetFieldIds as $assetFieldId) {
            $columns[] = Submission::getFieldColumnName($assetFieldId);
        }

        $results = $this->findSubmissions()
            ->select($columns)
            ->andWhere(['<', 'dateCreated', $date->format('Y-m-d H:i:s')])
            ->all()
        ;

        $ids = [];
        $assetIds = [];
        foreach ($results as $result) {
            $ids[] = $result['id'];
            unset($result['id']);

            foreach ($result as $values) {
                if (!\is_string($values)) {
                    continue;
                }

                try {
                    $values = \GuzzleHttp\json_decode($values);
                    foreach ($values as $value) {
                        $assetIds[] = $value;
                    }
                } catch (\InvalidArgumentException $e) {
                }
            }
        }

        $deletedSubmissions = 0;

        try {
            $deletedSubmissions = \Craft::$app->db
                ->createCommand()
                ->delete(
                    Element::tableName(),
                    ['id' => $ids]
                )
                ->execute()
            ;
        } catch (\Exception $e) {
        }

        $deletedAssets = 0;
        foreach ($assetIds as $assetId) {
            if (is_numeric($assetId)) {
                try {
                    $asset = AssetRecord::find()->where(['id' => $assetId])->one();
                    if ($asset && $asset->delete()) {
                        ++$deletedAssets;
                    }
                } catch (\Exception $e) {
                }
            }
        }

        return [$deletedSubmissions, $deletedAssets];
    }

    protected function findSubmissions(): Query
    {
        return (new Query())
            ->from(Submission::TABLE)
            ->where(['isSpam' => false])
        ;
    }

    /**
     * Checks if the default set status is valid
     * If it isn't - gets the first one and sets that.
     */
    private function validateAndUpdateStatus(Submission $submission)
    {
        $statusService = Freeform::getInstance()->statuses;
        $statusIds = $statusService->getAllStatusIds();

        if (!\in_array($submission->statusId, $statusIds, false)) {
            $submission->statusId = reset($statusIds);
        }
    }
}
