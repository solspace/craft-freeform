<?php

namespace Solspace\Freeform\controllers\api\elements;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class TagController extends BaseApiController
{
    public function actionGetFields(): Response
    {
        $collection = new OptionCollection();
        $collection
            ->add('id', 'ID')
            ->add('title', 'Title')
        ;

        $request = \Craft::$app->getRequest();

        $groupId = $request->get('groupId');
        if (!$groupId) {
            return $this->asSerializedJson($collection);
        }

        $group = \Craft::$app->tags->getTagGroupById($groupId);
        if ($group) {
            foreach ($group->getFieldLayout()->getCustomFields() as $field) {
                $collection->add($field->handle, $field->name);
            }
        }

        return $this->asSerializedJson($collection);
    }
}
