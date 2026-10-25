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

    protected function post(int|string|null $id = null): array|object|null
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
        $catalogTypes = [...FieldTypesProvider::CONTENT_TYPES, ...FieldTypesProvider::LAYOUT_TYPES, ...FieldTypesProvider::TEMPLATE_TYPES, ...FieldTypesProvider::INTERNAL_TYPES];

        $response = (object) [
            'types' => [],
            'catalogs' => [
                'content' => array_values(array_intersect(FieldTypesProvider::CONTENT_TYPES, $types)),
                'layout' => array_values(array_intersect(FieldTypesProvider::LAYOUT_TYPES, $types)),
                'templates' => array_values(array_intersect(FieldTypesProvider::TEMPLATE_TYPES, $types)),
                'templateDetails' => $freeform->settings->getSettingsModel()->getBuilderTemplateDetails(),
            ],
            'groups' => [
                'hidden' => [],
                'grouped' => [],
            ],
        ];

        $flattenedAssignedTypes = [];

        if ($freeform->isPro()) {
            $hiddenFieldTypes = [];
            $grouped = [];

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
                $hiddenFieldTypes,
                $catalogTypes
            );

            $response->types = array_values([...$unassignedTypes]);
            $response->groups = (object) [
                'hidden' => $hiddenFieldTypes,
                'grouped' => $grouped,
            ];

            return $response;
        }

        $filteredGroups = array_map(static function ($group) use ($types) {
            $groupTypes = JsonHelper::decode($group->types);
            $filteredTypes = array_filter(
                $groupTypes,
                static fn ($type) => \in_array($type, $types)
            );

            return (object) [
                'uid' => $group->uid,
                'label' => $group->label,
                'color' => $group->color,
                'types' => array_values($filteredTypes),
            ];
        }, $groups);

        foreach ($filteredGroups as $group) {
            $flattenedAssignedTypes = array_merge($flattenedAssignedTypes, $group->types);
        }

        $unassignedTypes = array_diff(
            $types,
            $flattenedAssignedTypes,
            $catalogTypes,
        );

        $response->types = array_values([...$unassignedTypes]);
        $response->groups['grouped'] = array_values(
            array_filter(
                $filteredGroups,
                static fn ($group) => !empty($group->types)
            )
        );

        return $response;
    }
}
