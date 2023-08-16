<?php

namespace Solspace\Freeform\controllers\api\elements;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\controllers\BaseApiController;
use yii\web\Response;

class ElementsController extends BaseApiController
{
    public function actionGetEntryTypes(): Response
    {
        $request = \Craft::$app->getRequest();
        $collection = new OptionCollection();

        $sectionId = $request->get('sectionId');
        if ($sectionId) {
            $section = \Craft::$app->getSections()->getSectionById((int) $sectionId);
            if ($section) {
                foreach ($section->getEntryTypes() as $entryType) {
                    $collection->add($entryType->id, $entryType->name);
                }
            }
        }

        return $this->asSerializedJson($collection);
    }

    public function actionGetFields(): Response
    {
        $collection = new OptionCollection();
        $collection
            ->add('id', 'ID')
            ->add('title', 'Title')
            ->add('slug', 'Slug')
            ->add('uri', 'URI')
        ;

        $request = \Craft::$app->getRequest();

        $sectionId = $request->get('sectionId');
        if (!$sectionId) {
            return $this->asSerializedJson($collection);
        }

        $entryTypeId = $request->get('entryTypeId');
        if ($entryTypeId) {
            $entryType = \Craft::$app->sections->getEntryTypeById($entryTypeId);
            if ($entryType) {
                foreach ($entryType->getFieldLayout()->getCustomFields() as $field) {
                    $collection->add($field->id, $field->name);
                }
            }
        }

        return $this->asSerializedJson($collection);
    }
}
