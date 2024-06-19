<?php

namespace Solspace\Freeform\controllers\api\fields;

use Solspace\Freeform\Bundles\Fields\Types\FieldTypesProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Records\FieldTypeGroupRecord;

class GroupsController extends BaseApiController
{
    private FieldTypesProvider $fieldTypesProvider;

    public function __construct($id, $module, $config, FieldTypesProvider $fieldTypesProvider)
    {
        parent::__construct($id, $module, $config);
        $this->fieldTypesProvider = $fieldTypesProvider;
    }

    protected function post(null|int|string $id = null): null|array|object
    {
        $groups = $this->request->getBodyParam('grouped', []);
        $hiddenTypes = $this->request->getBodyParam('hidden', []);
        FieldTypeGroupRecord::deleteAll();

        $groupRecord = new FieldTypeGroupRecord();
        $groupRecord->label = '__freeform_hidden__';
        $groupRecord->types = json_encode($hiddenTypes);
        $groupRecord->save();

        foreach ($groups as $group) {
            $types = array_values($group['types'] ?? []);

            $groupRecord = new FieldTypeGroupRecord();
            $groupRecord->uid = $group['uid'];
            $groupRecord->label = $group['label'];
            $groupRecord->color = $group['color'];
            $groupRecord->types = $types ? json_encode($types) : '[]';
            $groupRecord->save();
        }

        return null;
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
            $hiddenFieldTypes = [];
            $grouped = [];
            $flattenedAssignedTypes = [];

            foreach ($groups as $group) {
                $decodedTypes = JsonHelper::decode($group['types'], true);
                $values = array_values($decodedTypes);

                $flattenedAssignedTypes = array_merge($flattenedAssignedTypes, $values);

                if ('__freeform_hidden__' === $group['label']) {
                    $hiddenFieldTypes = array_merge($hiddenFieldTypes, $values);

                    continue;
                }

                $array = $group->toArray();
                $array['types'] = array_values($decodedTypes);
                $grouped[] = $array;
            }

            $unassignedTypes = array_diff(
                $types,
                $flattenedAssignedTypes,
                $hiddenFieldTypes
            );

            $response->types = array_values([...$unassignedTypes]);
            $response->groups = (object) [
                'hidden' => $hiddenFieldTypes,
                'grouped' => $grouped,
            ];

            return $response;
        }

        $filteredGroups = array_map(function ($group) use ($types) {
            $groupTypes = JsonHelper::decode($group->types);
            $filteredTypes = array_filter(
                $groupTypes,
                fn ($type) => \in_array($type, $types)
            );

            return (object) [
                'uid' => $group->uid,
                'label' => $group->label,
                'color' => $group->color,
                'types' => array_values($filteredTypes),
            ];
        }, $groups);

        $response->groups['grouped'] = array_values(
            array_filter(
                $filteredGroups,
                fn ($group) => !empty($group->types)
            )
        );

        return $response;
    }
}
