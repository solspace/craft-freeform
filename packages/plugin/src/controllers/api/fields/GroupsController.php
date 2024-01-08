<?php

namespace Solspace\Freeform\controllers\api\fields;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Records\FieldTypeGroupRecord;

class GroupsController extends BaseApiController
{
    private FieldTypesProvider $fieldTypesProvider;

    public function __construct($id, $module, $config = [], FieldTypesProvider $fieldTypesProvider)
    {
        parent::__construct($id, $module, $config);
        $this->fieldTypesProvider = $fieldTypesProvider;
    }

    protected function get(): object
    {
        $freeform = Freeform::getInstance();
        $groups = FieldTypeGroupRecord::find()->all();
        $types = $this->fieldTypesProvider->getRegisteredTypes();

        $response = (object) [
            'types' => [],
            'groups' => [
                'hidden' => [],
                'grouped' => [],
            ],
        ];

        if ($freeform->isPro()) {
            $hiddenFieldTypes = $freeform->settings->getSettingsModel()->hiddenFieldTypes;
            $unassignedTypes = array_diff($types, array_merge(...array_column($groups, 'types')), $hiddenFieldTypes);

            $response->types = [...$unassignedTypes];
            $response->groups = (object) [
                'hidden' => $hiddenFieldTypes,
                'grouped' => $groups,
            ];

            return $response;
        }

        $filteredGroups = array_map(function ($group) use ($types) {
            $filteredTypes = array_filter($group->types, function ($type) use ($types) {
                return \in_array($type, $types);
            });

            return (object) [
                'uid' => $group->uid,
                'label' => $group->label,
                'color' => $group->color,
                'types' => $filteredTypes,
            ];
        }, $groups);

        $response->groups['grouped'] = array_values(array_filter($filteredGroups, function ($group) {
            return !empty($group->types);
        }));

        return $response;
    }

    protected function put(null|int|string $id = null): null|array|object
    {
        $groups = $this->request->getBodyParam('grouped', []);
        $hiddenTypes = $this->request->getBodyParam('hidden', []);
        FieldTypeGroupRecord::deleteAll();

        foreach ($groups as $group) {
            $groupRecord = new FieldTypeGroupRecord();
            $groupRecord->uid = $group['uid'];
            $groupRecord->label = $group['label'];
            $groupRecord->color = $group['color'];
            $groupRecord->types = $group['types'];
            $groupRecord->save();
        }

        $this->getSettingsService()->saveSettings(['hiddenFieldTypes' => $hiddenTypes]);

        return null;
    }
}
