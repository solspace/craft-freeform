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

use Carbon\Carbon;
use craft\db\Query;
use craft\db\Table;
use craft\records\Element;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Bundles\Form\Context\Request\EditSubmissionContext;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\CreateSubmissionFromFormEvent;
use Solspace\Freeform\Events\Submissions\DeleteEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Events\Submissions\SubmitEvent;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\StaticValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Database\SubmissionHandlerInterface;
use yii\base\Event;

class SubmissionsService extends BaseService implements SubmissionHandlerInterface
{
    public const EVENT_BEFORE_SUBMIT = 'beforeSubmit';
    public const EVENT_AFTER_SUBMIT = 'afterSubmit';
    public const EVENT_BEFORE_DELETE = 'beforeDelete';
    public const EVENT_AFTER_DELETE = 'afterDelete';
    public const EVENT_POST_PROCESS = 'postProcess';

    /** @var Submission[] */
    private static array $submissionCache = [];
    private static array $submissionTokenCache = [];

    public function getSubmissionById(int $id): ?Submission
    {
        if (!isset(self::$submissionCache[$id])) {
            self::$submissionCache[$id] = Submission::find()->id($id)->one();
        }

        return self::$submissionCache[$id];
    }

    public function getSubmissionByToken(string $token): ?Submission
    {
        if (!isset(self::$submissionTokenCache[$token])) {
            self::$submissionTokenCache[$token] = Submission::find()->token($token)->one();
        }

        return self::$submissionTokenCache[$token];
    }

    public function getSubmission(int|string|Submission $identificator): ?Submission
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
     */
    public function storeSubmission(Form $form, Submission $submission): bool
    {
        $beforeSubmitEvent = new SubmitEvent($form, $submission);
        $this->trigger(self::EVENT_BEFORE_SUBMIT, $beforeSubmitEvent);

        if (!$beforeSubmitEvent->isValid) {
            return false;
        }

        $updateSearchIndex = (bool) $this->getSettingsService()->getSettingsModel()->updateSearchIndexes;
        if (\Craft::$app->getElements()->saveElement($submission, true, true, $updateSearchIndex)) {
            $this->trigger(self::EVENT_AFTER_SUBMIT, new SubmitEvent($form, $submission));

            return true;
        }

        return false;
    }

