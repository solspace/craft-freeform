<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\FormOrderHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\FormGroupsEntriesRecord;
use Solspace\Freeform\Records\FormGroupsRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormGroupsService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class FormGroupsController extends BaseApiController
{
    private FormGroupsService $formGroupsService;

    public function __construct(
        $id,
        $module,
        $config,
        private FormTransformer $formTransformer,
        FormGroupsService $formGroupsService
    ) {
        $this->formGroupsService = $formGroupsService;
        parent::__construct($id, $module, $config);
    }

    /**
     * Move one card using the current stored order, preserving forms outside the dashboard's site.
     */
    public function actionMove(): Response
    {
        $this->requirePostRequest();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);
        $freeform = Freeform::getInstance();
        if ($freeform->edition()->isBelow(Freeform::EDITION_LITE)) {
            throw new ForbiddenHttpException('User is not permitted to perform this action');
        }

        $formId = filter_var($this->request->post('formId'), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $beforeId = $this->request->post('beforeId');
        $beforeId = null === $beforeId ? null : filter_var($beforeId, \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $groupUid = $this->request->post('groupUid');
        $siteId = filter_var($this->request->post('siteId'), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$formId || false === $beforeId || !$siteId || (null !== $groupUid && (!\is_string($groupUid) || '' === $groupUid))) {
            throw new BadRequestHttpException('Invalid form move');
        }
        if (!\in_array($siteId, SitesHelper::getEditableSiteIds(), true)) {
            throw new ForbiddenHttpException('User cannot edit this site');
        }
        if (null !== $groupUid && !$freeform->isPro()) {
            throw new ForbiddenHttpException('Form groups require Pro');
        }

        // All dashboard moves share a lock because unassigned ordering is global.
        $mutex = \Craft::$app->getMutex();
        $lock = 'freeform-form-card-move';
        if (!$mutex->acquire($lock, 5)) {
            throw new BadRequestHttpException('Forms are being rearranged. Please try again.');
        }

        try {
            $transaction = \Craft::$app->db->beginTransaction();

            try {
                $site = \Craft::$app->sites->getSiteById($siteId);
                $visibleForms = $this->getFormsService()->getAllNonArchivedForms(sites: SitesHelper::isEnabled() ? $site->handle : null);
                if (!isset($visibleForms[$formId]) || (null !== $beforeId && !isset($visibleForms[$beforeId]))) {
                    throw new BadRequestHttpException('Form is no longer available in this site');
                }

                $groups = $freeform->isPro() ? $this->formGroupsService->getAllFormGroupsBySiteId($siteId) : [];
                $groupIds = array_column($groups, 'id');
                $target = null;
                foreach ($groups as $group) {
                    if ($group['uid'] === $groupUid) {
                        $target = $group;
                    }
                }
                if (null !== $groupUid && null === $target) {
                    throw new BadRequestHttpException('Form group no longer exists');
                }

                if (null !== $target) {
                    $ids = FormGroupsEntriesRecord::find()->select('formId')->where(['groupId' => $target['id']])->orderBy(['order' => \SORT_ASC, 'id' => \SORT_ASC])->column();
                } else {
                    $groupedIds = $groupIds ? FormGroupsEntriesRecord::find()->select('formId')->where(['groupId' => $groupIds])->column() : [];
                    $ids = FormRecord::find()->select('id')->where(['dateArchived' => null])->andWhere(['not in', 'id', $groupedIds])->orderBy(['order' => \SORT_ASC, 'id' => \SORT_ASC])->column();
                }
                $ids = FormOrderHelper::moveBefore($ids, $formId, $beforeId);

                if ($groupIds) {
                    FormGroupsEntriesRecord::deleteAll(['groupId' => $groupIds, 'formId' => $formId]);
                }
                if (null !== $target) {
                    foreach ($ids as $order => $id) {
                        $entry = FormGroupsEntriesRecord::findOne(['groupId' => $target['id'], 'formId' => $id]) ?? new FormGroupsEntriesRecord();
                        $entry->groupId = $target['id'];
                        $entry->formId = $id;
                        $entry->order = $order;
                        if (!$entry->save()) {
                            throw new \RuntimeException('Could not save form position');
                        }
                    }
                } else {
                    // Reinsert only this form into the global order, retaining grouped/archived/other-site forms.
                    $allIds = FormRecord::find()->select('id')->orderBy(['order' => \SORT_ASC, 'id' => \SORT_ASC])->column();
                    $allIds = FormOrderHelper::moveBefore($allIds, $formId, $beforeId);
                    foreach ($allIds as $order => $id) {
                        \Craft::$app->db->createCommand()->update(FormRecord::TABLE, ['order' => $order], ['id' => $id])->execute();
                    }
                }
                $transaction->commit();
            } catch (\Throwable $exception) {
                $transaction->rollBack();

                throw $exception;
            }
        } finally {
            $mutex->release($lock);
        }

        return $this->asEmptyResponse(204);
    }

    protected function post(int|string|null $id = null): array|object|null
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_MANAGE);

        $groups = $this->request->post('groups');
        $siteId = $this->request->post('siteId');

        $transaction = \Craft::$app->db->beginTransaction();

        try {
            if (empty($groups)) {
                $groupIds = FormGroupsRecord::find()
                    ->select('id')
                    ->where(['siteId' => $siteId])
                    ->column()
                ;

                if (!empty($groupIds)) {
                    FormGroupsEntriesRecord::deleteAll(['groupId' => $groupIds]);
                }

                FormGroupsRecord::deleteAll(['siteId' => $siteId]);

                $transaction->commit();

                return null;
            }

            $processedGroupIds = [];
            $processedFormEntryIds = [];

            foreach ($groups as $order => $group) {
                $groupRecord = FormGroupsRecord::findOne([
                    'uid' => $group['uid'],
                    'siteId' => $siteId,
                ]);

                if (!$groupRecord) {
                    $groupRecord = new FormGroupsRecord();
                }

                $groupRecord->uid = $group['uid'] ?? null;
                $groupRecord->siteId = $siteId;
                $groupRecord->label = $group['label'] ?? '';
                $groupRecord->order = $order;

                if (!$groupRecord->save()) {
                    throw new \Exception('Failed to save the form group record');
                }

                $processedGroupIds[] = $groupRecord->id;

                foreach ($group['formIds'] as $formOrder => $formId) {
                    $groupEntryRecord = FormGroupsEntriesRecord::findOne(['groupId' => $groupRecord->id, 'formId' => $formId]);

                    if (!$groupEntryRecord) {
                        $groupEntryRecord = new FormGroupsEntriesRecord();
                    }

                    $groupEntryRecord->groupId = $groupRecord->id;
                    $groupEntryRecord->formId = $formId;
                    $groupEntryRecord->order = $formOrder;

                    if (!$groupEntryRecord->save()) {
                        throw new \Exception('Failed to save the form group entry');
                    }

                    $processedFormEntryIds[] = $groupEntryRecord->id;
                }
            }

            if (!empty($processedGroupIds)) {
                FormGroupsRecord::deleteAll([
                    'and',
                    ['siteId' => $siteId],
                    ['not in', 'id', $processedGroupIds],
                ]);
            }

            if (!empty($processedGroupIds)) {
                FormGroupsEntriesRecord::deleteAll([
                    'and',
                    ['groupId' => $processedGroupIds],
                    ['not in', 'id', $processedFormEntryIds],
                ]);
            }

            $transaction->commit();
        } catch (\Exception $e) {
            if (null !== $transaction) {
                $transaction->rollBack();
            }

            throw $e;
        }

        return null;
    }

    protected function get(): array|object
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);

        $freeform = Freeform::getInstance();
        $currentSite = \Craft::$app->sites->getCurrentSite();
        $sitesEnabled = $freeform->settings->isSitesEnabled();

        $params = $this->request->getQueryParams();
        $siteHandle = $params['siteHandle'] ?? $currentSite->handle;
        $siteId = $params['siteId'] ?? $currentSite->id;

        $site = $sitesEnabled ? $siteHandle : SitesHelper::getCurrentCpPageSiteHandle();

        $allForms = $this->formTransformer->transformList(
            array_values(
                $this->getFormsService()->getAllForms(sites: $site)
            )
        );

        $forms = array_values(
            array_filter(
                $allForms,
                static fn ($form) => null === $form->dateArchived
            )
        );

        $archivedForms = array_values(
            array_filter(
                $allForms,
                static fn ($form) => null !== $form->dateArchived
            )
        );

        $response = (object) [
            'forms' => $forms,
            'formGroups' => null,
            'archivedForms' => $archivedForms,
        ];

        if ($freeform->isPro()) {
            $groupRecords = $this->formGroupsService->getAllFormGroupsBySiteId($siteId);

            $formGroups = ['siteId' => (int) $siteId, 'site' => $siteHandle, 'groups' => []];
            $formIdsInGroups = [];

            foreach ($groupRecords as $groupRecord) {
                $groupFormsEntries = FormGroupsEntriesRecord::find()
                    ->where(['groupId' => $groupRecord['id']])
                    ->orderBy(['order' => \SORT_ASC])
                    ->all()
                ;

                $formIds = array_map(static fn ($entry) => $entry->formId, $groupFormsEntries);
                $formIdsInGroups = array_merge($formIdsInGroups, $formIds);

                $formsById = array_column($forms, null, 'id');
                $groupedForms = array_values(array_filter(array_map(
                    static fn ($formId) => $formsById[$formId] ?? null,
                    $formIds
                )));

                $groupItem = [
                    'uid' => $groupRecord['uid'],
                    'label' => $groupRecord['label'],
                    'formIds' => $formIds,
                    'forms' => $groupedForms,
                ];

                $formGroups['groups'][] = $groupItem;
            }

            $remainingForms = array_values(
                array_filter(
                    $forms,
                    static fn ($form) => !\in_array($form->id, $formIdsInGroups)
                )
            );

            $response->forms = $remainingForms;
            $response->formGroups = $formGroups;
        }

        return $response;
    }
}
