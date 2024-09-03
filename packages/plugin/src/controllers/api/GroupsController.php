<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\FormGroupsEntriesRecord;
use Solspace\Freeform\Records\FormGroupsRecord;
use Solspace\Freeform\Services\GroupsService;

class GroupsController extends BaseApiController
{
    private GroupsService $groupsService;

    public function __construct(
        $id,
        $module,
        $config,
        private FormTransformer $formTransformer,
        GroupsService $groupsService
    ) {
        $this->groupsService = $groupsService;
        parent::__construct($id, $module, $config);
    }

    protected function post(null|int|string $id = null): null|array|object
    {
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

            if (!empty($processedFormEntryIds)) {
                FormGroupsEntriesRecord::deleteAll([
                    'and',
                    ['groupId' => $processedGroupIds],
                    ['not in', 'id', $processedFormEntryIds],
                ]);
            }

            // Commit the transaction
            $transaction->commit();
        } catch (\Exception $e) {
            // Rollback the transaction in case of an error
            if (null !== $transaction) {
                $transaction->rollBack();
            }

            throw $e;
        }

        return null;
    }

    protected function get(): array|object
    {
        $freeform = Freeform::getInstance();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);
        $params = $this->request->getQueryParams();
        $site = $params['siteHandle'] ?? null;
        $siteId = $params['siteId'] ?? null;

        $allForms = $this->formTransformer->transformList(
            array_values(
                $this->getFormsService()->getAllForms(sites: $site)
            )
        );

        $forms = array_values(
            array_filter(
                $allForms,
                fn ($form) => null === $form->dateArchived
            )
        );

        $archivedForms = array_values(
            array_filter(
                $allForms,
                fn ($form) => null !== $form->dateArchived
            )
        );

        $response = (object) [
            'forms' => $forms,
            'formGroups' => null,
            'archivedForms' => $archivedForms,
        ];

        if ($freeform->isPro()) {
            $groupRecords = $this->groupsService->getAllGroupsBySiteId($siteId);

            $formGroups = ['groups' => []];
            $formIdsInGroups = [];

            foreach ($groupRecords as $groupRecord) {
                $groupFormsEntries = FormGroupsEntriesRecord::find()
                    ->where(['groupId' => $groupRecord['id']])
                    ->orderBy(['order' => \SORT_ASC])
                    ->all()
                ;

                $formIds = array_map(fn ($entry) => $entry->formId, $groupFormsEntries);
                $formIdsInGroups = array_merge($formIdsInGroups, $formIds);

                $groupedForms = array_values(
                    array_filter(
                        $forms,
                        fn ($form) => \in_array($form->id, $formIds)
                    )
                );

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
                    fn ($form) => !\in_array($form->id, $formIdsInGroups)
                )
            );

            $response->forms = $remainingForms;
            $response->formGroups = $formGroups;
        }

        return $response;
    }
}