    /**
     * {@inheritdoc}
     */
    public function createSubmissionFromForm(Form $form)
    {
        $isNew = true;
        $submission = null;
        $editToken = EditSubmissionContext::getToken($form);

        if (!$form->isMarkedAsSpam()) {
            if ($editToken && Freeform::getInstance()->isPro()) {
                $submission = $this->getSubmissionByToken($editToken);
                $isNew = false;
            }

            if (null === $submission) {
                $submission = Submission::create($form);
            }
        } else {
            $submission = SpamSubmission::create($form);
        }

        $fields = $form->getLayout()->getStorableFields();
        $savableFields = [];
        foreach ($fields as $field) {
            if (!$form->hasFieldBeenSubmitted($field)) {
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
        }

        $dateCreated = new \DateTime();

        $fieldsByHandle = $form->getLayout()->getFieldsByHandle();

        if (!$submission->id) {
            $submission->ip = $form->isIpCollectingEnabled() ? \Craft::$app->request->getUserIP() : null;
            $submission->formId = $form->getId();
            $submission->isSpam = $form->isMarkedAsSpam();
            $submission->dateCreated = $dateCreated;
            $submission->statusId = $form->getDefaultStatus();
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

        Event::trigger(
            Form::class,
            Form::EVENT_CREATE_SUBMISSION,
            new CreateSubmissionFromFormEvent($form, $submission)
        );

        return $submission;
    }

    /**
     * Runs all integrations on submission.
     *
     * @param AbstractField[] $mailingListOptedInFields
     */
    public function postProcessSubmission(Form $form, Submission $submission, array $mailingListOptedInFields)
    {
        $freeform = Freeform::getInstance();

        $integrationsService = $freeform->integrations;
        $connectionsService = $freeform->connections;
        $formsService = $freeform->forms;

        $this->markFormAsSubmitted($form);

        if ($integrationsService->processPayments($submission)) {
            $connectionsService->connect($form, $submission);
            $integrationsService->sendOutEmailNotifications($form, $submission);

            if ($form->hasOptInPermission()) {
                $integrationsService->pushToMailingLists($submission, $mailingListOptedInFields);
                $integrationsService->pushToCRM($submission);
            }
        }

        $event = new ProcessSubmissionEvent($form, $submission);
        Event::trigger(Submission::class, Submission::EVENT_PROCESS_SUBMISSION, $event);

        $formsService->onAfterSubmit($form, $submission);
    }

    public function delete(array $submissions, bool $bypassPermissionCheck = false): bool
    {
        $allowedFormIds = $this->getAllowedWriteFormIds();
        if (!$submissions) {
            return false;
        }

        $transaction = \Craft::$app->getDb()->beginTransaction();
        $deleted = 0;

        try {
            foreach ($submissions as $submission) {
                if (!$bypassPermissionCheck && !\in_array($submission->formId, $allowedFormIds, false)) {
                    continue;
                }

                $submission->enableDeletingByToken();

                $deleteEvent = new DeleteEvent($submission);
                $this->trigger(self::EVENT_BEFORE_DELETE, $deleteEvent);

                if ($deleteEvent->isValid) {
                    \Craft::$app->elements->deleteElementById($submission->id);
                    ++$deleted;

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

        return $deleted > 0;
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
                ['oldStatusId' => $oldStatusId]
            )
        ;
    }

    /**
     * Gets all submission data by their ID's
     * And returns it as an associative array.
     */
    public function getAsArray(array $submissionIds): array
    {
        $formIds = (new Query())
            ->select(['formId'])
            ->distinct('formId')
            ->from(Submission::TABLE)
            ->where(['in', 'id', $submissionIds])
            ->column()
        ;

        $query = (new Query())
            ->select('s.*')
            ->from(Submission::TABLE.' s')
            ->where(['in', 's.id', $submissionIds])
        ;

        $forms = Freeform::getInstance()->forms->getResolvedForms(['id' => $formIds]);
        foreach ($forms as $form) {
            $alias = 'fc'.$form->getId();
            $fields = array_map(
                fn (FieldInterface $field) => $alias.'.[['.Submission::getFieldColumnName($field).']] as '.$field->getHandle(),
                $form->getLayout()->getStorableFields()
            );

            $query->addSelect($fields);
            $query->innerJoin(
                Submission::getContentTableName($form).' '.$alias,
                "{$alias}.[[id]] = s.[[id]]"
            );
        }

        return $query->all();
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

    public function getAllowedWriteFormIds(): array
    {
        if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)) {
            return $this->getFormsService()->getAllFormIds();
        }

        return PermissionHelper::getNestedPermissionIds(Freeform::PERMISSION_SUBMISSIONS_MANAGE);
    }

    public function getAllowedReadFormIds(): array
    {
        if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_READ)) {
            return $this->getFormsService()->getAllFormIds();
        }

        $writeIds = $this->getAllowedWriteFormIds();
        $readIds = PermissionHelper::getNestedPermissionIds(Freeform::PERMISSION_SUBMISSIONS_READ);

        $ids = array_merge($writeIds, $readIds);
        $ids = array_filter($ids);

        return array_unique($ids);
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

        $deletedSubmissions = 0;
        $ids = $this->findSubmissions()
            ->select([Submission::TABLE.'.[[id]]'])
            ->andWhere(['<', Submission::TABLE.'.[[dateCreated]]', $date->format('Y-m-d H:i:s')])
            ->column()
        ;

        $query = Submission::find()
            ->id($ids)
            ->skipContent(true)
        ;

        $count = $query->count();
        if (!$ids || !$count) {
            return [0, 0];
        }

        $assetIds = [];
        foreach ($query->batch() as $results) {
            /** @var Submission $submission */
            foreach ($results as $submission) {
                $uploadFields = $submission->getForm()->getLayout()->getFields(FileUploadInterface::class);
                foreach ($uploadFields as $uploadField) {
                    $value = $submission->{$uploadField->getHandle()}->getValue();
                    if ($value) {
                        $assetIds = [...$assetIds, ...$value];
                    }
                }

                if (\Craft::$app->elements->deleteElement($submission)) {
                    ++$deletedSubmissions;
                }
            }
        }

        $assetIds = array_unique($assetIds);

        $deletedAssets = 0;
        foreach ($assetIds as $assetId) {
            if (is_numeric($assetId)) {
                try {
                    $asset = \Craft::$app->assets->getAssetById($assetId);
                    if ($asset && \Craft::$app->elements->deleteElement($asset)) {
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
        $submissionTable = Submission::TABLE;
        $elementTable = Table::ELEMENTS;

        return (new Query())
            ->from($submissionTable)
            ->innerJoin($elementTable, "{$elementTable}.[[id]] = {$submissionTable}.[[id]]")
            ->where([
                'isSpam' => false,
                "{$elementTable}.[[dateDeleted]]" => null,
            ])
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
