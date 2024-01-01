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
        $types = $this->fieldTypesProvider->getRegisteredTypes();
        $groups = FieldTypeGroupRecord::find()->all();

        $hiddenFieldTypes = Freeform::getInstance()->settings->getSettingsModel()->hiddenFieldTypes;

        return (object) [
            'types' => $types,
            'groups' => [
                'hidden' => $hiddenFieldTypes,
                'grouped' => $groups,
            ],
        ];
    }

    protected function put(int|string|null $id = null): array|object|null
    {
        $groups = $this->request->getBodyParam('grouped', []);

        $validUid = [];
        foreach ($groups as $group) {
            $uid = $group['uid'];
            $validUid[] = $uid;

            $groupRecord = FieldTypeGroupRecord::findOne(['uid' => $uid]);

            if (!$groupRecord) {
                $groupRecord = new FieldTypeGroupRecord(['uid' => $uid]);
            }

            // Set properties
            $groupRecord->label = $group['label'];
            $groupRecord->color = $group['color'];
            $groupRecord->types = $group['types'];

            $groupRecord->save();
        }

        // Delete records with uids not in $validUid
        FieldTypeGroupRecord::deleteAll(['not in', 'uid', $validUid]);

        return null;
    }
}
