<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\FormGroupsRecord;
use yii\db\Exception;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class GroupsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private FormTransformer $formTransformer,
    ) {
        parent::__construct($id, $module, $config);
    }

    public function actionDelete(): Response
    {
        $this->requirePostRequest();
        $id = $this->request->post('id');
        $site = $this->request->post('site');

        if (!$id || !$site) {
            throw new NotFoundHttpException('No form ID or site provided');
        }

        $removeFormIdFromGroups = function ($groupRecord, $formId) {
            $groups = json_decode($groupRecord->groups, true);

            foreach ($groups as &$group) {
                if (isset($group['formIds'])) {
                    $initialCount = \count($group['formIds']);
                    $group['formIds'] = array_filter(
                        $group['formIds'],
                        fn ($formId) => $formId !== $formId
                    );

                    if (\count($group['formIds']) < $initialCount) {
                        break;
                    }
                }
            }

            $groupRecord->groups = json_encode($groups);

            return $groupRecord->save();
        };

        $allGroupRecords = FormGroupsRecord::find()->all();

        foreach ($allGroupRecords as $groupRecord) {
            if (!$removeFormIdFromGroups($groupRecord, $id)) {
                throw new Exception('Failed to save the updated form group record for site: '.$groupRecord->site);
            }
        }

        return $this->asEmptyResponse(204);
    }

    protected function post(null|int|string $id = null): null|array|object
    {
        $site = $this->request->post('site');
        $groups = $this->request->post('groups');
        $uid = $this->request->post('uid');

        if (!$site) {
            throw new NotFoundHttpException('Site not found');
        }

        $groupRecord = FormGroupsRecord::findOne(['site' => $site]);

        if ($groupRecord) {
            $groupRecord->groups = json_encode($groups);
        } else {
            $groupRecord = new FormGroupsRecord();
            $groupRecord->uid = $uid;
            $groupRecord->site = $site;
            $groupRecord->groups = json_encode($groups);
        }

        if (!$groupRecord->save()) {
            throw new Exception('Failed to save the form group record');
        }

        return null;
    }

    protected function get(): array|object
    {
        $freeform = Freeform::getInstance();
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);
        $site = SitesHelper::getCurrentCpPageSiteHandle();

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
            $groupRecord = FormGroupsRecord::find()
                ->where(['site' => $site])
                ->one()
            ;

            $forms = array_values(
                array_filter(
                    $forms,
                    fn ($form) => null === $form->dateArchived
                )
            );

            if ($groupRecord) {
                $groupData = json_decode($groupRecord->groups, true);

                $formIdMap = [];
                foreach ($forms as $form) {
                    $formIdMap[$form->id] = $form;
                }

                $groupDataWithForms = [];
                $remainingForms = $formIdMap;

                foreach ($groupData as $group) {
                    $groupFormIds = $group['formIds'] ?? [];
                    $groupFormObjects = [];

                    foreach ($groupFormIds as $formId) {
                        if (isset($formIdMap[$formId])) {
                            $groupFormObjects[] = $formIdMap[$formId];
                            unset($remainingForms[$formId]);
                        }
                    }

                    $group['forms'] = $groupFormObjects;
                    $groupDataWithForms[] = $group;
                }

                $response->formGroups = (object) [
                    'uid' => $groupRecord->uid,
                    'site' => $groupRecord->site,
                    'groups' => $groupDataWithForms,
                ];
                $response->forms = array_values($remainingForms);
            }
        }

        return $response;
    }
}
